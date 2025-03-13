<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import InventorySelector from '@/components/InventorySelector.vue'
import { computed, ref } from 'vue'
import { lobbyConfigSchema } from '@/schemas/LobbySchema.ts'
import LoadingButton from '@/components/LoadingButton.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { InvalidData } from '@/api/Errors.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import router from '@/router'
import { useLobbyService } from '@/composables/useLobbyService.ts'

const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const lobbyService = useLobbyService()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const schema = toTypedSchema(lobbyConfigSchema)
const { values, errors, defineField, validate } = useForm({
  validationSchema: schema,
})

const [rounds, roundsProps] = defineField('rounds', {
  props: (state) => ({
    error: state.errors[0],
  }),
})
const [maxPlayers, maxPlayersProps] = defineField('maxPlayers', {
  props: (state) => ({
    error: state.errors[0],
  }),
})
const [bidTime, bidTimeProps] = defineField('bidTime', {
  props: (state) => ({
    error: state.errors[0],
  }),
})
const [startAmount, startAmountProps] = defineField('startAmount', {
  props: (state) => ({
    error: state.errors[0],
  }),
})
const [items, itemsProps] = defineField('startInventory.items', {
  props: (state) => ({
    error: state.errors[0],
  }),
})
const errorsHandler = useErrorsHandler()
rounds.value = 5
maxPlayers.value = 5
bidTime.value = 20
startAmount.value = 500
items.value = [
  { item: 'square', quantity: 5 },
  { item: 'triangle', quantity: 3 },
  { item: 'circle', quantity: 2 },
]

const canSubmit = computed(() => isAuthenticated)
const waitForResponse = ref(false)
const handleForm = async (event: Event) => {
  try {
    await validate()
    if (!canSubmit.value) throw new InvalidData()
    waitForResponse.value = true

    const res = await lobbyService.createLobby({
      rounds: values.rounds!,
      maxPlayers: values.maxPlayers!,
      bidTime: values.bidTime!,
      startAmount: values.startAmount!,
      startInventory: { items: values.startInventory?.items! },
    })
    router.push('/lobby')
  } catch (e) {
    console.log('Error', e)
    const err = errorsHandler
      .create(e)
      .unknownError()
      .invalidData()
      .alreadyInLobby('You already joined a lobby', () => router.push('/lobby'))
      .authenticationError('', () => router.push('/login?redirect=/create'))
      .tooManyRequests()
    console.error('showing error')
    await errorsHandler.show(err.get())
    console.error('error shown')
    err.run()
  } finally {
    waitForResponse.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] py-8">
    <div class="max-w-2xl mx-auto bg-gray-800 p-6 lg:p-8 rounded-lg shadow-lg">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">🎮 Create Lobby</h2>
        <p class="text-gray-300 mt-2">Configure your game settings and starting inventory.</p>
      </div>

      <!-- Form -->
      <form class="space-y-6">
        <!-- Game Settings -->
        <div class="bg-gray-700 p-4 rounded-lg space-y-4">
          <h3 class="text-lg font-semibold text-white mb-4">Game Settings</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-200">Rounds</label>
              <FormEntry
                v-model="rounds"
                :max="lobbyConfigSchema.shape.rounds.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.rounds.minValue ?? 0"
                :step="1"
                placeHolder="Number of rounds"
                type="number"
                v-bind="roundsProps"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-200">Max Players</label>
              <FormEntry
                v-model="maxPlayers"
                :max="lobbyConfigSchema.shape.maxPlayers.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.maxPlayers.minValue ?? 0"
                :step="1"
                placeHolder="Maximum number of players"
                type="number"
                v-bind="maxPlayersProps"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-200">Bid Time</label>
              <FormEntry
                v-model="bidTime"
                :max="lobbyConfigSchema.shape.bidTime.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.bidTime.minValue ?? 0"
                :step="2"
                placeHolder="Time to bid in seconds"
                type="number"
                v-bind="bidTimeProps"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-200">Starting Amount</label>
              <FormEntry
                v-model="startAmount"
                :max="lobbyConfigSchema.shape.startAmount.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.startAmount.minValue ?? 0"
                :step="100"
                placeHolder="Starting amount of money"
                type="number"
                v-bind="startAmountProps"
              />
            </div>
          </div>
        </div>

        <!-- Starting Inventory -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-white mb-4">Starting Inventory</h3>
          <InventorySelector
            :items="items!"
            :max="
              lobbyConfigSchema.shape.startInventory.shape.items.element.shape.quantity.maxValue
            "
            :min="
              lobbyConfigSchema.shape.startInventory.shape.items.element.shape.quantity.minValue ??
              0
            "
            v-bind="itemsProps"
          >
            <template #header>
              <p class="text-gray-300 mb-4">Set the initial quantity for each item type.</p>
            </template>
          </InventorySelector>
        </div>

        <!-- Submit Button -->
        <LoadingButton
          :class="
            canSubmit ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
          "
          :disable="!canSubmit"
          :loading="waitForResponse"
          class="w-full py-3 px-4 rounded-md font-semibold text-lg transition-all"
          text="Create Lobby"
          @click="handleForm"
        />
      </form>
    </div>
  </div>
</template>
