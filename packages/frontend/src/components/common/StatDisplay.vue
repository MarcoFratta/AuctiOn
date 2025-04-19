<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  title: string
  value: number
  valueColor?: string
  referenceValue?: number
  showPercentage?: boolean
  prefix: string
}

const props = withDefaults(defineProps<Props>(), {
  valueColor: 'text-app-violet-600 dark:text-app-violet-400',
  referenceValue: undefined,
  showPercentage: false,
  prefix: '',
})

// Calculate trend based on reference value if provided
const calculatedTrend = computed(() => {
  if (props.referenceValue !== undefined) {
    if (props.value > props.referenceValue) return 'up'
    if (props.value < props.referenceValue) return 'down'
    return 'neutral'
  }

  // If no reference value, don't show any trend
  return 'none'
})

// Calculate percentage difference if reference value is provided
const percentageDifference = computed(() => {
  if (props.showPercentage && props.referenceValue !== undefined && props.referenceValue !== 0) {
    const diff = ((props.value - props.referenceValue) / Math.abs(props.referenceValue)) * 100
    return `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`
  }
  return undefined
})

const formatValue = (value: number) => {
  return value == 0 ? 'No data' : `${props.prefix} ${value.toFixed(2)}`
}

// Get trend color based on trend direction
const computedTrendColor = computed(() => {
  if (calculatedTrend.value === 'up') return 'text-green-600 dark:text-green-400'
  if (calculatedTrend.value === 'down') return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
})

// Determine if we should show the trend indicator
const showTrendIndicator = computed(() => {
  return props.referenceValue !== undefined && props.value !== 0
})
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 p-2 rounded-lg border border-gray-100 dark:border-neutral-700/50"
  >
    <div class="text-xs text-gray-500 dark:text-gray-400">{{ title }}</div>
    <div class="flex items-center justify-between">
      <div :class="[valueColor, 'text-sm font-bold']">
        {{ formatValue(value) }}
      </div>
      <div v-if="showTrendIndicator" class="flex items-center">
        <div v-if="percentageDifference" :class="[computedTrendColor, 'text-xs font-medium mr-1']">
          {{ percentageDifference }}
        </div>
        <div v-if="calculatedTrend !== 'none'" :class="[computedTrendColor]">
          <svg
            v-if="calculatedTrend === 'up'"
            class="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              fill-rule="evenodd"
            ></path>
          </svg>
          <svg
            v-else-if="calculatedTrend === 'down'"
            class="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
              fill-rule="evenodd"
            ></path>
          </svg>
          <svg
            v-else-if="calculatedTrend === 'neutral'"
            class="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
              fill-rule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
