<script setup lang="ts">
import { computed, ref, useId } from "vue";

import ReactHost from "./ReactHost.vue";

const props = withDefaults(
  defineProps<{
    component: string;
    example?: string;
    type?: "component" | "star";
    wrapperClassName?: string;
  }>(),
  {
    type: "component",
    wrapperClassName: "",
  },
);

const activeTab = ref<"code" | "preview">("preview");
const instanceId = useId();
const isPrimaryPreview = computed(() => props.type === "component" && !props.example);

const previewLabel = computed(() => {
  const example = props.example?.replaceAll("-", " ") ?? "primary";
  return `${props.component} ${example} preview`;
});

function handleTabKeydown(event: KeyboardEvent) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  event.preventDefault();

  if (event.key === "Home" || event.key === "ArrowLeft") {
    activeTab.value = "preview";
  } else {
    activeTab.value = "code";
  }

  const target = event.currentTarget as HTMLElement;
  requestAnimationFrame(() => {
    target.querySelector<HTMLButtonElement>(`[data-preview-tab="${activeTab.value}"]`)?.focus();
  });
}
</script>

<template>
  <section
    class="component-preview"
    :class="{ 'component-preview--primary': isPrimaryPreview }"
    :data-component="component"
  >
    <header class="component-preview__header">
      <div v-if="isPrimaryPreview" class="component-preview__label">
        <span aria-hidden="true" />
        <strong>Live preview</strong>
      </div>

      <div
        class="component-preview__tabs"
        role="tablist"
        :aria-label="previewLabel"
        @keydown="handleTabKeydown"
      >
        <button
          :id="`${instanceId}-preview-tab`"
          type="button"
          role="tab"
          data-preview-tab="preview"
          :aria-controls="`${instanceId}-preview-panel`"
          :aria-selected="activeTab === 'preview'"
          :tabindex="activeTab === 'preview' ? 0 : -1"
          @click="activeTab = 'preview'"
        >
          Preview
        </button>
        <button
          :id="`${instanceId}-code-tab`"
          type="button"
          role="tab"
          data-preview-tab="code"
          :aria-controls="`${instanceId}-code-panel`"
          :aria-selected="activeTab === 'code'"
          :tabindex="activeTab === 'code' ? 0 : -1"
          @click="activeTab = 'code'"
        >
          Code
        </button>
      </div>
    </header>

    <div
      v-show="activeTab === 'preview'"
      :id="`${instanceId}-preview-panel`"
      class="component-preview__panel component-preview__canvas vp-raw"
      :class="wrapperClassName"
      role="tabpanel"
      :aria-labelledby="`${instanceId}-preview-tab`"
    >
      <ReactHost :component="component" :eager="isPrimaryPreview" :example="example" :type="type" />
    </div>

    <div
      v-show="activeTab === 'code'"
      :id="`${instanceId}-code-panel`"
      class="component-preview__panel component-preview__code"
      role="tabpanel"
      :aria-labelledby="`${instanceId}-code-tab`"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped>
.component-preview {
  width: 100%;
  margin-block: 1.5rem;
  overflow: visible;
  border: 2px solid var(--border);
  background: var(--secondary-background);
  box-shadow: var(--shadow);
}

.component-preview--primary {
  margin-bottom: 2.5rem;
}

.component-preview__header {
  display: flex;
  min-width: 0;
  border-bottom: 2px solid var(--border);
}

.component-preview__label {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.75rem 1.25rem;
}

.component-preview__label span {
  width: 0.75rem;
  height: 0.75rem;
  flex: 0 0 auto;
  border: 2px solid var(--border);
  background: var(--main);
}

.component-preview__label strong {
  overflow: hidden;
  font-family: var(--font-heading, inherit);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-preview__tabs {
  display: grid;
  width: 14rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-left: auto;
  border-left: 2px solid var(--border);
}

.component-preview:not(.component-preview--primary) .component-preview__tabs {
  width: 100%;
  border-left: 0;
}

.component-preview__tabs button {
  min-height: 3rem;
  border: 0;
  border-right: 2px solid var(--border);
  background: var(--secondary-background);
  color: var(--foreground);
  font: inherit;
  font-weight: var(--heading-font-weight, 700);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.component-preview__tabs button:last-child {
  border-right: 0;
}

.component-preview__tabs button[aria-selected="true"] {
  background: var(--main);
  color: var(--main-foreground);
}

@media (hover: hover) {
  .component-preview__tabs button:not([aria-selected="true"]):hover {
    background: var(--surface-muted);
  }
}

.component-preview__tabs button:not([aria-selected="true"]):active {
  background: var(--main-hover);
  color: var(--main-foreground);
}

.component-preview__tabs button:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid var(--ring);
  outline-offset: -4px;
}

.component-preview__panel {
  min-width: 0;
}

.component-preview__canvas {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 13.75rem;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
  overflow-y: visible;
  padding: 2.5rem 2rem;
  background-color: var(--background);
  background-image:
    linear-gradient(
      to right,
      color-mix(in srgb, var(--border) 10%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      color-mix(in srgb, var(--border) 10%, transparent) 1px,
      transparent 1px
    );
  background-size: 40px 40px;
}

.component-preview--primary .component-preview__canvas {
  min-height: 18rem;
  padding: 3.5rem 2.5rem;
}

.component-preview__code {
  background: var(--secondary-background);
}

.component-preview__code :deep([data-slot="pre-wrapper"]) {
  box-shadow: none;
}

.component-preview__code :deep(div[class*="language-"]) {
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.component-preview__code :deep(pre) {
  max-height: 32.5rem;
  margin: 0;
  border: 0;
  border-radius: 0;
}

.component-preview--primary .component-preview__code :deep(pre) {
  min-height: 18rem;
}

@media (max-width: 640px) {
  .component-preview__header {
    flex-direction: column;
  }

  .component-preview__tabs {
    width: 100%;
    border-top: 2px solid var(--border);
    border-left: 0;
  }

  .component-preview__canvas {
    min-height: 11.25rem;
    padding: 2rem 1rem;
  }

  .component-preview--primary .component-preview__canvas {
    min-height: 15rem;
    padding: 2.5rem 1.25rem;
  }

  .component-preview--primary .component-preview__code :deep(pre) {
    min-height: 15rem;
  }
}
</style>
