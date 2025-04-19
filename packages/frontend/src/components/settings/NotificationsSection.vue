<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settingsStore'
import { computed } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'

const settingsStore = useSettingsStore()

// Computed property to check if any notifications are enabled
const notificationsEnabled = computed({
  get: () => settingsStore.lobbyNotifications || settingsStore.auctionNotifications,
  set: (value) => {
    if (!value) {
      // Just disable both notification types
      settingsStore.disableNotifications()
    } else {
      // Enable both when turning notifications back on
      settingsStore.lobbyNotifications = true
      settingsStore.auctionNotifications = true
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
        Notifications
      </h3>

      <div class="space-y-6">
        <!-- Notification Types -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-zinc-900 dark:text-white font-medium">Notification Settings</h4>
            <button
              v-if="notificationsEnabled"
              class="text-sm text-app-violet-600 dark:text-app-violet-400 hover:text-app-violet-800 dark:hover:text-app-violet-300"
              @click="settingsStore.disableNotifications()"
            >
              Disable All
            </button>
          </div>

          <div class="flex items-center justify-between py-2">
            <div>
              <h5 class="text-zinc-900 dark:text-white">Lobby Notifications</h5>
              <p class="text-gray-500 dark:text-app-violet-300 text-sm mr-3">
                Notifications about lobby events
              </p>
            </div>
            <ToggleSwitch
              id="lobby-notifications-toggle"
              v-model="settingsStore.lobbyNotifications"
            />
          </div>

          <div class="flex items-center justify-between py-2">
            <div>
              <h5 class="text-zinc-900 dark:text-white">Auction Notifications</h5>
              <p class="text-gray-500 dark:text-app-violet-300 text-sm mr-3">
                Notifications about auction events and updates
              </p>
            </div>
            <ToggleSwitch
              id="auction-notifications-toggle"
              v-model="settingsStore.auctionNotifications"
            />
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
