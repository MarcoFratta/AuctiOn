<script lang="ts" setup>
import { onMounted, provide, ref } from 'vue'

const props = defineProps<{
  activeIndex?: number
}>()

const emit = defineEmits<{
  (e: 'tab-change', index: number): void
}>()

const activeTabIndex = ref(props.activeIndex || 0)

const switchTab = (index: number) => {
  activeTabIndex.value = index
  emit('tab-change', index)
}

provide('activeTabIndex', activeTabIndex)
provide('switchTab', switchTab)

// Get all tab panels
const tabPanels = ref<any[]>([])

const registerTabPanel = (panel: any) => {
  tabPanels.value.push(panel)
}

provide('registerTabPanel', registerTabPanel)

onMounted(() => {
  // Ensure the active tab is visible on mount
  if (activeTabIndex.value >= 0 && activeTabIndex.value < tabPanels.value.length) {
    switchTab(activeTabIndex.value)
  }
})
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 w-full">
    <!-- Mobile Tab Headers - Fixed at top -->
    <div
      class="md:hidden fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-app-black-80 border-b border-gray-200 dark:border-app-violet-900/30 shadow-sm"
    >
      <div class="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        <div class="flex min-w-full">
          <button
            v-for="(panel, index) in tabPanels"
            :key="index"
            :class="[
              activeTabIndex === index
                ? 'border-violet-500 dark:border-app-fuchsia-500 text-violet-700 dark:text-app-fuchsia-400 font-medium'
                : 'border-transparent text-gray-700 dark:text-gray-300',
            ]"
            class="flex-1 min-w-[100px] px-4 py-3 border-b-2 flex items-center justify-center whitespace-nowrap snap-start"
            @click="switchTab(index)"
          >
            {{ panel.header }}
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Tab Headers (sidebar style) -->
    <div class="hidden md:block md:w-64 shrink-0">
      <div
        class="bg-white dark:bg-app-black-80 border border-gray-200 dark:border-app-violet-900/30 rounded-lg overflow-hidden sticky top-4"
      >
        <div class="p-4 border-b border-gray-200 dark:border-app-violet-900/30">
          <h2 class="text-lg font-medium text-zinc-900 dark:text-white">
            <slot name="title">Settings</slot>
          </h2>
        </div>
        <nav class="p-2">
          <button
            v-for="(panel, index) in tabPanels"
            :key="index"
            :class="[
              'w-full text-left px-3 py-2 rounded-md mb-1 flex items-center',
              activeTabIndex === index
                ? 'bg-violet-100 dark:bg-app-fuchsia-900/20 text-violet-700 dark:text-app-fuchsia-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-app-black-90',
            ]"
            @click="switchTab(index)"
          >
            {{ panel.header }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content flex-1 w-full mt-16 md:mt-0">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but allow scrolling */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Smooth scrolling for tabs */
.snap-x {
  scroll-behavior: smooth;
}

/* Fade transition for tab changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
