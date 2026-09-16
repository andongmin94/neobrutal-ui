import type { ComponentType } from "react";

type PreviewModule = { default: ComponentType };
type PreviewLoader = () => Promise<PreviewModule>;

type Component = {
  name: string;
  exampleComponent: PreviewLoader;
  examples?: Record<string, PreviewLoader>;
};

const defaultExampleByComponent: Record<string, string> = {
  chart: "chart-area-stacked",
  sidebar: "page",
};

const previewModules = import.meta.glob<PreviewModule>("../examples/ui/**/*.tsx");
const components = new Map<
  string,
  {
    exampleComponent?: PreviewLoader;
    examples: Record<string, PreviewLoader>;
  }
>();

function getPreviewIdentity(modulePath: string) {
  const marker = "/examples/ui/";
  const markerIndex = modulePath.indexOf(marker);

  if (markerIndex < 0) {
    throw new Error(`Preview module is outside the UI example directory: ${modulePath}`);
  }

  const relativePath = modulePath.slice(markerIndex + marker.length).replace(/\.tsx$/, "");
  const [component, ...segments] = relativePath.split("/");

  if (!component) {
    throw new Error(`Preview module has no component slug: ${modulePath}`);
  }

  return {
    component,
    example: segments.join("/"),
  };
}

for (const [modulePath, loader] of Object.entries(previewModules).sort(([a], [b]) =>
  a.localeCompare(b),
)) {
  const { component, example } = getPreviewIdentity(modulePath);
  const entry = components.get(component) ?? { examples: {} };
  const isDefault =
    example === "" || example === "index" || defaultExampleByComponent[component] === example;

  if (isDefault) {
    if (entry.exampleComponent) {
      throw new Error(`Multiple default previews are registered for ${component}.`);
    }
    entry.exampleComponent = loader;
  } else {
    if (entry.examples[example]) {
      throw new Error(`Duplicate preview ${component}/${example}.`);
    }
    entry.examples[example] = loader;
  }

  components.set(component, entry);
}

const COMPONENTS: Component[] = [...components.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, entry]) => {
    if (!entry.exampleComponent) {
      throw new Error(`No default preview is registered for ${name}.`);
    }

    return {
      name,
      exampleComponent: entry.exampleComponent,
      ...(Object.keys(entry.examples).length ? { examples: entry.examples } : {}),
    };
  });

export default COMPONENTS;
