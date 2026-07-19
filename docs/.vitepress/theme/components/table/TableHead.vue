<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <th :class="className">
    <slot />
  </th>
</template>
