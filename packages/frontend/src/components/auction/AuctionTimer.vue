<script lang="ts" setup>
import { computed } from 'vue'
import AppIcons from '@/components/icons/AppIcons.vue'

const props = defineProps<{
  remainingTime: number
  totalTime: number
}>()

const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const timeClass = computed(() => {
  if (props.remainingTime <= 5) return 'text-red-500 dark:text-red-400'
  if (props.remainingTime <= 15) return 'text-yellow-500 dark:text-yellow-400'
  return 'text-green-500 dark:text-green-400'
})

const timerIconClass = computed(() => {
  if (props.remainingTime <= 5) return 'text-red-500 dark:text-red-400 timer-urgent'
  if (props.remainingTime <= 15) return 'text-yellow-500 dark:text-yellow-400 timer-warning'
  return 'text-gray-500 dark:text-gray-400'
})

const progressBarClass = computed(() => {
  if (props.remainingTime <= 5) return 'bg-red-500 dark:bg-red-600 timer-progress-urgent'
  if (props.remainingTime <= 15) return 'bg-yellow-500 dark:bg-yellow-600 timer-progress-warning'
  return 'bg-green-500 dark:bg-green-600'
})

const timerTextClass = computed(() => {
  const baseClass = 'font-mono font-bold text-sm md:text-base'
  if (props.remainingTime <= 5) return `${baseClass} timer-pulse-urgent ${timeClass.value}`
  if (props.remainingTime <= 15) return `${baseClass} timer-pulse-warning ${timeClass.value}`
  return `${baseClass} ${timeClass.value}`
})
</script>

<template>
  <div class="flex items-center gap-1 md:gap-2">
    <!-- Timer icon -->
    <AppIcons :class="timerIconClass" name="timer" size="sm" />

    <!-- Timer text -->
    <span :class="timerTextClass">
      {{ formatTimeRemaining(remainingTime) }}
    </span>

    <!-- Timer progress bar -->
    <div
      v-if="remainingTime > 0"
      class="timer-progress-container ml-1 h-4 w-12 md:w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
    >
      <div
        :class="progressBarClass"
        :style="{
          width: `${Math.min(100, (remainingTime / totalTime) * 100)}%`,
        }"
        class="timer-progress h-full"
      ></div>
    </div>
  </div>
</template>

<style scoped>
/* Timer animations */
.timer-urgent {
  animation: shake 0.5s infinite;
}

.timer-warning {
  animation: pulse-warning 1s infinite;
}

.timer-pulse-urgent {
  animation: pulse-urgent 0.5s infinite;
}

.timer-pulse-warning {
  animation: pulse-warning 1.5s infinite;
}

.timer-progress-urgent {
  animation: progress-flash 0.5s infinite;
}

.timer-progress-warning {
  animation: progress-pulse 1.5s infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-1px);
  }
  75% {
    transform: translateX(1px);
  }
}

@keyframes pulse-urgent {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes pulse-warning {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes progress-flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes progress-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Timer progress bar */
.timer-progress-container {
  position: relative;
  transition: all 1s ease;
}

.timer-progress {
  transition: width 0.2s linear;
}
</style>
