<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  value: number
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}>()

const emits = defineEmits<{
  (event: 'update:value', value: number): void
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        container: 'h-5',
        button: 'w-5 h-5',
        input: 'w-6 h-5 text-[10px]',
        icon: 'h-2.5 w-2.5',
      }
    case 'lg':
      return {
        container: 'h-8',
        button: 'w-8 h-8',
        input: 'w-10 h-8 text-sm',
        icon: 'h-4 w-4',
      }
    case 'md':
    default:
      return {
        container: 'h-6',
        button: 'w-6 h-6',
        input: 'w-8 h-6 text-xs',
        icon: 'h-3 w-3',
      }
  }
})

const updateValue = (newValue: number) => {
  // Clamp value between min and max
  const min = props.min ?? 0
  const max = props.max ?? Infinity
  const clampedValue = Math.max(min, Math.min(max, newValue))

  if (clampedValue !== props.value) {
    emits('update:value', clampedValue)
  }
}

const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = parseInt(target.value, 10)
  if (!isNaN(newValue)) {
    updateValue(newValue)
  }
}

const decrement = () => {
  updateValue(props.value - 1)
}

const increment = () => {
  updateValue(props.value + 1)
}
</script>

<template>
  <div :class="sizeClasses.container" class="relative flex items-center">
    <button
      :class="[
        sizeClasses.button,
        'flex items-center justify-center rounded-l-md bg-neutral-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors',
        value <= (min ?? 0) ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      :disabled="value <= (min ?? 0)"
      type="button"
      @click="decrement"
    >
      <svg
        :class="sizeClasses.icon"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          fill-rule="evenodd"
        />
      </svg>
    </button>

    <input
      :class="[
        sizeClasses.input,
        'quantity-input bg-white dark:bg-neutral-800 border-y border-neutral-200 dark:border-neutral-700 text-center text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-transparent',
      ]"
      :max="max"
      :min="min"
      :value="value"
      type="number"
      @change="handleInputChange"
    />

    <button
      :class="[
        sizeClasses.button,
        'flex items-center justify-center rounded-r-md bg-neutral-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors',
        value >= (max ?? Infinity) ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      :disabled="value >= (max ?? Infinity)"
      type="button"
      @click="increment"
    >
      <svg
        :class="sizeClasses.icon"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          fill-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* Hide number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
