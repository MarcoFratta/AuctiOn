<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useStatsCreator } from '@/composables/useStatsCreator.ts'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import SaleInfoPreview from './SaleInfoPreview.vue'
import SaleInfoCompare from './SaleInfoCompare.vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import { useInventoryUtils } from '@/composables/useInventoryUtils.ts'

const props = defineProps<{
  items: {
    item: string
    quantity: number
  }[]
}>()

const lobbyStore = useLobbyStore()
const { avgDollarPerWeight } = useStatsCreator()
const settings = useSettingsStore()
const utils = useInventoryUtils()

const activeTab = ref('preview') // 'preview' or 'inventory'

// --- Computed Properties for Props ---

const isDark = computed(() => settings.darkMode)

// Check if any items are selected
const hasSelectedItems = computed(() => {
  return props.items.some((item) => item.quantity > 0)
})

// Calculate total weight of *selected* items
const totalWeightSelected = computed(() => utils.getTotalWeight(props.items))

// Calculate estimated sale price based on average dollar per weight
const estimatedPrice = computed(() => {
  return Math.round(totalWeightSelected.value * avgDollarPerWeight.value)
})

// Calculate current total inventory weight
const currentTotalInventoryWeight = computed(() =>
  utils.getTotalWeight(lobbyStore.playerInfo?.inventory.items || []),
)

// Calculate remaining inventory items after sale (for count/weight calculation)
const remainingInventoryItems = computed(() => {
  if (!lobbyStore.playerInfo?.inventory.items) return []

  const currentInventory = lobbyStore.playerInfo.inventory.items
  const selectedItemsMap = new Map(props.items.map((i) => [i.item, i.quantity]))

  return currentInventory
    .map((invItem) => {
      const soldQuantity = selectedItemsMap.get(invItem.item) || 0
      return {
        ...invItem,
        quantity: Math.max(0, invItem.quantity - soldQuantity),
      }
    })
    .filter((item) => item.quantity > 0) // Keep only items with remaining quantity
})

// Calculate total remaining weight
const remainingWeight = computed(() => utils.getTotalWeight(remainingInventoryItems.value))

// Calculate total remaining items count (sum of quantities)
const remainingItemsCount = computed(() => utils.getItemsCount(remainingInventoryItems.value))

// Calculate percentage of inventory being sold (by weight)
const inventoryPercentageSold = computed(() => {
  if (currentTotalInventoryWeight.value === 0) return 0
  return Math.round((totalWeightSelected.value / currentTotalInventoryWeight.value) * 100)
})

// Calculate total count of items currently in inventory
const totalInventoryItemsCount = computed(() =>
  utils.getItemsCount(lobbyStore.playerInfo?.inventory.items || []),
)
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header with tabs -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-1.5">
        <div class="bg-app-fuchsia-100 dark:bg-app-fuchsia-500/20 p-1 rounded-lg">
          <AppIcons color="fuchsia" name="preview" size="sm" />
        </div>
        <h2 class="text-sm md:text-base font-semibold text-zinc-900 dark:text-white">
          Sale Preview
        </h2>
      </div>

      <!-- Tabs -->
      <div class="flex text-xs bg-neutral-100 dark:bg-neutral-800 rounded-md p-0.5">
        <button
          :class="[
            'px-2 py-1 rounded transition-colors',
            activeTab === 'preview'
              ? 'bg-white dark:bg-neutral-700 text-app-fuchsia-600 dark:text-app-fuchsia-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300',
          ]"
          @click="activeTab = 'preview'"
        >
          Info
        </button>
        <button
          :class="[
            'px-2 py-1 rounded transition-colors',
            activeTab === 'inventory'
              ? 'bg-white dark:bg-neutral-700 text-app-fuchsia-600 dark:text-app-fuchsia-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300',
          ]"
          @click="activeTab = 'inventory'"
        >
          Compare
        </button>
      </div>
    </div>

    <!-- Content Container -->
    <InnerCard class="flex-grow flex flex-col justify-start overflow-y-auto scrollbar-hide">
      <!-- Dynamic Component based on activeTab -->
      <SaleInfoPreview
        v-if="activeTab === 'preview'"
        :current-total-weight="currentTotalInventoryWeight"
        :estimated-price="estimatedPrice"
        :has-selected-items="hasSelectedItems"
        :inventory-percentage-sold="inventoryPercentageSold"
        :is-dark="isDark"
        :remaining-weight="remainingWeight"
        :total-weight="totalWeightSelected"
      />
      <SaleInfoCompare
        v-else-if="activeTab === 'inventory'"
        :current-total-weight="currentTotalInventoryWeight"
        :has-selected-items="hasSelectedItems"
        :inventory-items="lobbyStore?.playerInfo?.inventory.items || []"
        :remaining-items-count="remainingItemsCount"
        :remaining-weight="remainingWeight"
        :selected-items="props.items"
        :total-items-count="totalInventoryItemsCount"
      />
    </InnerCard>
  </BaseCard>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
