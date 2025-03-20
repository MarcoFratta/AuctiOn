<script lang="ts" setup>
defineEmits(['toggle-drawer'])
</script>

<template>
  <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 h-16">
    <div class="w-full h-full px-4 flex items-center">
      <div class="flex items-center gap-3">
        <!-- Menu button -->
        <button
          class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          @click="$emit('toggle-drawer')"
        >
          <span class="text-xl text-white">☰</span>
        </button>

        <!-- App title - Hide on very small screens when in game view -->
        <RouterLink class="text-xl font-bold text-white" to="/">AuctiOn</RouterLink>

        <!-- Title slot -->
        <slot name="header"> </slot>
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
