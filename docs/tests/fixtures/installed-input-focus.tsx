import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { fileURLToPath } from "node:url";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from "../../src/components/ui/input-group";
import { serializeThemeCss } from "../../src/data/theme-styles";

{
  const base = fileURLToPath(new URL("../..", import.meta.url));
  const scanner = new Scanner({
    sources: [
      {
        base: fileURLToPath(new URL("../../src/components/ui", import.meta.url)),
        pattern: "**/*",
        negated: false,
      },
    ],
  });
  const compiler = await compile(serializeThemeCss(), {
    base,
    onDependency() {},
    customCssResolver: async (id) =>
      id === "shadcn/tailwind.css"
        ? fileURLToPath(
            new URL("../../../registry/node_modules/shadcn/dist/tailwind.css", import.meta.url),
          )
        : undefined,
  });
  const css = compiler.build(scanner.scan());
  const html = renderToStaticMarkup(
    <main style={{ padding: 20, width: 280 }}>
      <button id="start">Start</button>
      <label htmlFor="file">File</label>
      <Input id="file" type="file" />
      <label htmlFor="email">Email</label>
      <Input id="email" type="email" />
      <label htmlFor="notes">Notes</label>
      <Textarea id="notes" />
      <label htmlFor="group">Search</label>
      <InputGroup>
        <InputGroupInput id="group" />
      </InputGroup>
      <label htmlFor="group-notes">Group notes</label>
      <InputGroup>
        <InputGroupTextarea id="group-notes" />
      </InputGroup>
    </main>,
  );
  console.log(JSON.stringify({ css, html }));
}
