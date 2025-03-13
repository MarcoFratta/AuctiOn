<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  placeHolder: String,
  type: {
    type: String,
    default: 'text',
  },
  min: Number,
  max: Number,
  step: Number,
  error: String,
  modelValue: null,
  autocomplete: String,
})
const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => (props.type == 'number' ? Number(props.modelValue) : props.modelValue),
  set: (value) => {
    const newValue = props.type === 'number' ? Number(value) : value
    emit('update:modelValue', newValue)
  },
})
</script>

<template>
  <div class="w-full">
    <label v-if="title" :for="title" class="block text-sm font-medium text-gray-200 mb-1">
      {{ title }}
    </label>
    <input
      :id="title"
      v-model="internalValue"
      :placeholder="placeHolder"
      :autocomplete="autocomplete"
      :type="type"
      :max="max"
      :min="min"
      :step="step"
      :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': error }"
      class="w-full px-3 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
      required
    />
    <p v-if="error" class="mt-1.5 text-sm text-red-400">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/* Hide spinner buttons for number inputs */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
