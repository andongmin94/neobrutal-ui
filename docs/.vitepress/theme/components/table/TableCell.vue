<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <td :class="className">
    <slot />
  </td>
</template>
