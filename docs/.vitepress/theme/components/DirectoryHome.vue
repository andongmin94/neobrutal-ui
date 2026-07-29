<script setup lang="ts">
import { ArrowRight, Box, Search, SlidersHorizontal, X } from "@lucide/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { withBase } from "vitepress";

import {
  COMPONENT_CATEGORIES,
  COMPONENT_DIRECTORY_LINKS,
  type ComponentCategory,
  type ComponentGroup,
  getComponentCategory,
  getComponentInstallMode,
} from "../../../src/data/component-directory";

const query = ref("");
const category = ref<ComponentCategory>("All");
const searchInput = ref<HTMLInputElement | null>(null);
let filtersReady = false;

const categoryDescriptions: Record<ComponentGroup, string> = {
  Actions: "Controls that turn intent into an immediate action.",
  Forms: "Inputs and selection controls for structured user data.",
  Navigation: "Patterns that keep movement and context predictable.",
  Overlays: "Layered surfaces for focused tasks and secondary content.",
  Feedback: "Status, progress, and outcome signals for the interface.",
  Disclosure: "Compact controls that reveal content on demand.",
  "Data display": "Readable structures for content, values, and media.",
  Layout: "Primitives for arranging, scrolling, and resizing content.",
};

const entries = COMPONENT_DIRECTORY_LINKS.map((link) => {
  const slug = link.href.split("/").pop() ?? "";
  const entryCategory = getComponentCategory(slug);

  return {
    ...link,
    slug,
    category: entryCategory,
    installMode: getComponentInstallMode(slug),
    description: categoryDescriptions[entryCategory],
  };
});

const filteredEntries = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase();
  return entries.filter((entry) => {
    const inCategory = category.value === "All" || entry.category === category.value;
    const inQuery = `${entry.text} ${entry.category} ${entry.description}`
      .toLowerCase()
      .includes(normalizedQuery);
    return inCategory && inQuery;
  });
});

function countFor(item: ComponentCategory) {
  return item === "All"
    ? entries.length
    : entries.filter((entry) => entry.category === item).length;
}

function handleShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (
    event.key !== "/" ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target?.isContentEditable
  ) {
    return;
  }

  event.preventDefault();
  searchInput.value?.focus();
}

function isComponentCategory(value: string | null): value is ComponentCategory {
  return COMPONENT_CATEGORIES.some((category) => category === value);
}

function restoreFilters() {
  const params = new URLSearchParams(window.location.search);
  const savedCategory = params.get("category");

  query.value = params.get("q") ?? "";
  category.value = isComponentCategory(savedCategory) ? savedCategory : "All";
}

function resetFilters() {
  query.value = "";
  category.value = "All";
}

function syncFilters() {
  const url = new URL(window.location.href);
  const normalizedQuery = query.value.trim();

  if (normalizedQuery) url.searchParams.set("q", normalizedQuery);
  else url.searchParams.delete("q");

  if (category.value !== "All") url.searchParams.set("category", category.value);
  else url.searchParams.delete("category");

  window.history.replaceState(window.history.state, "", url);
}

watch([query, category], () => {
  if (filtersReady) syncFilters();
});

onMounted(() => {
  restoreFilters();
  filtersReady = true;
  document.addEventListener("keydown", handleShortcut);
});
onBeforeUnmount(() => document.removeEventListener("keydown", handleShortcut));
</script>

<template>
  <main id="main-content" class="directory-page" tabindex="-1">
    <section class="directory-hero">
      <div class="directory-hero__inner">
        <div class="directory-hero__copy">
          <p class="eyebrow">Registry index · {{ entries.length }} components</p>
          <h1>Find the piece.<br />Own the source.</h1>
          <p class="directory-hero__description">
            Browse the library by job, inspect the live behavior, then install editable React source
            into your project.
          </p>
        </div>

        <div class="directory-hero__stat" aria-label="Registry summary">
          <strong>{{ entries.length }}</strong>
          <span>React components</span>
          <small>Base UI · Tailwind CSS · shadcn</small>
        </div>
      </div>
    </section>

    <section class="directory-tools" aria-label="Directory filters">
      <label class="directory-search">
        <Search :size="20" :stroke-width="2.3" aria-hidden="true" />
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          placeholder="Search components, categories, or jobs"
          aria-label="Search component directory"
        />
        <button
          v-if="query"
          type="button"
          aria-label="Clear search"
          title="Clear"
          @click="query = ''"
        >
          <X :size="17" :stroke-width="2.4" />
        </button>
        <kbd v-else>/</kbd>
      </label>

      <div class="directory-result-count" aria-live="polite">
        <strong>{{ filteredEntries.length }}</strong>
        <span>{{ filteredEntries.length === 1 ? "result" : "results" }}</span>
      </div>
    </section>

    <div class="directory-browser">
      <aside class="directory-categories">
        <h2>
          <SlidersHorizontal :size="15" :stroke-width="2.4" />
          Filter by job
        </h2>
        <div>
          <button
            v-for="item in COMPONENT_CATEGORIES"
            :key="item"
            type="button"
            :aria-pressed="category === item"
            :class="{ 'is-active': category === item }"
            @click="category = item"
          >
            <span>{{ item }}</span>
            <small>{{ countFor(item) }}</small>
          </button>
        </div>
      </aside>

      <section class="directory-results">
        <div class="directory-results__head">
          <p>
            <span>{{ category }}</span>
            <span aria-hidden="true">/</span>
            {{ filteredEntries.length }} entries
          </p>
          <span>Source owned</span>
        </div>

        <div v-if="filteredEntries.length > 0" class="directory-grid">
          <a
            v-for="(entry, index) in filteredEntries"
            :key="entry.slug"
            class="directory-card pressable"
            :href="withBase(entry.href)"
            :style="{ '--entry-index': index }"
          >
            <div class="directory-card__top">
              <Box :size="18" :stroke-width="2.4" />
              <span>{{ entry.installMode }}</span>
            </div>
            <div class="directory-card__body">
              <p>{{ entry.category }}</p>
              <h2>{{ entry.text }}</h2>
              <span>{{ entry.description }}</span>
            </div>
            <ArrowRight class="directory-card__arrow" :size="19" :stroke-width="2.4" />
          </a>
        </div>

        <div v-else class="directory-empty">
          <Search :size="25" :stroke-width="2.3" />
          <h2>No components found</h2>
          <p>Try another term or reset the filters.</p>
          <button class="pressable" type="button" @click="resetFilters">Reset filters</button>
        </div>
      </section>
    </div>
  </main>
</template>
