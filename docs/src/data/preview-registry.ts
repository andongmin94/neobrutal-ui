export type PreviewIdentity = {
  component: string;
  example?: string;
};

const defaultPreviewFileByComponent: Record<string, string> = {
  chart: "chart-area-stacked",
  sidebar: "page",
};

export function getPreviewIdentity(sourcePath: string): PreviewIdentity {
  const normalizedPath = sourcePath.replaceAll("\\", "/").replace(/\.tsx$/, "");
  const marker = "/examples/ui/";
  const markerIndex = normalizedPath.indexOf(marker);
  const relativePath =
    markerIndex >= 0
      ? normalizedPath.slice(markerIndex + marker.length)
      : normalizedPath.replace(/^\.\//, "");
  const [component, ...segments] = relativePath.split("/");

  if (!component) throw new Error(`Preview source has no component slug: ${sourcePath}`);

  const example = segments.join("/");
  const isDefault =
    example === "" || example === "index" || defaultPreviewFileByComponent[component] === example;

  return {
    component,
    ...(isDefault ? {} : { example }),
  };
}

export function previewKey({ component, example }: PreviewIdentity) {
  return `${component}:${example ?? "default"}`;
}
