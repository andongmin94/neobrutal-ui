import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import ts from "@typescript/typescript6";

import {
  COMPONENT_DIRECTORY_LINKS,
  COMPOSITION_RECIPE_SLUGS,
  getComponentInstallMode,
} from "../src/data/component-directory";

type Literal = string | number | boolean | null | Literal[] | { [key: string]: Literal };
type Component = { slug: string; files: string[] };
export type DocsApiInputs = {
  components: Component[];
  directorySlugs: string[];
  recipeSlugs: Set<string>;
  sources: Map<string, string>;
  documents: Map<string, string>;
  nativeDefaults: Map<string, Default[]>;
};
type Default = { component: string; prop: string; value: Literal; source: string };
type Enum = { component: string; prop: string; values: string[]; source: string };
type ApiRow = {
  props: string[];
  purpose: string;
  defaults: (string | undefined)[];
  defaultText: string;
  line: string;
};

export function readDocsApiInputs(): DocsApiInputs {
  const catalog = JSON.parse(fs.readFileSync("../registry/registry.json", "utf8")) as {
    items: { name: string; type: string; categories?: string[]; files?: { path: string }[] }[];
  };
  const components = catalog.items
    .filter((item) => item.type === "registry:ui" || item.categories?.includes("recipe"))
    .map((item) => {
      const files = (item.files ?? []).map((file) => file.path);
      assert.ok(files.length, `${item.name}: API audit has no canonical source files`);
      for (const file of files)
        assert.ok(
          /^src\/.*\.tsx?$/.test(file),
          `${item.name}: unsupported canonical API source path ${file}`,
        );
      return { slug: item.name, files };
    });
  const directorySlugs = COMPONENT_DIRECTORY_LINKS.map(({ href }) => href.split("/").pop()!);
  const inputs: DocsApiInputs = {
    components,
    directorySlugs,
    recipeSlugs: new Set(
      directorySlugs.filter((slug) => getComponentInstallMode(slug) === "Recipe"),
    ),
    sources: new Map(
      [...new Set(components.flatMap((component) => component.files))].map((file) => [
        file,
        fs.readFileSync(`../registry/${file}`, "utf8"),
      ]),
    ),
    documents: new Map(
      directorySlugs.map((slug) => [slug, fs.readFileSync(`content/docs/${slug}.mdx`, "utf8")]),
    ),
    nativeDefaults: new Map(),
  };
  inputs.nativeDefaults = readNativeDefaults(inputs.sources);
  return inputs;
}

function readNativeDefaults(sources: Map<string, string>): Map<string, Default[]> {
  const configPath = path.resolve("../registry/tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  assert.ok(!config.error, "Cannot read canonical registry type configuration");
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  assert.equal(parsed.errors.length, 0, "Cannot parse canonical registry type configuration");
  const program = ts.createProgram(
    [...sources.keys()].map((file) => path.resolve("../registry", file)),
    parsed.options,
  );
  const checker = program.getTypeChecker();
  const result = new Map<string, Default[]>();
  for (const [file, text] of sources) {
    const source = program.getSourceFile(path.resolve("../registry", file));
    assert.ok(source, `${file}: native API type source is missing`);
    const components = new Set(extractSourceContracts(file, text, sources).components);
    const defaults: Default[] = [];
    function addDefaults(
      component: string,
      declaration: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression,
    ) {
      const parameter = declaration.parameters[0];
      if (!parameter) return;
      const properties = checker.getTypeAtLocation(parameter).getProperties();
      for (const property of properties)
        for (const tag of property.getJsDocTags(checker)) {
          if (tag.name !== "default") continue;
          const documented = tag.text
            ?.map((part) => part.text)
            .join("")
            .trim();
          if (!documented) continue;
          const statement = ts.createSourceFile(
            "native-default.ts",
            `(${documented})`,
            ts.ScriptTarget.Latest,
            true,
          ).statements[0];
          if (!statement || !ts.isExpressionStatement(statement)) continue;
          try {
            // Only native literal @default tags are contracts; prose and expressions stay unverified.
            const value = literal(statement.expression, new Map());
            defaults.push({
              component,
              prop: property.name,
              value,
              source: property.declarations?.[0]?.getSourceFile().fileName ?? file,
            });
          } catch {
            continue;
          }
        }
    }
    for (const statement of source.statements) {
      if (
        ts.isFunctionDeclaration(statement) &&
        statement.name &&
        components.has(statement.name.text)
      )
        addDefaults(statement.name.text, statement);
      if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          if (
            ts.isIdentifier(declaration.name) &&
            components.has(declaration.name.text) &&
            declaration.initializer &&
            (ts.isArrowFunction(declaration.initializer) ||
              ts.isFunctionExpression(declaration.initializer))
          )
            addDefaults(declaration.name.text, declaration.initializer);
    }
    result.set(file, defaults);
  }
  return result;
}

function propertyName(node: ts.PropertyName | ts.BindingName) {
  assert.ok(ts.isIdentifier(node) || ts.isStringLiteral(node), "Unsupported API property name");
  return node.text;
}

function literal(
  node: ts.Expression,
  constants: Map<string, ts.Expression>,
  seen = new Set<string>(),
): Literal {
  if (
    ts.isAsExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isSatisfiesExpression(node)
  )
    return literal(node.expression, constants, seen);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const value = literal(node.operand, constants, seen);
    assert.equal(typeof value, "number", "Non-numeric negated API default");
    return -(value as number);
  }
  if (ts.isIdentifier(node)) {
    assert.ok(!seen.has(node.text), `Circular API default: ${node.text}`);
    const value = constants.get(node.text);
    assert.ok(value, `API default is not a local literal constant: ${node.text}`);
    return literal(value, constants, new Set([...seen, node.text]));
  }
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((element) => literal(element as ts.Expression, constants, seen));
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.map((property) => {
        assert.ok(ts.isPropertyAssignment(property), "Non-literal object API default");
        return [propertyName(property.name), literal(property.initializer, constants, seen)];
      }),
    );
  throw new Error(`Unsupported source-owned API default: ${node.getText()}`);
}

function literalText(value: Literal): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function matchesDefault(documented: string, value: Literal): boolean {
  if (documented === literalText(value)) return true;
  // Object/array defaults may use readable TypeScript object syntax in the table.
  const expression = ts.createSourceFile(
    "default.ts",
    `(${documented})`,
    ts.ScriptTarget.Latest,
    true,
  );
  const statement = expression.statements[0];
  if (!statement || !ts.isExpressionStatement(statement)) return false;
  try {
    return isDeepStrictEqual(literal(statement.expression, new Map()), value);
  } catch {
    return false;
  }
}

function objectProperty(object: ts.ObjectLiteralExpression, name: string) {
  return object.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && propertyName(property.name) === name,
  )?.initializer;
}

function stringUnion(node: ts.TypeNode): string[] | undefined {
  if (!ts.isUnionTypeNode(node)) return undefined;
  const values = node.types.map((part) =>
    ts.isLiteralTypeNode(part) && ts.isStringLiteral(part.literal) ? part.literal.text : undefined,
  );
  return values.every((value) => value !== undefined) ? (values as string[]) : undefined;
}

function extractSourceContracts(file: string, text: string, sources: Map<string, string>) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map<string, ts.Expression>();
  const aliases = new Map<string, ts.TypeNode>();
  const exports = new Set<string>();
  const imports = new Map<string, string>();
  const functions = new Map<
    string,
    ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression
  >();

  for (const statement of source.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    )
      for (const element of statement.exportClause.elements)
        exports.add(element.propertyName?.text ?? element.name.text);
    if (ts.isTypeAliasDeclaration(statement)) aliases.set(statement.name.text, statement.type);
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const clause = statement.importClause?.namedBindings;
      if (clause && ts.isNamedImports(clause))
        for (const element of clause.elements) {
          const path = statement.moduleSpecifier.text.replace(/^@\//, "src/");
          if (element.propertyName) continue;
          for (const extension of [".ts", ".tsx"])
            if (sources.has(path + extension)) imports.set(element.name.text, path + extension);
        }
    }
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      functions.set(statement.name.text, statement);
      if (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
        exports.add(statement.name.text);
    }
    if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        constants.set(declaration.name.text, declaration.initializer);
        if (
          ts.isArrowFunction(declaration.initializer) ||
          ts.isFunctionExpression(declaration.initializer)
        )
          functions.set(declaration.name.text, declaration.initializer);
        if (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
          exports.add(declaration.name.text);
      }
  }

  const defaults: Default[] = [];
  const enums: Enum[] = [];
  const components = [...exports].filter((name) => /^[A-Z]/.test(name) && functions.has(name));
  for (const name of exports) {
    const initializer = constants.get(name);
    if (!/^[A-Z]/.test(name) || functions.has(name) || !initializer) continue;
    function checkUnsupportedDefaults(node: ts.Node) {
      assert.ok(
        !ts.isBindingElement(node) || !node.initializer,
        `${file}: ${name} has an unsupported wrapped component default`,
      );
      ts.forEachChild(node, checkUnsupportedDefaults);
    }
    checkUnsupportedDefaults(initializer);
  }

  function addEnums(component: string, node: ts.TypeNode, seen = new Set<string>()) {
    if (ts.isIntersectionTypeNode(node))
      for (const part of node.types) addEnums(component, part, seen);
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      const alias = aliases.get(node.typeName.text);
      if (alias && !seen.has(node.typeName.text))
        addEnums(component, alias, new Set([...seen, node.typeName.text]));
    }
    if (ts.isTypeLiteralNode(node))
      for (const property of node.members) {
        if (!ts.isPropertySignature(property) || !property.type) continue;
        const values = stringUnion(property.type);
        if (values)
          enums.push({ component, prop: propertyName(property.name), values, source: file });
      }
  }

  for (const component of components) {
    const declaration = functions.get(component)!;
    const bindings = new Map<string, string>();
    for (const parameter of declaration.parameters) {
      assert.ok(
        !parameter.initializer,
        `${file}: ${component} uses an unsupported whole-props default`,
      );
      if (parameter.type) addEnums(component, parameter.type);
      if (!ts.isObjectBindingPattern(parameter.name)) continue;
      for (const binding of parameter.name.elements) {
        assert.ok(
          ts.isIdentifier(binding.name),
          `${file}: ${component} uses an unsupported nested prop binding`,
        );
        if (ts.isIdentifier(binding.name) && !binding.dotDotDotToken)
          bindings.set(binding.name.text, propertyName(binding.propertyName ?? binding.name));
        if (!binding.initializer) continue;
        const prop = propertyName(binding.propertyName ?? binding.name);
        defaults.push({
          component,
          prop,
          value: literal(binding.initializer, constants),
          source: file,
        });
      }
    }

    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const name = node.expression.text;
        const imported = imports.get(name);
        const variantSource = imported
          ? ts.createSourceFile(imported, sources.get(imported)!, ts.ScriptTarget.Latest, true)
          : source;
        let initializer = constants.get(name);
        if (imported)
          for (const statement of variantSource.statements)
            if (ts.isVariableStatement(statement))
              for (const variable of statement.declarationList.declarations)
                if (ts.isIdentifier(variable.name) && variable.name.text === name)
                  initializer = variable.initializer;
        if (
          initializer &&
          ts.isCallExpression(initializer) &&
          ts.isIdentifier(initializer.expression) &&
          initializer.expression.text === "cva"
        ) {
          const argument = node.arguments[0];
          assert.ok(
            !argument || ts.isObjectLiteralExpression(argument),
            `${file}: unsupported CVA prop argument in ${component}`,
          );
          const exposed = new Map<string, string>();
          for (const property of argument?.properties ?? []) {
            const value = ts.isShorthandPropertyAssignment(property)
              ? property.name
              : ts.isPropertyAssignment(property)
                ? property.initializer
                : undefined;
            if (value && ts.isIdentifier(value) && bindings.has(value.text))
              exposed.set(propertyName(property.name!), bindings.get(value.text)!);
          }
          const options = initializer.arguments[1];
          if (options && ts.isObjectLiteralExpression(options)) {
            const variants = objectProperty(options, "variants");
            if (variants && ts.isObjectLiteralExpression(variants))
              for (const property of variants.properties) {
                if (
                  !ts.isPropertyAssignment(property) ||
                  !ts.isObjectLiteralExpression(property.initializer)
                )
                  continue;
                const prop = exposed.get(propertyName(property.name));
                if (!prop) continue;
                if (!enums.some((entry) => entry.component === component && entry.prop === prop))
                  enums.push({
                    component,
                    prop,
                    values: property.initializer.properties.map((entry) =>
                      propertyName(entry.name!),
                    ),
                    source: imported ?? file,
                  });
              }
            const variantDefaults = objectProperty(options, "defaultVariants");
            if (variantDefaults && ts.isObjectLiteralExpression(variantDefaults))
              for (const property of variantDefaults.properties) {
                assert.ok(ts.isPropertyAssignment(property), "Unsupported CVA default declaration");
                const prop = exposed.get(propertyName(property.name));
                if (!prop) continue;
                // A wrapper passes its own initialized value, so it owns the public default.
                if (!defaults.some((entry) => entry.component === component && entry.prop === prop))
                  defaults.push({
                    component,
                    prop,
                    value: literal(property.initializer, constants),
                    source: imported ?? file,
                  });
              }
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    if (declaration.body) visit(declaration.body);
  }
  return { defaults, enums, components, source };
}

function parseApiRows(slug: string, document: string, root: string | undefined): ApiRow[] {
  const section = document.split(/^## API reference\s*$/m)[1]?.split(/^## /m)[0];
  assert.ok(section, `${slug}: missing API reference section`);
  const rows: ApiRow[] = [];
  for (const line of section.split("\n")) {
    if (!line.startsWith("| ") || line.startsWith("| ---") || /\| Purpose \|/.test(line)) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    assert.ok(
      cells.length === 2 || cells.length === 3,
      `${slug}: unsupported API table row: ${line}`,
    );
    let component = root;
    const props = [...cells[0].matchAll(/`([^`]+)`/g)].flatMap((match) => {
      const [part, prop] = match[1].split(".");
      if (prop) {
        component = part;
        return [`${component}.${prop}`];
      }
      return /^[a-z]/.test(part) && component ? [`${component}.${part}`] : [];
    });
    const defaultText = cells[2] ?? "";
    const defaults = defaultText
      .split(/\s+\/\s+/)
      .map(
        (part) =>
          part.match(/`([^`]+)`/)?.[1] ??
          (/^(?:true|false|null|-?\d+(?:\.\d+)?)$/.test(part) ? part : undefined),
      );
    rows.push({ props, purpose: cells[1], defaults, defaultText, line });
  }
  assert.ok(rows.length, `${slug}: empty API reference table`);
  return rows;
}

export function verifyDocsApi(inputs: DocsApiInputs) {
  assert.deepEqual(
    [...inputs.directorySlugs].sort(),
    [...inputs.components.map(({ slug }) => slug), ...COMPOSITION_RECIPE_SLUGS].sort(),
    "API audit directory and registry inventory differ",
  );
  const contracts = new Map(
    [...inputs.sources].map(([file, source]) => [
      file,
      extractSourceContracts(file, source, inputs.sources),
    ]),
  );
  const counts = {
    pages: 0,
    sourceDefaults: 0,
    enumContracts: 0,
    sourceDefaultRows: 0,
    nativeDefaults: 0,
    nativeDefaultRows: 0,
    otherApiRows: 0,
    recipeRows: 0,
  };
  for (const slug of inputs.directorySlugs) {
    const item = inputs.components.find((component) => component.slug === slug);
    const owned = (item?.files ?? []).map((file) => {
      const contract = contracts.get(file);
      assert.ok(contract, `${slug}: API audit is missing canonical source ${file}`);
      return contract;
    });
    const root = owned
      .flatMap((contract) => contract.components)
      .find((name) => name.toLowerCase() === slug.replaceAll("-", ""));
    const document = inputs.documents.get(slug);
    assert.ok(document, `${slug}: missing documentation in API audit`);
    const rows = parseApiRows(slug, document, root);
    counts.pages++;
    if (inputs.recipeSlugs.has(slug)) counts.recipeRows += rows.length;
    const verifiedRows = new Set<ApiRow>();
    const defaults = owned.flatMap((contract) => contract.defaults);
    for (const entry of defaults) {
      const key = `${entry.component}.${entry.prop}`;
      const matching = rows.filter((row) => row.props.includes(key));
      assert.equal(
        matching.length,
        1,
        `${slug}: ${key} needs exactly one API row for source-owned default ${literalText(entry.value)} (${entry.source})`,
      );
      const row = matching[0];
      assert.ok(
        row.defaults.length === 1 || row.defaults.length === row.props.length,
        `${slug}: ambiguous grouped defaults for ${key}: ${row.line}`,
      );
      const documented =
        row.defaults.length === 1 ? row.defaults[0] : row.defaults[row.props.indexOf(key)];
      assert.ok(
        documented !== undefined && matchesDefault(documented, entry.value),
        `${slug}: ${key} documents ${documented ?? row.defaultText}, canonical source default is ${literalText(entry.value)} (${entry.source})`,
      );
      verifiedRows.add(row);
      counts.sourceDefaults++;
    }
    for (const entry of owned.flatMap((contract) => contract.enums)) {
      // Only enums belonging to source-owned defaults are part of this bounded contract.
      if (
        !defaults.some((value) => value.component === entry.component && value.prop === entry.prop)
      )
        continue;
      const key = `${entry.component}.${entry.prop}`;
      const row = rows.find((value) => value.props.includes(key))!;
      const documented = [...row.purpose.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
      const allowed = new Set(
        owned
          .flatMap((contract) => contract.enums)
          .filter((value) => row.props.includes(`${value.component}.${value.prop}`))
          .flatMap((value) => value.values),
      );
      assert.deepEqual(
        [...new Set(documented)].sort(),
        [...allowed].sort(),
        `${slug}: ${key} API enum values differ from canonical source (${entry.source})`,
      );
      counts.enumContracts++;
    }
    counts.sourceDefaultRows += verifiedRows.size;
    const nativeRows = new Set<ApiRow>();
    for (const entry of (item?.files ?? []).flatMap(
      (file) => inputs.nativeDefaults.get(file) ?? [],
    )) {
      const key = `${entry.component}.${entry.prop}`;
      if (
        defaults.some((value) => value.component === entry.component && value.prop === entry.prop)
      )
        continue;
      for (const row of rows.filter((value) => value.props.includes(key))) {
        if (row.defaults.length !== 1 && row.defaults.length !== row.props.length) continue;
        const documented =
          row.defaults.length === 1 ? row.defaults[0] : row.defaults[row.props.indexOf(key)];
        if (documented === undefined) continue;
        assert.ok(
          matchesDefault(documented, entry.value),
          `${slug}: ${key} documents ${documented}, native @default is ${literalText(entry.value)} (${entry.source})`,
        );
        counts.nativeDefaults++;
        nativeRows.add(row);
      }
    }
    counts.nativeDefaultRows += nativeRows.size;
    for (const row of nativeRows) verifiedRows.add(row);
    if (!inputs.recipeSlugs.has(slug)) counts.otherApiRows += rows.length - verifiedRows.size;
  }

  // This decorative default is a fixed JSX child, rather than a prop initializer.
  const otp = contracts.get("src/components/ui/input-otp.tsx");
  assert.ok(otp, "API audit is missing InputOTP source");
  const separator = otp.source.statements.find(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === "InputOTPSeparator",
  );
  assert.ok(separator?.body, "InputOTPSeparator implementation is missing");
  const icons: string[] = [];
  function visitSeparator(node: ts.Node) {
    if (
      ts.isJsxSelfClosingElement(node) &&
      ts.isIdentifier(node.tagName) &&
      /^[A-Z]/.test(node.tagName.text)
    )
      icons.push(node.tagName.text);
    ts.forEachChild(node, visitSeparator);
  }
  visitSeparator(separator.body);
  assert.equal(icons.length, 1, "InputOTPSeparator must have one static icon child");
  let iconName: string | undefined;
  for (const statement of otp.source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "lucide-react"
    )
      continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      iconName =
        bindings.elements.find((element) => element.name.text === icons[0])?.propertyName?.text ??
        bindings.elements.find((element) => element.name.text === icons[0])?.name.text;
  }
  assert.ok(iconName, "InputOTPSeparator static child is not a named Lucide icon import");
  const iconDefault = iconName.replace(/Icon$/, "");
  const otpRows = parseApiRows("input-otp", inputs.documents.get("input-otp")!, "InputOTP");
  const iconRow = otpRows.find((row) => /`InputOTPSeparator`/.test(row.line));
  assert.equal(
    iconRow?.defaultText.replaceAll("`", ""),
    iconDefault,
    `InputOTPSeparator API must document its canonical ${iconDefault} icon`,
  );
  return counts;
}
