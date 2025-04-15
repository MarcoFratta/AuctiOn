<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settingsStore.ts'
import DefaultAuthLinks from '@/components/DefaultAuthLinks.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useHeaderStore } from '@/stores/headerStore'
import { computed } from 'vue'
import AppIcons from '@/components/icons/AppIcons.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const headerStore = useHeaderStore()

// Compute whether we have custom content
const hasCustomContent = computed(() => headerStore.used)

const emits = defineEmits(['openDrawer'])

const toggleDarkMode = () => {
  settingsStore.toggleDarkMode()
}
</script>

<template>
  <header
    class="sticky top-0 left-0 right-0 bg-white dark:bg-app-black border-b border-app-violet-900/30 h-12 flex items-center justify-between px-2 md:px-4 z-50 w-full"
  >
    <!-- Left section with menu button and title -->
    <div class="flex items-center">
      <!-- Menu Button -->
      <button
        class="mr-3 text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center"
        @click="emits('openDrawer')"
      >
        <AppIcons name="menu" size="lg" />
      </button>

      <!-- Title -->
      <router-link class="flex items-center" to="/">
        <h1 class="text-lg font-bold text-zinc-900 dark:text-white">
          <slot name="title">AuctiOn</slot>
        </h1>
      </router-link>
    </div>

    <!-- Right section with theme toggle and user actions -->
    <div class="flex items-center">
      <!-- Theme Toggle -->
      <button
        class="p-1.5 rounded-md text-zinc-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-app-fuchsia-900/20 transition-colors flex items-center justify-center"
        @click="toggleDarkMode"
      >
        <AppIcons :name="settingsStore.darkMode ? 'sun' : 'moon'" size="md" />
      </button>

      <!-- Target div for teleported content -->
      <div id="header-right-content" class="lg:ml-2 flex flex-row gap-2"></div>

      <!-- Default auth links if no custom content -->
      <template v-if="!hasCustomContent">
        <div class="flex items-center ml-2 lg:ml-2">
          <DefaultAuthLinks v-if="!authStore.isAuthenticated" />
          <router-link
            v-else
            class="p-1.5 rounded-md text-zinc-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-app-fuchsia-900/20 transition-colors flex items-center justify-center"
            to="/account"
            title="Profile"
          >
            <AppIcons name="account" size="md" />
          </router-link>
        </div>
      </template>
    </div>
  </header>
</template>
