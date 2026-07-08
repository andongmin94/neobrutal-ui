import { sharedComponents } from "./mdx-components"
import { Pre } from "./pre"

const REGISTRY_BASE_URL =
  process.env.NEXT_PUBLIC_REGISTRY_BASE_URL ||
  "https://neobrutal-ui.andongmin.com"

export default function ShadcnCliCommand({ component }: { component: string }) {
  const { Tabs, TabsContent, TabsList, TabsTrigger } = sharedComponents

  const itemUrl = `${REGISTRY_BASE_URL}/r/${component}.json`
  const pnpmCommand = `pnpm dlx shadcn@latest add ${itemUrl}`
  const npmCommand = `npx shadcn@latest add ${itemUrl}`
  const yarnCommand = `npx shadcn@latest add ${itemUrl}`
  const bunCommand = `bunx --bun shadcn@latest add ${itemUrl}`

  return (
    <Tabs defaultValue="pnpm" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pnpm">pnpm</TabsTrigger>
        <TabsTrigger value="npm">npm</TabsTrigger>
        <TabsTrigger value="yarn">yarn</TabsTrigger>
        <TabsTrigger value="bun">bun</TabsTrigger>
      </TabsList>
      <TabsContent value="pnpm">
        <Pre __rawstring__={pnpmCommand} data-language="bash">
          <code>
            <span className="text-white font-bold">pnpm</span>
            <span className="text-white/[0.53] ">{` dlx shadcn@latest add ${itemUrl}`}</span>
          </code>
        </Pre>
      </TabsContent>
      <TabsContent value="npm">
        <Pre __rawstring__={npmCommand} data-language="bash">
          <code>
            <span className="text-white font-bold">npx</span>
            <span className="text-white/[0.53] ">{` shadcn@latest add ${itemUrl}`}</span>
          </code>
        </Pre>
      </TabsContent>
      <TabsContent value="yarn">
        <Pre __rawstring__={yarnCommand} data-language="bash">
          <code>
            <span className="text-white font-bold">npx</span>
            <span className="text-white/[0.53] ">{` shadcn@latest add ${itemUrl}`}</span>
          </code>
        </Pre>
      </TabsContent>
      <TabsContent value="bun">
        <Pre __rawstring__={bunCommand} data-language="bash">
          <code>
            <span className="text-white font-bold">bunx</span>
            <span className="text-white/[0.53] ">{` --bun shadcn@latest add ${itemUrl}`}</span>
          </code>
        </Pre>
      </TabsContent>
    </Tabs>
  )
}
