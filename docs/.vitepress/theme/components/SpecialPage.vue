<script setup lang="ts">
import { computed } from "vue";

import ReactHost from "./ReactHost.vue";

type SpecialPageKind = "blog-post" | "charts" | "stars" | "styling" | "template" | "templates";

const props = defineProps<{
  kind: SpecialPageKind;
  slug?: string;
}>();

const component = computed(() => (props.kind === "template" ? "template-detail" : props.kind));
</script>

<template>
  <div class="special-page" :data-special-page="component">
    <ReactHost
      :component="component"
      :example="props.slug"
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
