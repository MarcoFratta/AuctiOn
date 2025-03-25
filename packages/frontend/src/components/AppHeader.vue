<script lang="ts" setup>
defineEmits(['toggle-drawer'])
</script>

<template>
  <header
    class="bg-app-black backdrop-blur-md border-b border-app-violet-900/30 sticky top-0 z-40 h-12"
  >
    <div class="w-full h-full px-4 flex items-center">
      <div class="flex items-center gap-3">
        <!-- Menu button -->
        <button
          class="p-1.5 rounded-full hover:bg-app-fuchsia-900/30 transition-colors"
          @click="$emit('toggle-drawer')"
        >
          <svg
            class="text-white"
            fill="none"
            height="18"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        <!-- App title -->
        <RouterLink class="text-lg font-bold text-white tracking-wider" to="/">
          <span class="bg-clip-text text-transparent bg-gradient-fuchsia">AuctiOn</span>
        </RouterLink>

        <!-- Title slot -->
        <slot name="header"></slot>
      </div>

      <!-- Flexible space -->
      <div class="flex-grow"></div>

      <!-- Right content slot -->
      <slot name="right-content">
        <!-- Default right content -->
      </slot>
    </div>
  </header>
</template>
