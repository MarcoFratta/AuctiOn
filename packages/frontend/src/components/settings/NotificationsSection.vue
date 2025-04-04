<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settingsStore'
import { ref } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'

const settingsStore = useSettingsStore()

// Notification settings
const notificationsEnabled = ref(true) // Default to enabled
const gameInvites = ref(true)
const gameUpdates = ref(true)
const systemAnnouncements = ref(true)

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value
  settingsStore.notifications = notificationsEnabled.value
}

const updateGameInvites = (value: boolean) => {
  gameInvites.value = value
}

const updateGameUpdates = (value: boolean) => {
  gameUpdates.value = value
}

const updateSystemAnnouncements = (value: boolean) => {
  systemAnnouncements.value = value
}
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
        <!-- Global Notifications Toggle -->
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-zinc-900 dark:text-white font-medium">Enable Notifications</h4>
            <p class="text-gray-500 dark:text-app-violet-300 text-sm mr-3">
              Receive notifications about game events and updates
            </p>
          </div>
          <ToggleSwitch
            id="notification-toggle"
            :modelValue="notificationsEnabled"
            @update:modelValue="toggleNotifications"
          />
        </div>

        <!-- Notification Types -->
        <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-app-violet-900/30">
          <h4 class="text-zinc-900 dark:text-white font-medium">Notification Types</h4>

          <div class="flex items-center justify-between py-2">
            <div>
              <h5 class="text-zinc-900 dark:text-white">Game Invites</h5>
              <p class="text-gray-500 dark:text-app-violet-300 text-sm mr-3">
                Notifications when you're invited to join a game
              </p>
            </div>
            <ToggleSwitch
              id="game-invites-toggle"
              :disabled="!notificationsEnabled"
              :modelValue="gameInvites"
              @update:modelValue="updateGameInvites"
            />
          </div>

          <div class="flex items-center justify-between py-2">
            <div>
              <h5 class="text-zinc-900 dark:text-white">Game Updates</h5>
              <p class="text-gray-500 dark:text-app-violet-300 text-sm mr-3">
                Notifications about your turn or game state changes
              </p>
            </div>
            <ToggleSwitch
              id="game-updates-toggle"
              :disabled="!notificationsEnabled"
              :modelValue="gameUpdates"
              @update:modelValue="updateGameUpdates"
            />
          </div>

          <div class="flex items-center justify-between py-2">
            <div>
              <h5 class="text-zinc-900 dark:text-white">System Announcements</h5>
              <p class="text-gray-500 dark:text-app-violet-300 text-sm mr-3">
                Important announcements about the platform
              </p>
            </div>
            <ToggleSwitch
              id="system-announcements-toggle"
              :disabled="!notificationsEnabled"
              :modelValue="systemAnnouncements"
              @update:modelValue="updateSystemAnnouncements"
            />
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
