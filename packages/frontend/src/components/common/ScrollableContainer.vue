<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  showScrollIndicator?: boolean
  maxHeight?: string
  containerClass?: string
}>()

const containerRef = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)
const isScrolled = ref(false)

// Simplified check overflow function
const checkOverflow = () => {
  if (!containerRef.value) return

  const { scrollHeight, clientHeight, scrollTop } = containerRef.value
  hasOverflow.value = scrollHeight > clientHeight
  isScrolled.value = scrollTop > 10
}

// Throttle scroll events to improve performance
let scrollTimeout: number | null = null
const handleScroll = () => {
  if (scrollTimeout) return

  scrollTimeout = window.setTimeout(() => {
    checkOverflow()
    scrollTimeout = null
  }, 100)
}

onMounted(() => {
  checkOverflow()

  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll, { passive: true })

    // Only check once on mount, not continuously
    setTimeout(checkOverflow, 100)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }

  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})

// Expose a simpler API
defineExpose({
  checkOverflow,
})
</script>

<template>
  <!-- Scrollable container with passive scroll handling -->
  <div
    ref="containerRef"
    :class="containerClass ?? ''"
    class="flex flex-col w-full h-full overflow-y-auto scrollbar-hide"
  >
    <slot></slot>
    <!-- Scroll indicator -->
    <div
      v-if="showScrollIndicator && hasOverflow && !isScrolled"
      class="sticky bottom-0 left-0 right-0 flex justify-center pointer-events-none z-10 pb-1"
    >
      <div
        class="h-4 w-4 rounded-full bg-neutral-200/70 dark:bg-neutral-700/70 flex items-center justify-center animate-subtle-bounce"
      >
        <svg
          class="h-2.5 w-2.5 text-neutral-500 dark:text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes subtle-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
}

.animate-subtle-bounce {
  animation: subtle-bounce 2s ease-in-out infinite;
}
</style>
