<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import StatDisplay from '@/components/common/StatDisplay.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import AuctionAnalysisTooltip from '@/components/auction/AuctionAnalysisTooltip.vue'
import { Chart, registerables } from 'chart.js'
import { Line } from 'vue-chartjs'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useStatsCreator } from '@/composables/useStatsCreator.ts'

// Register Chart.js components
Chart.register(...registerables)

const { avgBid, bids, bidLabels, highestBid, bidCount, recentMomentum, predictedSalePrice } =
  useStatsCreator()

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

const lobbyStore = useLobbyStore()

// Determine if there's a critical warning to show
const hasWarning = computed(() => {
  // Check if there's an inventory risk warning
  if (lobbyStore.lobby?.currentSale && !lobbyStore.userIsTheSeller) {
    return true
  }
  return false
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Replace the header with the new component -->
    <SectionHeader iconColor="violet" iconName="chart" title="Stats">
      <!-- Eye icon for analysis tooltip -->
      <div v-if="bidCount > 1 && !lobbyStore.userIsTheSeller" class="relative group">
        <button
          aria-label="View auction analysis"
          class="flex items-center justify-center p-1 rounded-full bg-violet-100 dark:bg-violet-800/40 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-700/60 transition-colors"
          type="button"
        >
          <!-- Use AppIcons for the eye icon with larger size -->
          <AppIcons color="violet" name="eye" size="sm" />

          <!-- Add a notification dot if there's a warning -->
          <span
            v-if="hasWarning"
            class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-neutral-800"
          ></span>
        </button>

        <!-- Keep the tooltip component -->
        <AuctionAnalysisTooltip />
      </div>
    </SectionHeader>

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
          title="Increase Rate"
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
