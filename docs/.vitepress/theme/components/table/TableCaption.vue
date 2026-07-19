<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <caption :class="className">
    <slot />
  </caption>
</template>
