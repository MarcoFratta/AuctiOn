<script lang="ts" setup>
// Define props with default values in a single declaration
const props = withDefaults(
  defineProps<{
    type: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    color?: string
    animated?: boolean
  }>(),
  {
    size: 'md',
    color: 'default',
    animated: false,
  },
)
</script>

<template>
  <div
    :class="[
      'game-shape inline-flex items-center justify-center',
      {
        'w-6 h-6': size == 'xs',
        'w-8 h-8': size === 'sm',
        'w-12 h-12': size === 'md',
        'w-16 h-16': size === 'lg',
        'w-24 h-24': size === 'xl',
        'shape-animated': animated,
      },
    ]"
  >
    <!-- Circle -->
    <svg
      v-if="type === 'circle'"
      class="w-full h-full"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        :class="[
          'shape-circle',
          {
            'stroke-violet-500 dark:stroke-app-violet-400': color === 'violet',
            'stroke-fuchsia-500 dark:stroke-app-fuchsia-400': color === 'fuchsia',
            'stroke-blue-500 dark:stroke-blue-400': color === 'default',
          },
        ]"
        cx="50"
        cy="50"
        fill="none"
        r="40"
        stroke-width="4"
      />
      <circle
        :class="[
          'shape-inner',
          {
            'fill-violet-500/10 dark:fill-app-violet-500/20': color === 'violet',
            'fill-fuchsia-500/10 dark:fill-app-fuchsia-500/20': color === 'fuchsia',
            'fill-blue-500/10 dark:fill-blue-500/20': color === 'default',
          },
        ]"
        cx="50"
        cy="50"
        r="32"
      />
      <circle
        :class="[
          'shape-core',
          {
            'fill-violet-500/20 dark:fill-app-violet-500/30': color === 'violet',
            'fill-fuchsia-500/20 dark:fill-app-fuchsia-500/30': color === 'fuchsia',
            'fill-blue-500/20 dark:fill-blue-500/30': color === 'default',
          },
        ]"
        cx="50"
        cy="50"
        r="20"
      />
    </svg>

    <!-- Triangle -->
    <svg
      v-else-if="type === 'triangle'"
      class="w-full h-full"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        :class="[
          'shape-triangle',
          {
            'stroke-violet-500 dark:stroke-app-violet-400': color === 'violet',
            'stroke-fuchsia-500 dark:stroke-app-fuchsia-400': color === 'fuchsia',
            'stroke-green-500 dark:stroke-green-400': color === 'default',
          },
        ]"
        fill="none"
        points="50,10 90,80 10,80"
        stroke-width="4"
      />
      <polygon
        :class="[
          'shape-inner',
          {
            'fill-violet-500/10 dark:fill-app-violet-500/20': color === 'violet',
            'fill-fuchsia-500/10 dark:fill-app-fuchsia-500/20': color === 'fuchsia',
            'fill-green-500/10 dark:fill-green-500/20': color === 'default',
          },
        ]"
        points="50,20 80,75 20,75"
      />
      <polygon
        :class="[
          'shape-core',
          {
            'fill-violet-500/20 dark:fill-app-violet-500/30': color === 'violet',
            'fill-fuchsia-500/20 dark:fill-app-fuchsia-500/30': color === 'fuchsia',
            'fill-green-500/20 dark:fill-green-500/30': color === 'default',
          },
        ]"
        points="50,35 70,70 30,70"
      />
    </svg>

    <!-- Square -->
    <svg
      v-else-if="type === 'square'"
      class="w-full h-full"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        :class="[
          'shape-square',
          {
            'stroke-violet-500 dark:stroke-app-violet-400': color === 'violet',
            'stroke-fuchsia-500 dark:stroke-app-fuchsia-400': color === 'fuchsia',
            'stroke-red-500 dark:stroke-red-400': color === 'default',
          },
        ]"
        fill="none"
        height="80"
        stroke-width="4"
        width="80"
        x="10"
        y="10"
      />
      <rect
        :class="[
          'shape-inner',
          {
            'fill-violet-500/10 dark:fill-app-violet-500/20': color === 'violet',
            'fill-fuchsia-500/10 dark:fill-app-fuchsia-500/20': color === 'fuchsia',
            'fill-red-500/10 dark:fill-red-500/20': color === 'default',
          },
        ]"
        height="60"
        width="60"
        x="20"
        y="20"
      />
      <rect
        :class="[
          'shape-core',
          {
            'fill-violet-500/20 dark:fill-app-violet-500/30': color === 'violet',
            'fill-fuchsia-500/20 dark:fill-app-fuchsia-500/30': color === 'fuchsia',
            'fill-red-500/20 dark:fill-red-500/30': color === 'default',
          },
        ]"
        height="30"
        width="30"
        x="35"
        y="35"
      />
    </svg>
  </div>
</template>

<style scoped>
.shape-animated .shape-circle,
.shape-animated .shape-triangle,
.shape-animated .shape-square {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  animation: dash 3s ease-in-out infinite alternate;
}

.shape-animated .shape-inner {
  animation: pulse 3s ease-in-out infinite alternate;
}

.shape-animated .shape-core {
  animation: pulse 3s ease-in-out infinite alternate-reverse;
}

@keyframes dash {
  from {
    stroke-dashoffset: 300;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Add a subtle rotation for triangles when animated */
.shape-animated svg:has(.shape-triangle) {
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
