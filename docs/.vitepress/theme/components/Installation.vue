<script setup lang="ts">
import { Check, Copy, SquareTerminal } from "@lucide/vue";
import { computed, ref } from "vue";

const props = defineProps<{
  component: string;
}>();

const activeTab = ref<"cli" | "manual">("cli");
const copied = ref(false);

const registryBaseUrl =
  (import.meta.env.VITE_REGISTRY_BASE_URL as string | undefined) ??
  "https://neobrutal-ui.andongmin.com";
const command = computed(
  () => `npx shadcn@latest add ${registryBaseUrl}/r/${props.component}.json`,
);

async function copyCommand() {
  await navigator.clipboard.writeText(command.value);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1600);
}
</script>

<template>
  <section class="installation-tabs">
    <div class="installation-tabs__list" role="tablist" aria-label="Installation method">
      <button
        id="installation-cli-tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'cli'"
        aria-controls="installation-cli-panel"
        @click="activeTab = 'cli'"
      >
        Shadcn CLI
      </button>
      <button
        id="installation-manual-tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'manual'"
        aria-controls="installation-manual-panel"
        @click="activeTab = 'manual'"
      >
        Manual
      </button>
    </div>

    <div
      v-show="activeTab === 'cli'"
      id="installation-cli-panel"
      class="installation-tabs__panel installation-tabs__command"
      role="tabpanel"
      aria-labelledby="installation-cli-tab"
      tabindex="0"
    >
      <SquareTerminal :size="18" :stroke-width="2.3" aria-hidden="true" />
      <code>{{ command }}</code>
      <button
        class="icon-button"
        type="button"
        :aria-label="copied ? 'Command copied' : 'Copy installation command'"
        :title="copied ? 'Copied' : 'Copy command'"
        @click="copyCommand"
      >
        <Check v-if="copied" :size="17" :stroke-width="2.5" />
        <Copy v-else :size="17" :stroke-width="2.3" />
      </button>
    </div>

    <div
      v-show="activeTab === 'manual'"
      id="installation-manual-panel"
      class="installation-tabs__panel installation-tabs__manual"
      role="tabpanel"
      aria-labelledby="installation-manual-tab"
      tabindex="0"
    >
      <slot />
    </div>
  </section>
</template>
