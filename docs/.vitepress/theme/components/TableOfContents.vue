<script setup lang="ts">
import { List, MoveUp } from "@lucide/vue";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vitepress";

type TocHeader = {
  level: number;
  link: string;
  title: string;
};

const route = useRoute();
const activeId = ref("");
const headers = ref<TocHeader[]>([]);
let observer: IntersectionObserver | undefined;

function collectHeaders() {
  const content = document.querySelector(".docs-content");

  headers.value = Array.from(content?.querySelectorAll<HTMLElement>("h2[id], h3[id]") ?? []).map(
    (element) => {
      const title = element.cloneNode(true) as HTMLElement;
      title.querySelectorAll(".header-anchor").forEach((anchor) => anchor.remove());

      return {
        level: Number(element.tagName.slice(1)),
        link: `#${element.id}`,
        title: (title.textContent ?? "").replaceAll("\u200B", "").trim(),
      };
    },
  );
}

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

async function refreshHeaders() {
  activeId.value = "";
  await nextTick();
  collectHeaders();
  connectObserver();
}

watch(
  () => route.path,
  () => void refreshHeaders(),
);

onMounted(() => void refreshHeaders());
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
