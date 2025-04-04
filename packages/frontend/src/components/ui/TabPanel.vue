<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  header: string
  activeTabIndex: number
  registerTabPanel: (panel: any) => number
}>()

const panelIndex = ref(-1)

// Register this panel
onMounted(() => {
  // Register and get the index
  panelIndex.value = props.registerTabPanel({
    header: props.header,
  })
})

// Determine if this panel is active
const isActive = computed(() => {
  return props.activeTabIndex === panelIndex.value
})
</script>

<template>
  <div v-show="isActive" class="tab-panel w-full">
    <slot></slot>
  </div>
</template>
