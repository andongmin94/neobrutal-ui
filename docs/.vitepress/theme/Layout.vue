<script setup lang="ts">
import { ExternalLink } from "@lucide/vue";
import { computed, nextTick, ref, watch } from "vue";
import { Content, useData, useRoute } from "vitepress";

import { COMPONENT_DIRECTORY_LINKS } from "../../src/data/component-directory";
import DirectoryHome from "./components/DirectoryHome.vue";
import SidebarNav from "./components/SidebarNav.vue";
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
import TableOfContents from "./components/TableOfContents.vue";
import { normalizePath } from "./navigation";

const route = useRoute();
const { frontmatter, page } = useData();
const mobileMenuOpen = ref(false);
const componentPaths = new Set(COMPONENT_DIRECTORY_LINKS.map((link) => normalizePath(link.href)));
const specialPagePaths = new Set(["/styling", "/charts", "/stars", "/templates"]);

const normalizedPath = computed(() => normalizePath(route.path));
const isDirectoryHome = computed(
  () => normalizedPath.value === "/" || frontmatter.value.layout === "directory",
);
const isDocsPage = computed(
  () => normalizedPath.value === "/docs" || normalizedPath.value.startsWith("/docs/"),
);
const isComponentPage = computed(() => componentPaths.has(normalizedPath.value));
const isSpecialIndexPage = computed(() => specialPagePaths.has(normalizedPath.value));
const isTemplatePreviewPage = computed(() => normalizedPath.value.startsWith("/templates/"));
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
      :menu-label="isDocsPage ? 'Toggle documentation navigation' : 'Toggle site navigation'"
      @toggle-menu="mobileMenuOpen = !mobileMenuOpen"
    />

    <SidebarNav
      v-if="!isDocsPage"
      mode="site"
      :mobile-open="mobileMenuOpen"
      @close="mobileMenuOpen = false"
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

        <TableOfContents variant="inline" />

        <article
          class="docs-content"
          :class="isComponentPage ? 'docs-content--component' : 'docs-content--guide'"
        >
          <Content />
        </article>
      </main>

      <TableOfContents />
    </div>

    <main v-else id="main-content" class="special-main" tabindex="-1">
      <header v-if="isSpecialIndexPage" class="special-page-header">
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

      <article class="special-content" :class="{ 'special-content--index': isSpecialIndexPage }">
        <Content />
      </article>
    </main>

    <SiteFooter v-if="!isTemplatePreviewPage" />
  </div>
</template>
