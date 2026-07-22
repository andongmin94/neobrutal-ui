<script setup lang="ts">
import localSearchIndex from "@localSearchIndex";
import { ArrowRight, Command, Search, X } from "@lucide/vue";
import MiniSearch, { type SearchResult } from "minisearch";
import {
  computed,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useRoute, useRouter } from "vitepress";

import { COMPONENT_DIRECTORY_LINKS } from "../../../src/data/component-directory";
import TEMPLATES from "../../../src/data/templates";
import { BLOG_POSTS } from "../../../src/lib/blog-posts";

type SearchEntry = {
  group: string;
  href: string;
  label: string;
  terms?: string;
};

type IndexedSearchEntry = {
  text?: string;
  title: string;
  titles: string[];
};

const router = useRouter();
const route = useRoute();
const open = ref(false);
const query = ref("");
const selectedIndex = ref(0);
const input = ref<HTMLInputElement | null>(null);
const launcher = ref<HTMLButtonElement | null>(null);
const resultList = ref<HTMLElement | null>(null);
const searchIndex = shallowRef<MiniSearch<IndexedSearchEntry> | null>(null);
const searchLoading = ref(false);
let returnFocus: HTMLElement | null = null;

const resultListId = "docs-search-results";
const searchIndexLoaders = localSearchIndex as Record<string, () => Promise<{ default: string }>>;

const staticEntries: SearchEntry[] = [
  { group: "Directory", href: "/", label: "Component directory", terms: "home registry browse" },
  { group: "Getting started", href: "/docs/", label: "Introduction" },
  { group: "Getting started", href: "/docs/installation", label: "Installation" },
  { group: "Getting started", href: "/docs/registry", label: "Registry" },
  { group: "Foundation", href: "/docs/design-tokens", label: "Design tokens" },
  { group: "Explore", href: "/styling", label: "Styling" },
  { group: "Explore", href: "/charts", label: "Charts" },
  { group: "Explore", href: "/stars", label: "Stars" },
  { group: "Project", href: "/docs/stars", label: "GitHub stars data" },
  { group: "Explore", href: "/templates/", label: "Templates" },
  { group: "Project", href: "/docs/resources", label: "Resources" },
  { group: "Project", href: "/docs/credits", label: "Credits & license" },
];

const entries = [
  ...staticEntries,
  ...COMPONENT_DIRECTORY_LINKS.map((entry) => ({
    group: "Components",
    href: entry.href,
    label: entry.text,
    terms: `component ${entry.text}`,
  })),
  ...TEMPLATES.map((entry) => ({
    group: "Templates",
    href: `/templates/${entry.slug}`,
    label: `${entry.title} template`,
    terms: entry.description,
  })),
  ...BLOG_POSTS.map((entry) => ({
    group: "Blog",
    href: `/templates/blog/${entry.slug}`,
    label: entry.title,
    terms: `${entry.topic} ${entry.summary}`,
  })),
];

const results = computed(() => {
  const normalized = query.value.trim().toLowerCase();
  if (!normalized) return entries.slice(0, 12);

  const staticMatches = entries.filter((entry) =>
    `${entry.label} ${entry.group} ${entry.terms ?? ""}`.toLowerCase().includes(normalized),
  );
  const indexedMatches: SearchEntry[] = (searchIndex.value?.search(normalized) ?? [])
    .slice(0, 24)
    .map((result) => {
      const indexedResult = result as SearchResult & IndexedSearchEntry;
      const parentTitle = indexedResult.titles?.[0];
      return {
        group: parentTitle || "Documentation",
        href: String(indexedResult.id),
        label: indexedResult.title || indexedResult.titles?.at(-1) || "Untitled section",
      };
    });

  const deduplicated = new Map<string, SearchEntry>();
  for (const entry of [...staticMatches, ...indexedMatches]) {
    if (!deduplicated.has(entry.href)) deduplicated.set(entry.href, entry);
  }

  return [...deduplicated.values()].slice(0, 12);
});

async function loadSearchIndex() {
  if (searchIndex.value || searchLoading.value) return;

  const loader = Object.values(searchIndexLoaders)[0];
  if (!loader) return;

  searchLoading.value = true;
  try {
    const serializedIndex = (await loader()).default;
    searchIndex.value = markRaw(
      MiniSearch.loadJSON<IndexedSearchEntry>(serializedIndex, {
        fields: ["title", "titles", "text"],
        storeFields: ["title", "titles"],
        searchOptions: {
          boost: { text: 2, title: 4, titles: 1 },
          combineWith: "AND",
          fuzzy: 0.2,
          prefix: true,
        },
      }),
    );
  } finally {
    searchLoading.value = false;
  }
}

const activeResultId = computed(() =>
  results.value[selectedIndex.value] ? `docs-search-result-${selectedIndex.value}` : undefined,
);

function show() {
  void loadSearchIndex();
  const activeElement = document.activeElement;
  returnFocus =
    activeElement instanceof HTMLElement && activeElement !== document.body
      ? activeElement
      : launcher.value;
  open.value = true;
}

function hide() {
  if (!open.value) return;
  open.value = false;
}

async function go(entry: SearchEntry) {
  hide();
  await router.go(entry.href);
}

function onGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (open.value) {
      hide();
    } else {
      show();
    }
  }
  if (event.key === "Escape" && open.value) hide();
}

async function revealSelectedResult() {
  await nextTick();
  resultList.value
    ?.querySelector<HTMLElement>(`#docs-search-result-${selectedIndex.value}`)
    ?.scrollIntoView({ block: "nearest" });
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
    void revealSelectedResult();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
    void revealSelectedResult();
  } else if (event.key === "Enter" && results.value[selectedIndex.value]) {
    event.preventDefault();
    void go(results.value[selectedIndex.value]);
  }
}

function onDialogKeydown(event: KeyboardEvent) {
  if (event.key !== "Tab") return;

  const dialog = event.currentTarget as HTMLElement;
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.getClientRects().length > 0);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(open, async (isOpen) => {
  document.documentElement.classList.toggle("search-open", isOpen);
  document.querySelector<HTMLElement>(".site-frame")?.toggleAttribute("inert", isOpen);

  if (isOpen) {
    query.value = "";
    selectedIndex.value = 0;
    await nextTick();
    input.value?.focus();
  } else {
    await nextTick();
    const focusTarget = returnFocus?.isConnected ? returnFocus : launcher.value;
    returnFocus = null;
    focusTarget?.focus();
  }
});

watch(query, () => {
  selectedIndex.value = 0;
  void revealSelectedResult();
});

watch(() => route.path, hide);

onMounted(() => {
  window.addEventListener("keydown", onGlobalKeydown);
  void loadSearchIndex();
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown);
  document.documentElement.classList.remove("search-open");
  document.querySelector<HTMLElement>(".site-frame")?.removeAttribute("inert");
});
</script>

<template>
  <button
    ref="launcher"
    class="search-launcher pressable"
    type="button"
    aria-label="Search documentation"
    title="Search documentation"
    aria-haspopup="dialog"
    @click="show"
  >
    <Search :size="16" :stroke-width="2.4" />
    <span>Search</span>
    <kbd><Command :size="11" />K</kbd>
  </button>

  <Teleport to="body">
    <Transition name="search-dialog">
      <div v-if="open" class="search-overlay" role="presentation" @mousedown.self="hide">
        <section
          class="search-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          @keydown="onDialogKeydown"
        >
          <div class="search-dialog__input">
            <Search :size="20" :stroke-width="2.3" aria-hidden="true" />
            <input
              ref="input"
              v-model="query"
              type="search"
              placeholder="Search docs and components"
              aria-label="Search docs and components"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              :aria-controls="resultListId"
              :aria-activedescendant="activeResultId"
              @keydown="onInputKeydown"
            />
            <button class="icon-button" type="button" aria-label="Close search" @click="hide">
              <X :size="18" :stroke-width="2.4" />
            </button>
          </div>

          <div
            :id="resultListId"
            ref="resultList"
            class="search-dialog__results"
            role="listbox"
            :aria-busy="searchLoading ? 'true' : undefined"
          >
            <button
              v-for="(entry, index) in results"
              :id="`docs-search-result-${index}`"
              :key="`${entry.group}:${entry.href}`"
              type="button"
              role="option"
              :aria-selected="selectedIndex === index"
              :class="{ 'is-selected': selectedIndex === index }"
              @mouseenter="selectedIndex = index"
              @click="go(entry)"
            >
              <span>
                <small>{{ entry.group }}</small>
                <strong>{{ entry.label }}</strong>
              </span>
              <ArrowRight :size="17" :stroke-width="2.4" />
            </button>

            <div v-if="results.length === 0 && searchLoading" class="search-dialog__empty">
              Loading full-text index…
            </div>
            <div v-else-if="results.length === 0" class="search-dialog__empty">
              No matches for “{{ query }}”
            </div>
          </div>

          <footer class="search-dialog__footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Open</span>
            <span><kbd>Esc</kbd> Close</span>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
