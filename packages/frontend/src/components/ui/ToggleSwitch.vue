<script lang="ts" setup>

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const toggleSwitch = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <div class="relative inline-block w-12 align-middle select-none">
    <input
      :id="id"
      :checked="modelValue"
      :disabled="disabled"
      class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
      type="checkbox"
      @change="toggleSwitch"
    />
    <label
      :class="{ 'opacity-50': disabled }"
      :for="id"
      class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-app-black cursor-pointer"
    ></label>
  </div>
</template>

<style scoped>
/* Toggle Switch Styling */
.toggle-checkbox:checked {
  transform: translateX(100%);
  border-color: #8b5cf6; /* Violet border */
}

.toggle-checkbox:checked + .toggle-label {
  background-color: #a78bfa; /* Lighter violet background */
}

.dark .toggle-checkbox:checked {
  border-color: #ff00ff; /* Fuchsia border in dark mode */
}

.dark .toggle-checkbox:checked + .toggle-label {
  background-color: #9900ff; /* Purple background in dark mode */
}

.toggle-label {
  transition: background-color 0.2s ease;
}
</style>
