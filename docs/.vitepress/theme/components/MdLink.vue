<script setup lang="ts">
import { ExternalLink } from "@lucide/vue";
import { computed, useAttrs } from "vue";
import { withBase } from "vitepress";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  className?: string;
  href: string;
  target?: string;
}>();

const attrs = useAttrs();
const isExternal = computed(
  () => /^(?:https?:)?\/\//.test(props.href) || props.href.startsWith("mailto:"),
);
const resolvedHref = computed(() => (isExternal.value ? props.href : withBase(props.href)));
</script>

<template>
  <a
    v-bind="attrs"
    class="md-link"
    :class="className"
    :href="resolvedHref"
    :target="target ?? (isExternal ? '_blank' : undefined)"
    :rel="isExternal ? 'noreferrer' : undefined"
  >
    <slot />
    <ExternalLink
      v-if="isExternal"
      class="md-link__external"
      :size="12"
      :stroke-width="2.4"
      aria-hidden="true"
    />
  </a>
</template>
