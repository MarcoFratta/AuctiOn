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
    <label class="block text-sm font-medium text-gray-700" for="name">{{ title }}</label>
    <input
      v-model="internalValue"
      :placeholder="placeHolder"
      :autocomplete="autocomplete"
      :type="type"
      :max="max"
      :min="min"
      :step="step"
      class="mt-1 block w-full px-4 py-2 text-gray-600 placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      name="name"
      required
    />
    <label class="block text-sm font-medium mt-2 text-red-700" for="name">{{ error }}</label>
  </div>
</template>
