<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger
    validator: (value: string) => ['primary', 'secondary', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
  },
})

const emit = defineEmits(['click'])

const handleClick = (event: MouseEvent) => {
  if (!props.disable && !props.loading) {
    emit('click', event)
  }
}

const buttonClasses = computed(() => {
  const baseClasses =
    'relative flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black'

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }[props.size]

  // Variant classes
  const variantClasses = {
    primary:
      props.disable || props.loading
        ? 'bg-app-fuchsia-900/50 text-white/70 cursor-not-allowed'
        : 'bg-app-fuchsia-600 hover:bg-app-fuchsia-500 text-white shadow-lg shadow-app-fuchsia-900/30 hover:shadow-app-fuchsia-600/40 focus:ring-app-fuchsia-500',

    secondary:
      props.disable || props.loading
        ? 'bg-app-violet-900/50 text-white/70 cursor-not-allowed'
        : 'bg-app-violet-900 hover:bg-app-violet-800/70 text-white shadow-lg shadow-app-violet-900/20 hover:shadow-app-violet-800/30 focus:ring-app-violet-700',

    danger:
      props.disable || props.loading
        ? 'bg-red-900/50 text-white/70 cursor-not-allowed'
        : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 hover:shadow-red-600/40 focus:ring-red-500',
  }[props.variant]

  return `${baseClasses} ${sizeClasses} ${variantClasses}`
})
</script>

<template>
  <button :class="buttonClasses" :disabled="disable || loading" type="button" @click="handleClick">
    <!-- Loading spinner -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
    </div>

    <!-- Button content with fade effect when loading -->
    <div :class="{ 'opacity-0': loading }">
      <slot>{{ text }}</slot>
    </div>
  </button>
</template>

<style scoped>
.spinner {
  width: 24px;
  height: 24px;
  position: relative;
}

.double-bounce1,
.double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation: sk-bounce 2s infinite ease-in-out;
}

.double-bounce2 {
  animation-delay: -1s;
}

@keyframes sk-bounce {
  0%,
  100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
}

/* Glow effect on hover */
button:not(:disabled):hover::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 0.375rem;
  background: linear-gradient(45deg, rgba(255, 0, 255, 0.2), rgba(102, 0, 255, 0.2));
  z-index: -1;
  filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

button:not(:disabled):hover::after {
  opacity: 1;
}
</style>
