<template>
  <div class="min-h-[80vh] w-full">
    <div class="w-full max-w-4xl mx-auto bg-gray-800 p-4 lg:p-8 rounded-lg shadow-lg">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-2">👤 Account Settings</h2>
        <p class="text-gray-400">Manage your profile and view your game statistics</p>
      </div>

      <!-- Settings Grid -->
      <div class="grid gap-6 mb-8">
        <!-- Personal Information Card -->
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center">
              <span class="mr-2">📝</span> Personal Information
            </h3>
            <div class="badge bg-blue-500/10 border border-blue-400/30">
              <span class="text-blue-400 text-xs font-medium">Profile Details</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-750 p-4 rounded-lg">
              <label class="block text-gray-400 text-sm mb-1">Username</label>
              <p class="text-white text-lg font-medium">{{ userStore.user?.username || 'N/A' }}</p>
            </div>
            <div class="bg-gray-750 p-4 rounded-lg">
              <label class="block text-gray-400 text-sm mb-1">Email</label>
              <p class="text-white text-lg font-medium">{{ userStore.user?.email || 'N/A' }}</p>
            </div>
            <div class="bg-gray-750 p-4 rounded-lg">
              <label class="block text-gray-400 text-sm mb-1">Account Created</label>
              <p class="text-white text-lg font-medium">{{ formatDate(accountCreated) }}</p>
            </div>
          </div>
        </div>

        <!-- Preferences Card -->
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center">
              <span class="mr-2">⚙️</span> Preferences
            </h3>
            <div class="badge bg-purple-500/10 border border-purple-400/30">
              <span class="text-purple-400 text-xs font-medium">App Settings</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Theme Toggle -->
            <div class="bg-gray-750 p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-gray-400 text-sm mb-1">Theme</label>
                  <p class="text-white text-base">
                    {{ settingsStore.darkMode ? 'Dark Mode' : 'Light Mode' }}
                  </p>
                </div>
                <div class="relative inline-block w-12 align-middle select-none">
                  <input
                    id="theme-toggle"
                    :checked="settingsStore.darkMode"
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                    type="checkbox"
                    @change="toggleTheme"
                  />
                  <label
                    class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"
                    for="theme-toggle"
                  ></label>
                </div>
              </div>
              <p class="text-gray-400 text-xs mt-2">
                {{ settingsStore.darkMode ? 'Switch to light mode' : 'Switch to dark mode' }}
              </p>
            </div>

            <!-- Notifications Toggle -->
            <div class="bg-gray-750 p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-gray-400 text-sm mb-1">Notifications</label>
                  <p class="text-white text-base">
                    {{ settingsStore.notifications ? 'Enabled' : 'Disabled' }}
                  </p>
                </div>
                <div class="relative inline-block w-12 align-middle select-none">
                  <input
                    id="notification-toggle"
                    :checked="notificationsEnabled"
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                    type="checkbox"
                    @change="toggleNotifications"
                  />
                  <label
                    class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"
                    for="notification-toggle"
                  ></label>
                </div>
              </div>
              <p class="text-gray-400 text-xs mt-2">
                {{
                  settingsStore.notifications
                    ? 'Disable game notifications'
                    : 'Enable game notifications'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Game Statistics Card -->
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center">
              <span class="mr-2">🏆</span> Game Statistics
            </h3>
            <div class="badge bg-green-500/10 border border-green-400/30">
              <span class="text-green-400 text-xs font-medium">Performance Metrics</span>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Wins Stat -->
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-green-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">🏅</span>
              </div>
              <div class="text-green-400 text-3xl font-bold mb-1">{{ stats.wins }}</div>
              <div class="text-gray-400 text-sm">Wins</div>
            </div>

            <!-- Losses Stat -->
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-red-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">❌</span>
              </div>
              <div class="text-red-400 text-3xl font-bold mb-1">{{ stats.losses }}</div>
              <div class="text-gray-400 text-sm">Losses</div>
            </div>

            <!-- Win Rate Stat -->
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-blue-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">📊</span>
              </div>
              <div class="text-blue-400 text-3xl font-bold mb-1">{{ winRate }}%</div>
              <div class="text-gray-400 text-sm">Win Rate</div>
            </div>

            <!-- Games Played Stat -->
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-purple-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">🎮</span>
              </div>
              <div class="text-purple-400 text-3xl font-bold mb-1">{{ stats.gamesPlayed }}</div>
              <div class="text-gray-400 text-sm">Games Played</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Card (Placeholder for future expansion) -->
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center">
              <span class="mr-2">📅</span> Recent Activity
            </h3>
            <div class="badge bg-yellow-500/10 border border-yellow-400/30">
              <span class="text-yellow-400 text-xs font-medium">Coming Soon</span>
            </div>
          </div>

          <div class="bg-gray-750 p-6 rounded-lg text-center">
            <div class="text-gray-400 mb-2">
              <svg
                class="w-12 h-12 mx-auto mb-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></path>
              </svg>
              <p class="text-lg">Recent game history will appear here</p>
              <p class="text-sm mt-2">Check back soon for updates!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/userStore'
import { computed, ref } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'

// Get user data from the store
const userStore = useUserStore()

// Account creation date (placeholder until you add this to your user model)
const accountCreated = ref(new Date('2023-01-15'))

// Game statistics (placeholder until you add this to your user model)
// In a real implementation, these would come from the user store or an API call
const stats = ref({
  wins: 15,
  losses: 5,
  gamesPlayed: 20,
})

// Calculate win rate
const winRate = computed(() => {
  const { wins, gamesPlayed } = stats.value
  if (!gamesPlayed) return 0
  return Math.round((wins / gamesPlayed) * 100)
})

// Format date for display
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const settingsStore = useSettingsStore()
const toggleTheme = () => {
  settingsStore.darkMode = !settingsStore.darkMode
}

// Notification settings
const notificationsEnabled = ref(true) // Default to enabled
const toggleNotifications = () => {
  settingsStore.notifications = !settingsStore.notifications
}
</script>

<style scoped>
/* Custom background color for darker cards */
.bg-gray-750 {
  background-color: rgba(31, 41, 55, 0.8);
}

/* Smooth transitions */
.transform {
  transition: all 0.2s ease;
}

/* Subtle hover effects */
.bg-gray-750:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Toggle Switch Styling */
.toggle-checkbox:checked {
  transform: translateX(100%);
  border-color: #4f46e5;
}

.toggle-checkbox:checked + .toggle-label {
  background-color: #4f46e5;
}

.toggle-label {
  transition: background-color 0.2s ease;
}

/* Badge styling with improved mobile text centering */
.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  text-align: center;
  min-width: 80px; /* Ensures minimum width for better text layout */
  line-height: 1.2; /* Improves multi-line text spacing */
}

/* Responsive adjustments for badges */
@media (max-width: 640px) {
  .badge {
    padding: 0.25rem 0.5rem;
    min-width: 70px;
  }

  .badge span {
    white-space: normal; /* Allow text to wrap naturally */
    display: inline-block; /* Better control over text block */
  }

  /* Adjust header layout on very small screens */
  .flex.items-center.justify-between {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Make headers full width on very small screens if needed */
  @media (max-width: 380px) {
    .flex.items-center.justify-between {
      flex-direction: column;
      align-items: flex-start;
    }

    .badge {
      align-self: flex-start;
      margin-top: 0.25rem;
    }
  }
}
</style>
