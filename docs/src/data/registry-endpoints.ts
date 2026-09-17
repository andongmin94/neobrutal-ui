const DEFAULT_REGISTRY_BASE_URL = "https://neobrutal-ui.andongmin.com";

const configuredRegistryBaseUrl = import.meta.env?.VITE_REGISTRY_BASE_URL;

export const REGISTRY_BASE_URL = new URL(
  configuredRegistryBaseUrl || DEFAULT_REGISTRY_BASE_URL,
)
  .toString()
  .replace(/\/$/, "");

export function registryItemUrl(name: string) {
  const itemName = name.replace(/\.json$/, "");
  return `${REGISTRY_BASE_URL}/r/${itemName}.json`;
}

export function registryInstallCommand(...names: string[]) {
  if (names.length === 0) throw new Error("At least one registry item is required.");
  return `npx shadcn@latest add ${names.map(registryItemUrl).join(" ")}`;
}
