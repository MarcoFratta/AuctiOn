<script lang="ts" setup>
import { computed, inject, onMounted, ref } from 'vue'

const props = defineProps<{
  header: string
}>()

const activeTabIndex = inject('activeTabIndex') as any
const registerTabPanel = inject('registerTabPanel') as any
const panelIndex = ref(-1)

// Register this panel
onMounted(() => {
  if (registerTabPanel) {
    // Register and get the index
    panelIndex.value = registerTabPanel({
      header: props.header,
    })
  }
})

// Determine if this panel is active
const isActive = computed(() => {
  return activeTabIndex.value === panelIndex.value
})
</script>

<template>
  <div v-show="isActive" class="tab-panel w-full">
    <slot></slot>
  </div>
</template>
