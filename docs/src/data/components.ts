import type { ComponentType } from "react";

import { getPreviewIdentity } from "@/data/preview-registry";

type PreviewModule = { default: ComponentType };
type PreviewLoader = () => Promise<PreviewModule>;

type Component = {
  name: string;
  exampleComponent: PreviewLoader;
  examples?: Record<string, PreviewLoader>;
};

const previewModules = import.meta.glob<PreviewModule>([
  "../examples/ui/**/*.tsx",
  "!../examples/ui/**/_*.tsx",
]);
const components = new Map<
  string,
  {
    exampleComponent?: PreviewLoader;
    examples: Record<string, PreviewLoader>;
  }
>();

for (const [modulePath, loader] of Object.entries(previewModules).sort(([a], [b]) =>
  a.localeCompare(b),
)) {
  const { component, example } = getPreviewIdentity(modulePath);
  const entry = components.get(component) ?? { examples: {} };

  if (!example) {
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
