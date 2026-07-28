<script setup lang="ts">
import { GitFork, Menu, PackageOpen, X } from "@lucide/vue";
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";

import SearchLauncher from "./SearchLauncher.vue";
import ThemeToggle from "./ThemeToggle.vue";

defineProps<{
  menuOpen: boolean;
  showMenu: boolean;
}>();

defineEmits<{
  toggleMenu: [];
}>();

const route = useRoute();

const primaryLinks = [
  { href: "/", label: "Directory" },
  { href: "/docs", label: "Docs" },
  { href: "/styling", label: "Styling" },
  { href: "/charts", label: "Charts" },
  { href: "/templates", label: "Templates" },
];

const normalizedPath = computed(() => route.path.replace(/\/+$/, "") || "/");

function isActive(href: string) {
  if (href === "/") return normalizedPath.value === "/";
  if (href === "/docs")
    return normalizedPath.value === "/docs" || normalizedPath.value.startsWith("/docs/");
  return normalizedPath.value === href || normalizedPath.value.startsWith(`${href}/`);
}
</script>

<template>
  <header class="site-header">
    <a class="skip-link" href="#main-content">Skip to content</a>

    <div class="site-header__inner" :class="{ 'site-header__inner--without-menu': !showMenu }">
      <button
        v-if="showMenu"
        class="icon-button mobile-menu-button"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Toggle documentation navigation"
        @click="$emit('toggleMenu')"
      >
        <X v-if="menuOpen" :size="19" :stroke-width="2.4" />
        <Menu v-else :size="19" :stroke-width="2.4" />
      </button>

      <a class="site-brand" :href="withBase('/')">
        <span class="site-brand__mark" aria-hidden="true">
          <PackageOpen :size="18" :stroke-width="2.5" />
        </span>
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
          <GitFork :size="18" :stroke-width="2.3" />
        </a>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
