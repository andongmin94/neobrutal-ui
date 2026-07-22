<script setup lang="ts">
import { Menu, X as CloseIcon } from "@lucide/vue";
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";

import SearchLauncher from "./SearchLauncher.vue";
import ThemeToggle from "./ThemeToggle.vue";

const props = withDefaults(
  defineProps<{
    menuLabel?: string;
    menuOpen: boolean;
    showMenu: boolean;
  }>(),
  {
    menuLabel: "Toggle site navigation",
  },
);

defineEmits<{
  toggleMenu: [];
}>();

const route = useRoute();

const primaryLinks = [
  { href: "/docs/", label: "Docs" },
  { href: "/styling", label: "Styling" },
  { href: "/charts", label: "Charts" },
  { href: "/templates/", label: "Templates" },
];

const normalizedPath = computed(() => route.path.replace(/\/+$/, "") || "/");

function isActive(href: string) {
  if (href === "/") return normalizedPath.value === "/";
  if (href === "/docs/")
    return normalizedPath.value === "/docs" || normalizedPath.value.startsWith("/docs/");
  return normalizedPath.value === href || normalizedPath.value.startsWith(`${href}/`);
}
</script>

<template>
  <header class="site-header">
    <a class="skip-link" href="#main-content">Skip to content</a>

    <div
      class="site-header__inner"
      :class="{ 'site-header__inner--without-menu': !props.showMenu }"
    >
      <button
        v-if="props.showMenu"
        class="icon-button mobile-menu-button"
        type="button"
        :aria-expanded="props.menuOpen"
        :aria-label="props.menuLabel"
        @click="$emit('toggleMenu')"
      >
        <CloseIcon v-if="props.menuOpen" :size="19" :stroke-width="2.4" />
        <Menu v-else :size="19" :stroke-width="2.4" />
      </button>

      <a class="site-brand" :href="withBase('/')" aria-label="neobrutal-ui home">
        <span class="site-brand__mark" aria-hidden="true">N</span>
        <span>neobrutal-ui</span>
      </a>

      <nav class="primary-nav" aria-label="Primary navigation">
        <a
          v-for="link in primaryLinks"
          :key="link.href"
          :aria-current="isActive(link.href) ? 'page' : undefined"
          :class="{ 'is-active': isActive(link.href) }"
          :href="withBase(link.href)"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="site-actions">
        <SearchLauncher />
        <a
          class="icon-button"
          href="https://github.com/andongmin94/neobrutal-ui"
          aria-label="Open GitHub repository"
          rel="noreferrer"
          target="_blank"
          title="GitHub"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          class="icon-button"
          href="https://x.com/andongmin94"
          aria-label="Open andongmin94 on X"
          rel="noreferrer"
          target="_blank"
          title="X"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.3-8.3L1 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L6.5 4.1H4.7l13.1 15.7Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
