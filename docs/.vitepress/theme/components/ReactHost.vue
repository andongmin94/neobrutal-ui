<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

type ReactHostType = "component" | "special" | "star";
type ReactUnmount = () => void;

const props = withDefaults(
  defineProps<{
    component: string;
    eager?: boolean;
    example?: string;
    loadingLabel?: string;
    type?: ReactHostType;
  }>(),
  {
    eager: false,
    loadingLabel: "Loading preview...",
    type: "component",
  },
);

const emit = defineEmits<{
  error: [error: Error];
  mounted: [];
}>();

const hostElement = ref<HTMLElement | null>(null);
const mountElement = ref<HTMLElement | null>(null);
const errorMessage = ref("");
const loading = ref(true);

let dispose: ReactUnmount | undefined;
let mountController: AbortController | undefined;
let visibilityObserver: IntersectionObserver | undefined;
let mountSequence = 0;
let mountRequested = false;

function cleanup() {
  mountController?.abort();
  mountController = undefined;
  dispose?.();
  dispose = undefined;
}

async function mountPreview() {
  if (import.meta.env.SSR || !mountElement.value) return;

  const sequence = ++mountSequence;
  cleanup();
  errorMessage.value = "";
  loading.value = true;
  const controller = new AbortController();
  mountController = controller;

  try {
    const { mountReactHost } = await import("../react/mount");
    const unmount = await mountReactHost(mountElement.value, {
      component: props.component,
      example: props.example,
      signal: controller.signal,
      type: props.type,
      onError(error) {
        emit("error", error);
      },
    });

    if (sequence !== mountSequence || !mountElement.value) {
      unmount();
      return;
    }

    dispose = unmount;
    loading.value = false;
    emit("mounted");
  } catch (error) {
    if (sequence !== mountSequence) return;

    const normalizedError = error instanceof Error ? error : new Error(String(error));
    if (normalizedError.name === "AbortError") return;

    errorMessage.value = normalizedError.message;
    loading.value = false;
    emit("error", normalizedError);
  }
}

function beginMounting() {
  if (mountRequested) return;
  mountRequested = true;
  visibilityObserver?.disconnect();
  visibilityObserver = undefined;
  void mountPreview();
}

onMounted(() => {
  if (props.eager || typeof IntersectionObserver === "undefined") {
    beginMounting();
    return;
  }

  visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) beginMounting();
    },
    { rootMargin: "500px 0px" },
  );

  if (hostElement.value) visibilityObserver.observe(hostElement.value);
});

watch(
  () => [props.component, props.example, props.type],
  () => {
    if (mountRequested) void mountPreview();
  },
);

onBeforeUnmount(() => {
  mountSequence += 1;
  visibilityObserver?.disconnect();
  cleanup();
});
</script>

<template>
  <div
    ref="hostElement"
    class="react-host"
    :data-react-host="type"
    :data-react-component="component"
    :aria-busy="loading ? 'true' : undefined"
  >
    <div ref="mountElement" class="react-host__mount" />

    <div v-if="loading" class="react-host__status" role="status">
      {{ loadingLabel }}
    </div>

    <div v-if="errorMessage" class="react-host__error" role="alert">
      <strong>Preview could not be loaded.</strong>
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
.react-host {
  position: relative;
  width: 100%;
  min-width: 0;
}

.react-host__mount {
  width: 100%;
  min-width: 0;
}

.react-host[data-react-host="component"] .react-host__mount,
.react-host[data-react-host="star"] .react-host__mount {
  display: flex;
  align-items: center;
  justify-content: safe center;
}

.react-host__status {
  display: grid;
  min-height: 7rem;
  place-items: center;
  color: color-mix(in srgb, var(--foreground) 65%, transparent);
  font-size: 0.875rem;
}

.react-host__mount:not(:empty) + .react-host__status {
  display: none;
}

.react-host__error {
  display: grid;
  gap: 0.25rem;
  width: 100%;
  border: 2px solid var(--border);
  background: var(--secondary-background);
  padding: 1rem;
  color: var(--foreground);
}

.react-host__error span {
  overflow-wrap: anywhere;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
