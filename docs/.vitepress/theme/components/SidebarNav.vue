<script setup lang="ts">
import { BookOpen, Box, Search, X } from "@lucide/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, withBase } from "vitepress";

import { COMPONENT_DIRECTORY_LINKS } from "../../../src/data/component-directory";
import { trapTabFocus } from "../focus";
import { isNavigationPathActive, SITE_NAVIGATION_LINKS } from "../navigation";

const props = withDefaults(
  defineProps<{
    mobileOpen: boolean;
    mode?: "docs" | "site";
  }>(),
  {
    mode: "docs",
  },
);

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const componentQuery = ref("");
const sidebar = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
let mobileViewport: MediaQueryList | null = null;

const documentGroups = [
  {
    label: "Getting started",
    links: [
      { href: "/docs/", text: "Introduction" },
      { href: "/docs/installation", text: "Installation" },
      { href: "/docs/registry", text: "Registry" },
    ],
  },
  {
    label: "Foundation",
    links: [{ href: "/docs/design-tokens", text: "Design tokens" }],
  },
];

const siteGroups = [
  {
    label: "Explore",
    links: SITE_NAVIGATION_LINKS,
  },
  {
    label: "Project",
    links: [
      { href: "/docs/stars", text: "Stars data" },
      { href: "/docs/resources", text: "Resources" },
      { href: "/docs/credits", text: "Credits & license" },
    ],
  },
];

const navigationLabel = computed(() =>
  props.mode === "site" ? "Site navigation" : "Documentation navigation",
);

const projectLinks = [
  { href: "/docs/stars", text: "Stars" },
  { href: "/docs/resources", text: "Resources" },
  { href: "/docs/credits", text: "Credits & license" },
];

const filteredComponents = computed(() => {
  const query = componentQuery.value.trim().toLowerCase();
  if (!query) return COMPONENT_DIRECTORY_LINKS;
  return COMPONENT_DIRECTORY_LINKS.filter((link) => link.text.toLowerCase().includes(query));
});

function isActive(href: string) {
  return isNavigationPathActive(route.path, href);
}

function setBackgroundInert(inert: boolean) {
  const selectors =
    props.mode === "site"
      ? [".site-header", "#main-content"]
      : [".site-header", ".docs-main", ".docs-toc"];
  for (const selector of selectors) {
    document.querySelector<HTMLElement>(selector)?.toggleAttribute("inert", inert);
  }
}

function onViewportChange(event: MediaQueryListEvent) {
  if (!event.matches && props.mobileOpen) {
    emit("close");
  }
}

async function closeAndRestoreFocus() {
  emit("close");
  await nextTick();
  document.querySelector<HTMLButtonElement>(".mobile-menu-button")?.focus();
}

function onSidebarKeydown(event: KeyboardEvent) {
  if (!props.mobileOpen) return;

  if (event.key === "Escape") {
    event.preventDefault();
    void closeAndRestoreFocus();
    return;
  }

  trapTabFocus(event);
}

async function revealActiveLink() {
  await nextTick();

  const container = sidebar.value;
  const activeLink = container?.querySelector<HTMLElement>('a[aria-current="page"]');
  if (!container || !activeLink) return;

  const containerRect = container.getBoundingClientRect();
  const activeRect = activeLink.getBoundingClientRect();
  const edgePadding = 24;
  const isVisible =
    activeRect.top >= containerRect.top + edgePadding &&
    activeRect.bottom <= containerRect.bottom - edgePadding;

  if (!isVisible) {
    container.scrollTo({
      top:
        container.scrollTop +
        activeRect.top -
        containerRect.top -
        containerRect.height / 2 +
        activeRect.height / 2,
    });
  }
}

onMounted(() => {
  void revealActiveLink();
  mobileViewport = window.matchMedia("(max-width: 1023px)");
  mobileViewport.addEventListener("change", onViewportChange);
  if (!mobileViewport.matches && props.mobileOpen) {
    emit("close");
  }
});

watch(
  () => props.mobileOpen,
  async (open) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("menu-open", open);
      setBackgroundInert(open);
    }
    if (open) {
      await nextTick();
      if (props.mode === "docs") {
        searchInput.value?.focus();
      } else {
        sidebar.value?.querySelector<HTMLAnchorElement>(".docs-nav a")?.focus();
      }
    }
  },
);

watch(
  () => route.path,
  async () => {
    emit("close");
    await revealActiveLink();
  },
);

onBeforeUnmount(() => {
  mobileViewport?.removeEventListener("change", onViewportChange);
  document.documentElement.classList.remove("menu-open");
  setBackgroundInert(false);
});
</script>

<template>
  <button
    v-if="mobileOpen"
    class="sidebar-scrim"
    type="button"
    :aria-label="`Close ${navigationLabel.toLowerCase()}`"
    @click="closeAndRestoreFocus"
  />

  <aside
    ref="sidebar"
    class="docs-sidebar"
    :class="{
      'docs-sidebar--site': props.mode === 'site',
      'is-open': mobileOpen,
    }"
    :aria-label="navigationLabel"
    :role="mobileOpen ? 'dialog' : undefined"
    :aria-modal="mobileOpen ? 'true' : undefined"
    @keydown="onSidebarKeydown"
  >
    <div class="docs-sidebar__mobile-head">
      <strong>{{ props.mode === "site" ? "Browse site" : "Browse docs" }}</strong>
      <button
        class="icon-button"
        type="button"
        aria-label="Close navigation"
        @click="closeAndRestoreFocus"
      >
        <X :size="18" :stroke-width="2.4" />
      </button>
    </div>

    <nav class="docs-nav">
      <template v-if="props.mode === 'site'">
        <section v-for="group in siteGroups" :key="group.label" class="docs-nav__group">
          <h2>
            <BookOpen :size="13" />
            {{ group.label }}
          </h2>
          <a
            v-for="link in group.links"
            :key="link.href"
            :aria-current="isActive(link.href) ? 'page' : undefined"
            :class="{ 'is-active': isActive(link.href) }"
            :href="withBase(link.href)"
          >
            {{ link.text }}
          </a>
        </section>
      </template>

      <template v-else>
        <section class="docs-nav__group docs-nav__mobile-site">
          <h2>
            <BookOpen :size="13" />
            Explore site
          </h2>
          <a
            v-for="link in SITE_NAVIGATION_LINKS"
            :key="link.href"
            :aria-current="isActive(link.href) ? 'page' : undefined"
            :class="{ 'is-active': isActive(link.href) }"
            :href="withBase(link.href)"
          >
            {{ link.text }}
          </a>
        </section>

        <section v-for="group in documentGroups" :key="group.label" class="docs-nav__group">
          <h2>
            <BookOpen :size="13" />
            {{ group.label }}
          </h2>
          <a
            v-for="link in group.links"
            :key="link.href"
            :aria-current="isActive(link.href) ? 'page' : undefined"
            :class="{ 'is-active': isActive(link.href) }"
            :href="withBase(link.href)"
          >
            {{ link.text }}
          </a>
        </section>

        <section class="docs-nav__group docs-nav__components">
          <div class="docs-nav__group-heading">
            <h2>
              <Box :size="13" />
              Components
            </h2>
            <span>{{ filteredComponents.length }}/{{ COMPONENT_DIRECTORY_LINKS.length }}</span>
          </div>

          <label class="sidebar-filter">
            <Search :size="14" aria-hidden="true" />
            <input
              ref="searchInput"
              v-model="componentQuery"
              type="search"
              placeholder="Filter components"
              aria-label="Filter components"
            />
          </label>

          <div class="component-nav-list">
            <a
              v-for="link in filteredComponents"
              :key="link.href"
              :aria-current="isActive(link.href) ? 'page' : undefined"
              :class="{ 'is-active': isActive(link.href) }"
              :href="withBase(link.href)"
            >
              {{ link.text }}
            </a>
            <p v-if="filteredComponents.length === 0" class="component-nav-empty">No matches</p>
          </div>
        </section>

        <section class="docs-nav__group">
          <h2>Project</h2>
          <a
            v-for="link in projectLinks"
            :key="link.href"
            :aria-current="isActive(link.href) ? 'page' : undefined"
            :class="{ 'is-active': isActive(link.href) }"
            :href="withBase(link.href)"
          >
            {{ link.text }}
          </a>
        </section>
      </template>
    </nav>
  </aside>
</template>
