<script setup lang="ts">
import { Moon, Sun } from "@lucide/vue";
import { onMounted, ref } from "vue";

type Theme = "light" | "dark";

const theme = ref<Theme>("light");

function applyTheme(nextTheme: Theme) {
  theme.value = nextTheme;
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  window.localStorage.setItem("neobrutal-ui-theme", nextTheme);
  window.dispatchEvent(new CustomEvent("neobrutal-ui:theme", { detail: nextTheme }));
}

function toggleTheme() {
  applyTheme(theme.value === "light" ? "dark" : "light");
}

onMounted(() => {
  const stored = window.localStorage.getItem("neobrutal-ui-theme") as Theme | null;
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(stored === "light" || stored === "dark" ? stored : preferred);
});
</script>

<template>
  <button
    class="icon-button"
    type="button"
    :aria-label="theme === 'light' ? 'Use dark theme' : 'Use light theme'"
    :title="theme === 'light' ? 'Dark theme' : 'Light theme'"
    @click="toggleTheme"
  >
    <Moon v-if="theme === 'light'" :size="18" :stroke-width="2.3" />
    <Sun v-else :size="18" :stroke-width="2.3" />
  </button>
</template>
