<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <tbody :class="className">
    <slot />
  </tbody>
</template>
