<template>
  <div :class="{ compact }" class="inventory-display">
    <div v-if="inventory && inventory.items.length > 0" class="items">
      <div v-for="item in inventory.items" :key="item.item" class="item">
        <div class="item-name">{{ formatItemName(item.item) }}</div>
        <div class="item-quantity">{{ item.quantity }}</div>
      </div>
    </div>
    <div v-else class="empty-inventory">No items</div>
  </div>
</template>

<script lang="ts" setup>
// Import the correct type from the store instead of @auction/common
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'

// Define a local interface for Inventory
interface Inventory {
  items: ItemQuantity[]
}

const props = defineProps<{
  inventory: Inventory
  compact?: boolean
}>()

function formatItemName(name: string): string {
  // Convert camelCase or snake_case to Title Case with spaces
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}
</script>

<style scoped>
.inventory-display {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #374151; /* bg-gray-700 */
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-name {
  font-weight: 500;
  color: #f3f4f6; /* text-gray-100 */
}

.item-quantity {
  background-color: #1f2937; /* bg-gray-800 */
  border-radius: 9999px;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #60a5fa; /* text-blue-400 */
}

.empty-inventory {
  color: #9ca3af; /* text-gray-400 */
  font-style: italic;
  text-align: center;
  padding: 1.5rem;
  background-color: #374151; /* bg-gray-700 */
  border-radius: 0.5rem;
}

.compact .items {
  gap: 0.5rem;
}

.compact .item {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.compact .item-quantity {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .items {
    gap: 0.5rem;
  }

  .item {
    padding: 0.5rem 0.75rem;
  }
}
</style>
