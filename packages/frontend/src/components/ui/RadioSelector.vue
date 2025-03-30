<script lang="ts" setup>
const props = defineProps<{
  id: string
  name: string
  value: string | boolean
  modelValue: string | boolean
  label: string
  description?: string
  previewClass?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | boolean): void
}>()

const handleSelect = () => {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div
    :class="[
      modelValue === value
        ? 'border-violet-500 dark:border-app-fuchsia-500 ring-2 ring-violet-500 dark:ring-app-fuchsia-500'
        : 'border-gray-200 dark:border-app-violet-900/30 hover:border-violet-300 dark:hover:border-app-violet-700',
    ]"
    class="border rounded-lg overflow-hidden cursor-pointer transition-all"
    @click="handleSelect"
  >
    <!-- Preview Area -->
    <div
      :class="[
        previewClass ||
          'bg-gray-100 dark:bg-app-black-90 border-gray-200 dark:border-app-violet-900/30',
      ]"
      class="h-24 sm:h-32 border-b"
    ></div>

    <!-- Label Area -->
    <div class="p-2 sm:p-3 flex items-center">
      <div
        :class="[
          modelValue === value
            ? 'bg-violet-500 dark:bg-app-fuchsia-500'
            : 'border-2 border-gray-300 dark:border-gray-600',
        ]"
        class="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
      >
        <div v-if="modelValue === value" class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
      <div class="ml-3 sm:ml-2">
        <span class="text-zinc-900 dark:text-white font-medium">{{ label }}</span>
        <p v-if="description" class="text-gray-500 dark:text-app-violet-300 text-xs mt-0.5">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styling here */
</style>
