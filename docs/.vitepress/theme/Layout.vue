<script setup lang="ts">
import { ExternalLink } from "@lucide/vue";
import { computed, nextTick, ref, watch } from "vue";
import { Content, useData, useRoute } from "vitepress";

import DirectoryHome from "./components/DirectoryHome.vue";
import SidebarNav from "./components/SidebarNav.vue";
import SiteHeader from "./components/SiteHeader.vue";
import TableOfContents from "./components/TableOfContents.vue";

const route = useRoute();
const { frontmatter, page } = useData();
const mobileMenuOpen = ref(false);

const normalizedPath = computed(() => route.path.replace(/\/+$/, "") || "/");
const isDirectoryHome = computed(
  () => normalizedPath.value === "/" || frontmatter.value.layout === "directory",
);
const isDocsPage = computed(
  () => normalizedPath.value === "/docs" || normalizedPath.value.startsWith("/docs/"),
);
const isComponentPage = computed(
  () =>
    isDocsPage.value &&
    ![
      "/docs",
      "/docs/installation",
      "/docs/registry",
      "/docs/design-tokens",
      "/docs/resources",
      "/docs/credits",
      "/docs/stars",
    ].includes(normalizedPath.value),
);
const showsSpecialHeader = computed(() =>
  ["/styling", "/charts", "/stars", "/templates"].includes(normalizedPath.value),
);
const pageDescription = computed(() => frontmatter.value.description as string | undefined);
const upstreamUrl = computed(() => frontmatter.value.shadcnDocsLink as string | undefined);

watch(
  () => route.path,
  async () => {
    mobileMenuOpen.value = false;
    await nextTick();
    document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
  },
);
</script>

<template>
  <div class="site-frame">
    <SiteHeader
      :menu-open="mobileMenuOpen"
      :show-menu="isDocsPage"
      @toggle-menu="mobileMenuOpen = !mobileMenuOpen"
    />

    <DirectoryHome v-if="isDirectoryHome" />

    <div
      v-else-if="isDocsPage"
      class="docs-frame"
      :class="{ 'docs-frame--component': isComponentPage }"
    >
      <SidebarNav :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />

      <main id="main-content" class="docs-main" tabindex="-1">
        <header class="docs-page-header">
          <div class="docs-page-kicker">
            <span>{{ isComponentPage ? "Component reference" : "Project docs" }}</span>
            <span aria-hidden="true">/</span>
            <span>{{ isComponentPage ? "Source owned" : "neobrutal-ui" }}</span>
          </div>

          <div class="docs-page-heading">
            <div>
              <h1>{{ page.title }}</h1>
              <p v-if="pageDescription">{{ pageDescription }}</p>
            </div>

            <a
              v-if="upstreamUrl"
              class="upstream-link pressable"
              :href="upstreamUrl"
              rel="noreferrer"
              target="_blank"
            >
              Upstream reference
              <ExternalLink :size="14" :stroke-width="2.4" aria-hidden="true" />
            </a>
          </div>
        </header>

        <article class="docs-content">
          <Content />
        </article>

        <footer class="docs-page-footer">
          <span>Source-owned React components</span>
          <a href="/docs/credits">MIT license and credits</a>
        </footer>
      </main>

      <TableOfContents />
    </div>

    <main
      v-else
      id="main-content"
      class="special-main"
      :class="{ 'special-main--index': showsSpecialHeader }"
      tabindex="-1"
    >
      <header v-if="showsSpecialHeader" class="special-page-header">
        <div class="special-page-header__inner">
          <div class="docs-page-kicker">
            <span>Explore</span>
            <span aria-hidden="true">/</span>
            <span>neobrutal-ui</span>
          </div>
          <h1>{{ page.title }}</h1>
          <p v-if="pageDescription">{{ pageDescription }}</p>
        </div>
      </header>

      <article class="special-content" :class="{ 'special-content--index': showsSpecialHeader }">
        <Content />
      </article>
    </main>
  </div>
</template>
