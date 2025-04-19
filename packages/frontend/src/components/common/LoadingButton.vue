<script lang="ts" setup>
import { computed } from 'vue'
import { useAlert } from '@/composables/useAlert'

const alert = useAlert()

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
  // New props for confirmation
  requireConfirm: {
    type: Boolean,
    default: false,
  },
  confirmTitle: {
    type: String,
    default: 'Confirm Action',
  },
  confirmMessage: {
    type: String,
    default: 'Are you sure you want to proceed?',
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm',
  },
  btnStyle: {
    type: String,
    default: '',
  },
  customStyle: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = async (event: MouseEvent) => {
  if (props.disable || props.loading) return

  if (props.requireConfirm) {
    const confirmed = await alert.confirm(
      props.confirmTitle,
      props.confirmMessage,
      props.confirmButtonText,
    )

    if (confirmed) {
      emit('click', event)
    }
  } else {
    emit('click', event)
  }
}

const buttonClasses = computed(() => {
  const baseClasses =
    'relative flex items-center justify-center rounded-md' +
    ' font-medium transition-all duration-200 focus:outline-none ' +
    'focus:ring-2 focus:ring-offset-2 focus:ring-offset-black'

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }[props.size]

  // Variant classes - with theme support
  const variantClasses = {
    primary:
      props.disable || props.loading
        ? 'bg-app-fuchsia-900/50 text-white/70 cursor-not-allowed'
        : 'bg-app-fuchsia-600 hover:bg-app-fuchsia-500 text-white shadow-md hover:shadow-lg shadow-lg shadow-app-fuchsia-900/30 hover:shadow-app-fuchsia-600/40 focus:ring-indigo-500 focus:ring-app-fuchsia-500',

    secondary:
      props.disable || props.loading
        ? 'bg-app-violet-900/50 text-gray-500 text-white/70 cursor-not-allowed'
        : 'bg-app-violet-900 hover:bg-app-violet-800/70 text-gray-800 text-white shadow-sm hover:shadow-md shadow-lg shadow-app-violet-900/20 hover:shadow-app-violet-800/30 focus:ring-gray-400 focus:ring-app-violet-700',

    danger:
      props.disable || props.loading
        ? 'bg-red-300 bg-red-900/50 text-white/70 cursor-not-allowed'
        : 'text-white shadow-md hover:shadow-lg shadow-lg shadow-red-900/30 hover:shadow-red-600/40 focus:ring-red-500',
  }[props.variant]

  return `${sizeClasses} ${variantClasses} ${baseClasses} `
})
</script>

<template>
  <button
    :class="(customStyle ? '' : buttonClasses) + ` ${btnStyle}`"
    :disabled="disable || loading"
    type="button"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <div v-if="loading && !customStyle" class="absolute inset-0 flex items-center justify-center">
      <div class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
    </div>
    <!-- Button content -->
    <div :class="{ invisible: loading }">
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

.dark button:not(:disabled):hover::after {
  opacity: 1;
}
</style>
