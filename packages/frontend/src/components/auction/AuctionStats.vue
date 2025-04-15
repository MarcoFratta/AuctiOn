<script lang="ts" setup>
import { useStatsCreator } from '@/composables/useStatsCreator.ts'
import { computed, onMounted, ref } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import StatDisplay from '@/components/common/StatDisplay.vue'
import { Chart, registerables } from 'chart.js'
import { Line } from 'vue-chartjs'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

// Register Chart.js components
Chart.register(...registerables)

const {
  avgBid,
  bids,
  bidLabels,
  highestBid,
  bidCount,
  recentMomentum,
  predictedSalePrice,
  priceVsPrediction,
} = useStatsCreator()

// Chart data
const chartData = computed(() => ({
  labels: bidLabels.value,
  datasets: [
    {
      label: 'Bid Amount',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#8b5cf6',
      data: bids.value,
      tension: 0.4,
      fill: true,
    },
  ],
}))

// Chart options with better handling for small containers
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(160, 174, 192, 0.1)',
      },
      ticks: {
        color: '#718096',
        maxTicksLimit: 5, // Limit the number of ticks on small screens
        autoSkip: true,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#718096',
        maxTicksLimit: 5, // Limit the number of ticks on small screens
        autoSkip: true,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(26, 32, 44, 0.8)',
      titleColor: '#e2e8f0',
      bodyColor: '#e2e8f0',
      borderColor: '#8b5cf6',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
    },
  },
  // Add a minimum height to prevent extreme squishing
  layout: {
    padding: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    },
  },
}

// For dark mode detection
const isDarkMode = ref(false)

onMounted(() => {
  // Check if dark mode is enabled
  isDarkMode.value = document.documentElement.classList.contains('dark')

  // Listen for dark mode changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        isDarkMode.value = document.documentElement.classList.contains('dark')

        // Update chart colors for dark mode
        if (isDarkMode.value) {
          chartOptions.scales.y.ticks.color = '#a0aec0'
          chartOptions.scales.x.ticks.color = '#a0aec0'
        } else {
          chartOptions.scales.y.ticks.color = '#718096'
          chartOptions.scales.x.ticks.color = '#718096'
        }
      }
    })
  })

  observer.observe(document.documentElement, { attributes: true })
})

// Add a computed property for momentum icon
const momentumIcon = computed(() => {
  if (recentMomentum.value > 0) return 'up'
  if (recentMomentum.value < 0) return 'down'
  return 'neutral'
})
const lobbyStore = useLobbyStore()

// Add a computed property for prediction icon
const predictionIcon = computed(() => {
  if (priceVsPrediction.value > 0) return 'up'
  if (priceVsPrediction.value < 0) return 'down'
  return 'neutral'
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header with trend indicator icon -->
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center gap-1.5">
        <div class="bg-indigo-100 dark:bg-indigo-500/20 p-0.5 rounded-lg">
          <AppIcons color="indigo" name="chart" size="sm" />
        </div>
        <h2 class="text-base font-semibold text-zinc-900 dark:text-white">Stats</h2>
      </div>

      <!-- Trend indicator with tooltip -->
      <div v-if="bidCount > 1" class="relative group">
        <div
          :class="[
            recentMomentum > 0
              ? 'text-green-600 dark:text-green-400'
              : recentMomentum < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400',
            'p-1.5 rounded-full cursor-help',
          ]"
        >
          <svg
            v-if="momentumIcon === 'up'"
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              fill-rule="evenodd"
            ></path>
          </svg>
          <svg
            v-else-if="momentumIcon === 'down'"
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
              fill-rule="evenodd"
            ></path>
          </svg>
          <svg
            v-else
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
              fill-rule="evenodd"
            ></path>
          </svg>
        </div>

        <!-- Tooltip popup -->
        <div
          class="absolute right-0 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 w-64 p-3 mt-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-100 dark:border-neutral-700/50"
        >
          <div class="flex items-start mb-2">
            <div
              class="bg-app-violet-100 dark:bg-app-violet-500/20 p-1 rounded-md mr-2 flex-shrink-0"
            >
              <svg
                class="w-3 h-3 text-app-violet-600 dark:text-app-violet-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xs font-medium text-app-violet-700 dark:text-app-violet-300 mb-1">
                Auction Analysis
              </h3>
              <div class="flex items-center mb-2">
                <span
                  :class="[
                    recentMomentum > 0
                      ? 'text-green-600 dark:text-green-400'
                      : recentMomentum < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400',
                    'text-sm font-bold',
                  ]"
                >
                  {{ recentMomentum > 0 ? '+' : '' }}{{ recentMomentum }}% momentum
                </span>
              </div>
              <p class="text-xs text-app-violet-600 dark:text-app-violet-400">
                <template v-if="priceVsPrediction > 10">
                  Current bid is significantly above predicted value. This item is in high demand!
                </template>
                <template v-else-if="priceVsPrediction > 0">
                  Current bid is above predicted value. This is a competitive auction.
                </template>
                <template v-else-if="priceVsPrediction < -10">
                  Current bid is well below predicted value. This could be a good opportunity to
                  bid.
                </template>
                <template v-else-if="priceVsPrediction < 0">
                  Current bid is slightly below predicted value. Consider placing a bid.
                </template>
                <template v-else>
                  Current bid matches the predicted value based on historical sales.
                </template>
              </p>
            </div>
          </div>
          <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span
              v-if="priceVsPrediction !== 0"
              :class="[
                priceVsPrediction > 0
                  ? 'text-green-600 dark:text-green-400'
                  : priceVsPrediction < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400',
                'ml-2 flex items-center',
              ]"
            >
              {{ priceVsPrediction > 0 ? '+' : '' }}{{ priceVsPrediction }}%
              <svg
                v-if="predictionIcon === 'up'"
                class="w-3 h-3 ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  fill-rule="evenodd"
                ></path>
              </svg>
              <svg
                v-else-if="predictionIcon === 'down'"
                class="w-3 h-3 ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <InnerCard class="scrollbar-hide p-2 md:p-3 flex-grow flex flex-col overflow-y-auto">
      <!-- Stats Grid - Redesigned for desktop -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <StatDisplay :value="avgBid" prefix="$" title="Average Bid" />

        <StatDisplay
          :value="highestBid"
          prefix="$"
          title="Highest Bid"
          valueColor="text-green-600 dark:text-green-400"
        />

        <StatDisplay
          :referenceValue="0"
          :showPercentage="false"
          :trendValue="recentMomentum"
          :value="recentMomentum"
          prefix="%"
          title="Recent Momentum"
        />

        <StatDisplay
          :referenceValue="lobbyStore.lobby?.currentBid?.amount ?? undefined"
          :showPercentage="true"
          :value="predictedSalePrice"
          prefix="$"
          title="Predicted Price"
        />
      </div>

      <!-- Chart - Now takes full height of remaining space with min-height -->
      <div
        class="bg-white dark:bg-neutral-800 flex-grow flex justify-center items-center flex-col rounded-lg border border-gray-100 dark:border-neutral-700/50 overflow-hidden"
      >
        <div v-if="bidCount > 1" class="h-full w-full">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="flex flex-col items-center justify-center h-full min-h-[100px]">
          <div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-full mb-2">
            <AppIcons color="gray" name="chart" size="md" />
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-xs text-center">
            Not enough bid data to display chart
          </p>
        </div>
      </div>
    </InnerCard>
  </BaseCard>
</template>
