import { createFromSource } from "fumadocs-core/search/server";

import { source } from "~/lib/source";

const search = createFromSource(source, {
  language: "english",
});

export async function loader() {
  return search.staticGET();
}
