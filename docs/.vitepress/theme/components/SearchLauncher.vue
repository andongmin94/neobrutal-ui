<script setup lang="ts">
import { ArrowRight, Command, Search, X } from "@lucide/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vitepress";

import { COMPONENT_DIRECTORY_LINKS } from "../../../src/data/component-directory";

type SearchEntry = {
  group: string;
  href: string;
  label: string;
  terms?: string;
};

const router = useRouter();
const route = useRoute();
const open = ref(false);
const query = ref("");
const selectedIndex = ref(0);
const input = ref<HTMLInputElement | null>(null);

const staticEntries: SearchEntry[] = [
  { group: "Directory", href: "/", label: "Component directory", terms: "home registry browse" },
  { group: "Getting started", href: "/docs", label: "Introduction" },
  { group: "Getting started", href: "/docs/installation", label: "Installation" },
  { group: "Getting started", href: "/docs/registry", label: "Registry" },
  { group: "Foundation", href: "/docs/design-tokens", label: "Design tokens" },
  { group: "Explore", href: "/styling", label: "Styling" },
  { group: "Explore", href: "/charts", label: "Charts" },
  { group: "Explore", href: "/stars", label: "Stars" },
  { group: "Explore", href: "/templates", label: "Templates" },
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
];

const results = computed(() => {
  const normalized = query.value.trim().toLowerCase();
  const matches = normalized
    ? entries.filter((entry) =>
        `${entry.label} ${entry.group} ${entry.terms ?? ""}`.toLowerCase().includes(normalized),
      )
    : entries;
  return matches.slice(0, 12);
});

function show() {
  open.value = true;
}

function hide() {
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

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (event.key === "Enter" && results.value[selectedIndex.value]) {
    event.preventDefault();
    void go(results.value[selectedIndex.value]);
  }
}

watch(open, async (isOpen) => {
  document.documentElement.classList.toggle("search-open", isOpen);
  if (isOpen) {
    query.value = "";
    selectedIndex.value = 0;
    await nextTick();
    input.value?.focus();
  }
});

watch(query, () => {
  selectedIndex.value = 0;
});

watch(() => route.path, hide);

onMounted(() => window.addEventListener("keydown", onGlobalKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown);
  document.documentElement.classList.remove("search-open");
});
</script>

<template>
  <button class="search-launcher pressable" type="button" @click="show">
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
        >
          <div class="search-dialog__input">
            <Search :size="20" :stroke-width="2.3" aria-hidden="true" />
            <input
              ref="input"
              v-model="query"
              type="search"
              placeholder="Search docs and components"
              aria-label="Search docs and components"
              @keydown="onInputKeydown"
            />
            <button class="icon-button" type="button" aria-label="Close search" @click="hide">
              <X :size="18" :stroke-width="2.4" />
            </button>
          </div>

          <div class="search-dialog__results">
            <button
              v-for="(entry, index) in results"
              :key="`${entry.group}:${entry.href}`"
              type="button"
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

            <div v-if="results.length === 0" class="search-dialog__empty">
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
