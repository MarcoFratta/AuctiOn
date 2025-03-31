<template>
  <Background>
    <div class="w-full max-w-4xl mx-auto px-4 py-6 min-h-[80vh] flex items-center justify-center">
      <div class="w-full">
        <!-- Header with animated shapes -->
        <div class="flex flex-col items-center mb-8 relative">
          <div class="absolute top-0 -left-10 opacity-50 hidden md:block">
            <GameShapes
              :color="settingsStore.darkMode ? 'violet' : 'default'"
              animated
              size="md"
              type="circle"
            />
          </div>
          <div class="absolute top-0 -right-10 opacity-50 hidden md:block">
            <GameShapes
              :color="settingsStore.darkMode ? 'fuchsia' : 'default'"
              animated
              size="md"
              type="triangle"
            />
          </div>

          <Title class="text-4xl lg:text-5xl mb-2">
            <span class="text-gray-500 dark:text-gray-400">4</span>
            <span class="text-app-violet-500 dark:text-app-violet-400">0</span>
            <span class="text-gray-500 dark:text-gray-400">4</span>
          </Title>
          <p class="text-gray-600 dark:text-app-violet-200 text-center text-lg">Page not found</p>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Left Column: Error Message -->
          <div class="md:col-span-2">
            <BaseCard>
              <div class="flex flex-col md:flex-row items-center gap-6 p-2">
                <div class="bg-gray-100 dark:bg-gray-800 p-5 rounded-full">
                  <span class="text-5xl">🔍</span>
                </div>
                <div class="text-center md:text-left">
                  <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                    We've lost this page
                  </h2>
                  <p class="text-gray-700 dark:text-app-white">
                    The page you're looking for doesn't exist or has been moved to another location.
                  </p>
                </div>
              </div>
            </BaseCard>

            <!-- Suggestions -->
            <BaseCard class="mt-4">
              <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                You might want to:
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <InnerCard class="feature-card group">
                  <div
                    class="absolute top-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12"
                  >
                    <GameShapes color="violet" size="sm" type="square" />
                  </div>
                  <h3
                    class="text-violet-600 dark:text-app-fuchsia-400 text-lg font-bold mb-2 group-hover:translate-x-1 transition-transform"
                  >
                    Check the URL
                  </h3>
                  <p
                    class="text-gray-600 dark:text-app-violet-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors"
                  >
                    Make sure the web address is spelled correctly without any typos.
                  </p>
                </InnerCard>

                <InnerCard class="feature-card group">
                  <div
                    class="absolute top-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12"
                  >
                    <GameShapes color="fuchsia" size="sm" type="triangle" />
                  </div>
                  <h3
                    class="text-violet-600 dark:text-app-fuchsia-400 text-lg font-bold mb-2 group-hover:translate-x-1 transition-transform"
                  >
                    Go Back
                  </h3>
                  <p
                    class="text-gray-600 dark:text-app-violet-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors"
                  >
                    Return to the previous page you were viewing.
                  </p>
                </InnerCard>
              </div>
            </BaseCard>
          </div>

          <!-- Right Column: Action -->
          <div class="md:col-span-1">
            <BaseCard class="h-full flex flex-col justify-between">
              <div>
                <h3 class="text-lg font-semibold text-zinc-900 dark:text-white text-center mb-4">
                  Ready to start over?
                </h3>
                <p class="text-gray-600 dark:text-app-violet-200 text-center mb-6">
                  Head back to our homepage and join exciting auctions, trade items, and compete
                  with other players.
                </p>
              </div>

              <div class="flex justify-center">
                <router-link class="w-full" to="/">
                  <Button
                    :bgColor="settingsStore.darkMode ? 'black' : '#f8f9fa'"
                    :colors="
                      settingsStore.darkMode
                        ? ['#ff00ff', '#9900ff', '#6600ff']
                        : ['#6366f1', '#8b5cf6', '#d946ef']
                    "
                    :duration="3500"
                    class="text-zinc-900 dark:text-app-white w-full"
                    size="lg"
                  >
                    <b>Return to Home 🏠</b>
                  </Button>
                </router-link>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import Background from '@/components/Background.vue'
import Title from '@/components/Title.vue'
import BaseCard from '@/components/BaseCard.vue'
import InnerCard from '@/components/InnerCard.vue'
import GameShapes from '@/components/ui/GameShapes.vue'
import { GradientButton as Button } from '@/components/ui/gradient-button'
import { useSettingsStore } from '@/stores/settingsStore.ts'

const settingsStore = useSettingsStore()
</script>

<style scoped>
/* Feature card styling */
.feature-card {
  @apply relative p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300;
  @apply border border-violet-100 dark:border-violet-900/50;
  @apply overflow-hidden;
}

/* Smooth transitions */
.transform {
  transition: all 0.2s ease;
}

a {
  transition: all 0.2s ease;
}

a:hover {
  transform: translateY(-1px);
}

a:active {
  transform: translateY(0);
}
</style>
