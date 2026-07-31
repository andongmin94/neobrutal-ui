import { loader } from "fumadocs-core/source";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content",
  docs: {
    async: true,
    schema: pageSchema.extend({
      layout: z.string().optional(),
      shadcnDocsLink: z.string().url().optional(),
    }),
  },
});

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/",
});
