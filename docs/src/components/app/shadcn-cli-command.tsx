import { Pre } from "./pre";

const REGISTRY_BASE_URL =
  process.env.NEXT_PUBLIC_REGISTRY_BASE_URL || "https://neobrutal-ui.andongmin.com";

export default function ShadcnCliCommand({ component }: { component: string }) {
  const itemUrl = `${REGISTRY_BASE_URL}/r/${component}.json`;
  const npmCommand = `npx shadcn@latest add ${itemUrl}`;

  return (
    <Pre __rawstring__={npmCommand} data-language="bash">
      <code>
        <span className="font-bold text-white">npx</span>
        <span className="text-white/[0.53]">{` shadcn@latest add ${itemUrl}`}</span>
      </code>
    </Pre>
  );
}
