import type { SearchResultRecord } from "fumadocs-core/search/client";

type SearchNode =
  | SearchResultRecord["hastContent"]
  | SearchResultRecord["hastContent"]["children"][number];

function textContent(node: SearchNode): string {
  if (node.type === "text") return node.value;
  if (node.type !== "root" && node.type !== "element") return "";
  if (node.type === "element" && node.tagName === "thead") return "";
  if (node.type === "element" && node.tagName === "br") return " ";

  const children = node.children.map(textContent);
  if (node.type === "element" && node.tagName === "tr") {
    return `${children.filter((text) => text.trim()).join(" · ")} `;
  }
  const text = children.join("");
  return node.type === "element" && ["p", "li", "pre"].includes(node.tagName) ? `${text} ` : text;
}

export function searchResultText(content: SearchResultRecord["hastContent"]) {
  // Fumadocs already parsed the Markdown. Read its text without stripping code punctuation.
  return textContent(content).replaceAll(/\s+/g, " ").trim();
}
