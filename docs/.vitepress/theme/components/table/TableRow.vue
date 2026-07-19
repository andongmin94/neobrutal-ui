<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <tr :class="className">
    <slot />
  </tr>
</template>
