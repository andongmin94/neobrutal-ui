<script setup lang="ts">
defineProps<{ className?: string }>();
</script>

<template>
  <div class="md-table-shell">
    <table class="md-table" :class="className">
      <slot />
    </table>
  </div>
</template>
