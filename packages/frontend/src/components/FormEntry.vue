<script lang="ts" setup>
import { computed } from 'vue'
import { IInput } from '@/components/ui/input'

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
  <div class="flex w-full flex-col items-center justify-center gap-2">
    <label
      v-if="title"
      :for="title"
      class="ml-4 w-full text-left max-w-sm text-sm font-medium text-gray-200 dark:text-zinc-200"
    >
      {{ title }}
    </label>
    <IInput
      :id="title"
      v-model="internalValue"
      :placeholder="placeHolder"
      :autocomplete="autocomplete"
      class="bg-zinc-800 text-gray-200"
      container-class="w-full max-w-sm"
      :type="type"
      :max="max"
      :min="min"
      :step="step"
      required
    />
    <p v-if="error" class="mt-1.5 text-sm text-red-400">
      {{ error }}
    </p>
  </div>
</template>
