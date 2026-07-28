<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <thead :class="className">
    <slot />
  </thead>
</template>
