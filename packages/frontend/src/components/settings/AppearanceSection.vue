<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settingsStore'
import { computed } from 'vue'
import RadioSelector from '@/components/ui/RadioSelector.vue'
import BaseCard from '@/components/BaseCard.vue'

const settingsStore = useSettingsStore()

// Dark mode computed property for v-model binding
const darkMode = computed({
  get: () => settingsStore.darkMode,
  set: (value) => {
    if (settingsStore.darkMode !== value) {
      settingsStore.toggleDarkMode()
    }
  },
})
</script>

<template>
  <div class="w-full h-full">
    <BaseCard class="h-full">
      <h3
        class="text-xl font-bold text-zinc-900 dark:text-white mb-4 sm:mb-6 pb-4 border-b border-gray-200 dark:border-app-violet-900/30"
      >
        Appearance
      </h3>

      <div class="space-y-8">
        <!-- Theme Selector -->
        <div>
          <h4 class="text-zinc-900 dark:text-white font-medium mb-4">Theme</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RadioSelector
              id="theme-light"
              v-model="darkMode"
              :value="false"
              label="Light"
              name="theme"
              previewClass="bg-white border-gray-200"
            />

            <RadioSelector
              id="theme-dark"
              v-model="darkMode"
              :value="true"
              label="Dark"
              name="theme"
              previewClass="bg-gray-900 border-gray-700"
            />
          </div>
        </div>

        <!-- Accent Color (Future Feature) -->
        <div>
          <h4 class="text-zinc-900 dark:text-white font-medium mb-2">Accent Color</h4>
          <p class="text-gray-500 dark:text-app-violet-300 text-sm mb-4">
            Choose your preferred accent color for the application
          </p>
          <div class="flex items-center space-x-4">
            <div
              class="w-8 h-8 rounded-full bg-violet-500 cursor-pointer ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-gray-900"
            ></div>
            <div class="w-8 h-8 rounded-full bg-fuchsia-500 cursor-pointer"></div>
            <div class="w-8 h-8 rounded-full bg-blue-500 cursor-pointer"></div>
            <div class="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
            <div class="w-8 h-8 rounded-full bg-yellow-500 cursor-pointer"></div>
          </div>
          <div class="mt-2">
            <span
              class="text-xs text-gray-500 dark:text-app-violet-300 bg-gray-100 dark:bg-app-black-90 px-2 py-1 rounded"
              >Coming Soon</span
            >
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
