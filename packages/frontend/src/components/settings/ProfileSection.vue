<script lang="ts" setup>
import { useUserStore } from '@/stores/userStore'
import BaseCard from '@/components/BaseCard.vue'
import UserAvatar from '@/components/user/UserAvatar.vue'

const props = defineProps<{
  accountCreated: Date
}>()

const userStore = useUserStore()

// Format date for display
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="w-full h-full">
    <BaseCard class="h-full">
      <h3
        class="text-xl font-bold text-zinc-900 dark:text-white mb-4 sm:mb-6 pb-4 border-b border-gray-200 dark:border-app-violet-900/30"
      >
        Profile
      </h3>

      <div class="space-y-6">
        <!-- Profile Picture -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <UserAvatar
            :username="userStore.user?.username ?? ''"
            class="bg-neutral-700"
            size="large"
          />
          <div>
            <h4 class="text-zinc-900 dark:text-white font-medium mb-1">Profile Picture</h4>
            <p class="text-gray-500 dark:text-app-violet-300 text-sm mb-3">
              Upload a profile picture to personalize your account
            </p>
            <button
              class="px-3 py-1.5 bg-violet-100 dark:bg-app-violet-900/20 text-violet-700 dark:text-app-violet-400 rounded-md text-sm font-medium hover:bg-violet-200 dark:hover:bg-app-violet-900/30 transition-colors"
            >
              Upload photo
            </button>
          </div>
        </div>

        <!-- Username -->
        <div class="space-y-2">
          <label class="block text-zinc-900 dark:text-white font-medium">Username</label>
          <div class="flex items-center">
            <input
              :value="userStore.user?.username || ''"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-app-black-90 border border-gray-300 dark:border-app-violet-900/30 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-app-fuchsia-500"
              placeholder="Username"
              readonly
              type="text"
            />
            <button
              class="ml-3 px-3 py-2 bg-violet-100 dark:bg-app-violet-900/20 text-violet-700 dark:text-app-violet-400 rounded-md text-sm font-medium hover:bg-violet-200 dark:hover:bg-app-violet-900/30 transition-colors"
            >
              Edit
            </button>
          </div>
          <p class="text-gray-500 dark:text-app-violet-300 text-sm">
            Your username is visible to other players
          </p>
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label class="block text-zinc-900 dark:text-white font-medium">Email</label>
          <div class="flex items-center">
            <input
              :value="userStore.user?.email || ''"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-app-black-90 border border-gray-300 dark:border-app-violet-900/30 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-app-fuchsia-500"
              placeholder="Email"
              readonly
              type="email"
            />
            <button
              class="ml-3 px-3 py-2 bg-violet-100 dark:bg-app-violet-900/20 text-violet-700 dark:text-app-violet-400 rounded-md text-sm font-medium hover:bg-violet-200 dark:hover:bg-app-violet-900/30 transition-colors"
            >
              Edit
            </button>
          </div>
          <p class="text-gray-500 dark:text-app-violet-300 text-sm">
            Your email is used for account recovery and notifications
          </p>
        </div>

        <!-- Account Created -->
        <div class="space-y-2">
          <label class="block text-zinc-900 dark:text-white font-medium">Account Created</label>
          <div
            class="px-3 py-2 bg-gray-50 dark:bg-app-black-90 border border-gray-300 dark:border-app-violet-900/30 rounded-md text-zinc-900 dark:text-white"
          >
            {{ formatDate(accountCreated) }}
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
/* Remove these styles as they might be causing inconsistency */
.w-full {
  height: auto;
  min-height: auto;
  overflow: visible;
}
</style>
