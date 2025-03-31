<script lang="ts" setup>
import { computed } from 'vue'
import { IInput } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/settingsStore.ts'

const settingsStore = useSettingsStore()

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
  <div class="w-full flex flex-col gap-2">
    <label
      v-if="title"
      :for="title"
      class="w-full ml-1 text-left text-sm font-medium text-gray-700 dark:text-app-violet-200"
    >
      {{ title }}
    </label>
    <IInput
      :id="title"
      v-model="internalValue"
      :placeholder="placeHolder"
      :autocomplete="autocomplete"
      class="w-full bg-app-white dark:bg-zinc-800"
      :type="type"
      :max="max"
      :min="min"
      :step="step"
      required
    />
    <div v-if="error" class="ml-1 text-red-400 text-sm">{{ error }}</div>
  </div>
</template>
