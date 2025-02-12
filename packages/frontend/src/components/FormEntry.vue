<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  placeHolder: String,
  type: {
    type: String,
    default: 'text',
  },
  modelValue: String,
})
const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="w-full">
    <label class="block text-sm font-medium text-gray-700" for="name">{{ title }}</label>
    <input
      id="name"
      v-model="internalValue"
      :placeholder="placeHolder"
      :type="type"
      class="mt-1 block w-full px-4 py-2 text-gray-600 placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      name="name"
      required
    />
  </div>
</template>
