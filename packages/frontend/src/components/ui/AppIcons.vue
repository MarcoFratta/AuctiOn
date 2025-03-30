<script lang="ts" setup>
import { computed } from 'vue'
// Define props with default values
const props = withDefaults(
  defineProps<{
    name: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    color?: string
  }>(),
  {
    size: 'md',
    color: 'default',
  },
)

// Size mapping
const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-3 h-3'
    case 'sm':
      return 'w-4 h-4'
    case 'md':
      return 'w-5 h-5'
    case 'lg':
      return 'w-6 h-6'
    default:
      return 'w-5 h-5'
  }
})

// Color mapping
const colorClass = computed(() => {
  switch (props.color) {
    case 'violet':
      return 'text-violet-500 dark:text-app-violet-400'
    case 'fuchsia':
      return 'text-fuchsia-500 dark:text-app-fuchsia-400'
    case 'blue':
      return 'text-blue-500 dark:text-blue-400'
    case 'green':
      return 'text-green-500 dark:text-green-400'
    case 'yellow':
      return 'text-yellow-500 dark:text-yellow-400'
    case 'orange':
      return 'text-orange-500 dark:text-orange-400'
    case 'red':
      return 'text-red-500 dark:text-red-400'
    case 'gray':
      return 'text-gray-500 dark:text-gray-400'
    default:
      return 'text-current'
  }
})
</script>

<template>
  <svg
    :class="[sizeClass, colorClass]"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Inventory icon -->
    <path
      v-if="name === 'inventory'"
      d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
    />

    <!-- Weight icon -->
    <path
      v-else-if="name === 'weight'"
      clip-rule="evenodd"
      d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
      fill-rule="evenodd"
    />

    <!-- Info icon -->
    <path
      v-else-if="name === 'info'"
      clip-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      fill-rule="evenodd"
    />

    <!-- Money icon -->
    <path
      v-else-if="name === 'money'"
      clip-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a3 3 0 00-3 3v2H7a1 1 0 000 2h1v1a1 1 0 01-1 1 1 1 0 100 2h6a1 1 0 100-2H9.83c.11-.313.17-.65.17-1v-1h1a1 1 0 100-2h-1V7a1 1 0 112 0 1 1 0 102 0 3 3 0 00-3-3z"
      fill-rule="evenodd"
    />

    <!-- Sale icon -->
    <path
      v-else-if="name === 'sale'"
      d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"
    />

    <!-- Auction icon -->
    <path
      v-else-if="name === 'auction'"
      clip-rule="evenodd"
      d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
      fill-rule="evenodd"
    />

    <!-- Seller queue icon -->
    <path
      v-else-if="name === 'queue'"
      d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"
    />

    <!-- Create sale icon -->
    <path
      v-else-if="name === 'create-sale'"
      clip-rule="evenodd"
      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
      fill-rule="evenodd"
    />

    <!-- Empty state icon -->
    <path
      v-else-if="name === 'empty'"
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />

    <!-- Timer icon -->
    <path
      v-else-if="name === 'timer'"
      clip-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
      fill-rule="evenodd"
    />

    <!-- Waiting icon -->
    <g v-else-if="name === 'waiting'">
      <path
        d="M10 5v3l2.5 2.5M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </g>

    <!-- Fallback to a default icon if name doesn't match -->
    <path
      v-else
      clip-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
      fill-rule="evenodd"
    />
  </svg>
</template>
