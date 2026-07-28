<script setup lang="ts">
import { List, MoveUp } from "@lucide/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useData, useRoute } from "vitepress";

type TocHeader = {
  level: number;
  link: string;
  title: string;
};

const { page } = useData();
const route = useRoute();
const activeId = ref("");
let observer: IntersectionObserver | undefined;

const headers = computed<TocHeader[]>(() =>
  ((page.value.headers ?? []) as TocHeader[]).filter(
    (header) => header.level === 2 || header.level === 3,
  ),
);

function connectObserver() {
  observer?.disconnect();
  const elements = headers.value
    .map((header) => document.getElementById(header.link.replace(/^#/, "")))
    .filter((element): element is HTMLElement => Boolean(element));

  if (elements.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]?.target.id) activeId.value = visible[0].target.id;
    },
    { rootMargin: "-96px 0px -68% 0px", threshold: [0, 1] },
  );

  elements.forEach((element) => observer?.observe(element));
}

watch(
  () => route.path,
  async () => {
    activeId.value = "";
    await nextTick();
    connectObserver();
  },
);

onMounted(connectObserver);
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <aside class="docs-toc" aria-label="On this page">
    <div class="docs-toc__inner">
      <h2>
        <List :size="14" :stroke-width="2.4" />
        On this page
      </h2>

      <nav v-if="headers.length > 0">
        <a
          v-for="header in headers"
          :key="header.link"
          :class="{
            'is-active': activeId === header.link.replace(/^#/, ''),
            'is-nested': header.level === 3,
          }"
          :href="header.link"
        >
          {{ header.title }}
        </a>
      </nav>
      <p v-else class="docs-toc__empty">Overview</p>

      <a class="back-to-top" href="#main-content">
        <MoveUp :size="13" />
        Back to top
      </a>
    </div>
  </aside>
</template>
