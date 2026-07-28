<script setup lang="ts">
import { computed } from "vue";

import DirectoryHome from "./DirectoryHome.vue";
import ReactHost from "./ReactHost.vue";

type SpecialPageName =
  | "blog-post"
  | "charts"
  | "stars"
  | "styling"
  | "template-detail"
  | "templates";

type SpecialPageKind = "directory" | "template" | SpecialPageName;

const props = defineProps<{
  kind?: SpecialPageKind;
  name?: SpecialPageKind;
  page?: SpecialPageKind;
  postSlug?: string;
  slug?: string;
  type?: SpecialPageKind;
}>();

const resolvedKind = computed(() => props.kind ?? props.page ?? props.name ?? props.type ?? "");
const resolvedPage = computed(() =>
  resolvedKind.value === "template" ? "template-detail" : resolvedKind.value,
);
const resolvedArgument = computed(() =>
  resolvedPage.value === "blog-post"
    ? (props.postSlug ?? props.slug)
    : (props.slug ?? props.postSlug),
);
</script>

<template>
  <DirectoryHome v-if="resolvedKind === 'directory'" />
  <div v-else class="special-page" :data-special-page="resolvedPage || 'unknown'">
    <ReactHost
      :component="resolvedPage"
      :example="resolvedArgument"
      loading-label="Loading interactive page..."
      type="special"
    />
  </div>
</template>

<style scoped>
.special-page {
  width: 100%;
  min-width: 0;
  min-height: 12rem;
}
</style>
