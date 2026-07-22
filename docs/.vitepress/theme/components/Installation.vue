<script setup lang="ts">
import { Check, Copy, SquareTerminal } from "@lucide/vue";
import { computed, ref, useId } from "vue";

const props = defineProps<{
  component: string;
}>();

const activeTab = ref<"cli" | "manual">("cli");
const copied = ref(false);
const instanceId = useId();

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

function handleTabKeydown(event: KeyboardEvent) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  event.preventDefault();
  const tabs = ["cli", "manual"] as const;
  const currentIndex = tabs.indexOf(activeTab.value);
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  activeTab.value = tabs[nextIndex];

  const tabList = event.currentTarget as HTMLElement;
  requestAnimationFrame(() => {
    tabList
      .querySelector<HTMLButtonElement>(`[data-installation-tab="${activeTab.value}"]`)
      ?.focus();
  });
}
</script>

<template>
  <section class="installation-tabs">
    <div
      class="installation-tabs__list"
      role="tablist"
      aria-label="Installation method"
      @keydown="handleTabKeydown"
    >
      <button
        :id="`${instanceId}-cli-tab`"
        type="button"
        role="tab"
        data-installation-tab="cli"
        :aria-selected="activeTab === 'cli'"
        :aria-controls="`${instanceId}-cli-panel`"
        :tabindex="activeTab === 'cli' ? 0 : -1"
        @click="activeTab = 'cli'"
      >
        Shadcn CLI
      </button>
      <button
        :id="`${instanceId}-manual-tab`"
        type="button"
        role="tab"
        data-installation-tab="manual"
        :aria-selected="activeTab === 'manual'"
        :aria-controls="`${instanceId}-manual-panel`"
        :tabindex="activeTab === 'manual' ? 0 : -1"
        @click="activeTab = 'manual'"
      >
        Manual
      </button>
    </div>

    <div
      v-show="activeTab === 'cli'"
      :id="`${instanceId}-cli-panel`"
      class="installation-tabs__panel installation-tabs__command"
      role="tabpanel"
      :aria-labelledby="`${instanceId}-cli-tab`"
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
      :id="`${instanceId}-manual-panel`"
      class="installation-tabs__panel installation-tabs__manual"
      role="tabpanel"
      :aria-labelledby="`${instanceId}-manual-tab`"
      tabindex="0"
    >
      <slot />
    </div>
  </section>
</template>
