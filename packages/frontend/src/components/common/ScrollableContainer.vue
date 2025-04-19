<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  showScrollIndicator?: boolean
  maxHeight?: string
  containerClass?: string
}>()

const containerRef = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)
const isScrolled = ref(false)

// Check if content overflows and needs scrolling
const checkOverflow = () => {
  if (!containerRef.value) return

  const { scrollHeight, clientHeight, scrollTop } = containerRef.value
  hasOverflow.value = scrollHeight > clientHeight
  isScrolled.value = scrollTop > 1
}

// Force check overflow after content changes
const forceCheckOverflow = async () => {
  await nextTick()
  checkOverflow()
}

// Watch for content changes
const resizeObserver = ref<ResizeObserver | null>(null)
const mutationObserver = ref<MutationObserver | null>(null)

onMounted(() => {
  checkOverflow()

  // Set up resize observer to detect size changes
  resizeObserver.value = new ResizeObserver(() => {
    checkOverflow()
  })

  // Set up mutation observer to detect content changes
  mutationObserver.value = new MutationObserver(() => {
    forceCheckOverflow()
  })

  if (containerRef.value) {
    resizeObserver.value.observe(containerRef.value)
    containerRef.value.addEventListener('scroll', checkOverflow)

    // Observe all changes to the container's children
    mutationObserver.value.observe(containerRef.value, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    })

    // Force check after a short delay to catch any late-rendered content
    setTimeout(checkOverflow, 100)
  }
})

onUnmounted(() => {
  if (resizeObserver.value && containerRef.value) {
    resizeObserver.value.unobserve(containerRef.value)
    containerRef.value.removeEventListener('scroll', checkOverflow)
  }

  if (mutationObserver.value) {
    mutationObserver.value.disconnect()
  }
})

// Expose the checkOverflow method for parent components to call
defineExpose({
  checkOverflow,
  forceCheckOverflow,
})
</script>

<template>
  <!-- Scrollable container -->
  <div
    ref="containerRef"
    :style="maxHeight ? `max-height: ${maxHeight}` : ''"
    class="flex flex-col w-full h-full overflow-y-auto scrollbar-hide scroll-smooth"
    @scroll="checkOverflow"
  >
    <div :class="containerClass ?? ''" class="min-h-0 flex-grow overscroll-none">
      <slot></slot>
    </div>
    <!-- Scroll indicator (subtle bounce animation at bottom when not scrolled) -->
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
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

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

/* Apply these styles to prevent bounce but maintain performance */
.overscroll-none {
  overscroll-behavior: none;
}

.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
