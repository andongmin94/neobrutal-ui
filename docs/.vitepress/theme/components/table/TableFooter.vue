<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <tfoot :class="className">
    <slot />
  </tfoot>
</template>
