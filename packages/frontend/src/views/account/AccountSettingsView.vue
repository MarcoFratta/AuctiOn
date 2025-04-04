<template>
  <Background
    container-class="flex max-w-screen align-top
     flex-col items-center justify-start scrollbar-hide overflow-hidden"
  >
    <!-- Main container -->

    <!-- Tab navigation -->
    <div
      ref="tabsContainer"
      class="flex flex-row justify-start center-items text-center max-w-full bg-app-white dark:bg-app-black scrollbar-hide border-b border-gray-200 overflow-x-auto px-4 py-2 dark:border-app-violet-900/30"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :ref="
          (el) => {
            if (el) tabRefs[index] = el
          }
        "
        :class="[
          'px-4 py-2 mx-1 font-medium text-sm rounded-lg transition-all',
          activeTab === index
            ? 'text-violet-600 dark:text-app-fuchsia-500 border-b-2 border-violet-600 dark:border-app-fuchsia-500 bg-white dark:bg-app-black-90'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-app-black-80',
        ]"
        @click="selectTab(index)"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Content area -->
    <div
      class="w-full min-h-max pt-2 mb-4 lg:md-6 md:pt-4 lg:pt-16 sm:px-6 max-w-4xl mx-auto scrollbar-hide overflow-y-auto"
    >
      <!-- Tab content sections -->
      <div v-show="activeTab === 0">
        <ProfileSection :account-created="accountCreated" />
      </div>

      <div v-show="activeTab === 1">
        <AppearanceSection />
      </div>

      <div v-show="activeTab === 2">
        <NotificationsSection />
      </div>

      <div v-show="activeTab === 3">
        <StatisticsSection :stats="stats" />
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import Background from '@/components/common/Background.vue'
import ProfileSection from '@/components/settings/ProfileSection.vue'
import AppearanceSection from '@/components/settings/AppearanceSection.vue'
import NotificationsSection from '@/components/settings/NotificationsSection.vue'
import StatisticsSection from '@/components/settings/StatisticsSection.vue'
import { ref } from 'vue'

const tabs = ['Profile', 'Appearance', 'Notifications', 'Statistics']
const activeTab = ref(0)
const tabsContainer = ref(null as any)
const tabRefs = ref([] as any[])

// Function to select a tab and scroll to it
const selectTab = (index: number) => {
  activeTab.value = index

  // Scroll the tab into view with smooth animation
  setTimeout(() => {
    if (tabRefs.value[index] && tabsContainer.value) {
      const button = tabRefs.value[index]
      const container = tabsContainer.value

      // Calculate the scroll position to center the button
      const buttonLeft = button.offsetLeft
      const buttonWidth = button.offsetWidth
      const containerWidth = container.offsetWidth

      // Center the button in the container
      const scrollPosition = buttonLeft - containerWidth / 2 + buttonWidth / 2

      // Smooth scroll to the position
      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      })
    }
  }, 10)
}

// Account creation date (placeholder until you add this to your user model)
const accountCreated = ref(new Date('2023-01-15'))
// Game statistics (placeholder until you add this to your user model)
const stats = ref({
  wins: 15,
  losses: 5,
  gamesPlayed: 20,
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
