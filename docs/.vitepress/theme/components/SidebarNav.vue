<script setup lang="ts">
import { BookOpen, Box, Search, X } from "@lucide/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, withBase } from "vitepress";

import { COMPONENT_DIRECTORY_LINKS } from "../../../src/data/component-directory";

const props = defineProps<{
  mobileOpen: boolean;
}>();

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
      { href: "/docs", text: "Introduction" },
      { href: "/docs/installation", text: "Installation" },
      { href: "/docs/registry", text: "Registry" },
    ],
  },
  {
    label: "Foundation",
    links: [{ href: "/docs/design-tokens", text: "Design tokens" }],
  },
];

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

const normalizedPath = computed(() => route.path.replace(/\/+$/, "") || "/");

function isActive(href: string) {
  return normalizedPath.value === href;
}

function setBackgroundInert(inert: boolean) {
  for (const selector of [".site-header", ".docs-main", ".docs-toc"]) {
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
  if (event.key !== "Tab") return;

  const container = event.currentTarget as HTMLElement;
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.getClientRects().length > 0);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && (activeElement === first || !container.contains(activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    first.focus();
  }
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
      searchInput.value?.focus();
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
    aria-label="Close documentation navigation"
    @click="closeAndRestoreFocus"
  />

  <aside
    ref="sidebar"
    class="docs-sidebar"
    :class="{ 'is-open': mobileOpen }"
    aria-label="Documentation navigation"
    :role="mobileOpen ? 'dialog' : undefined"
    :aria-modal="mobileOpen ? 'true' : undefined"
    @keydown="onSidebarKeydown"
  >
    <div class="docs-sidebar__mobile-head">
      <strong>Browse docs</strong>
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
    </nav>
  </aside>
</template>
