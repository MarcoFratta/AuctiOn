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
import router from '@/router'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import Background from '@/components/Background.vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import GameShapes from '@/components/ui/GameShapes.vue'
import BaseCard from '@/components/BaseCard.vue'
import Title from '@/components/Title.vue'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'

const authStore = useAuthStore()
const lobbyService = useLobbyService()
const settingsStore = useSettingsStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const schema = toTypedSchema(lobbyConfigSchema)
const { values, defineField, validate } = useForm({
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

const canSubmit = computed(() => isAuthenticated.value)
const waitForResponse = ref(false)
const handleForm = async (event: Event) => {
  try {
    await validate()
    if (!canSubmit.value) throw new InvalidData()
    waitForResponse.value = true

    await lobbyService.createLobby({
      rounds: values.rounds!,
      maxPlayers: values.maxPlayers!,
      bidTime: values.bidTime!,
      startAmount: values.startAmount!,
      startInventory: { items: values.startInventory?.items! },
    })
    await useAuctionConnection().connect()
    await router.push('/lobby')
  } catch (e) {
    console.log('Error', e)
    const err = errorsHandler
      .create(e)
      .unknownError()
      .invalidData()
      .alreadyInLobby('You already joined a lobby', async () => {
        await router.push('/lobby')
      })
      .authenticationError('', () => router.push('/login?redirect=/create'))
      .tooManyRequests()
    await errorsHandler.showAndRun(err)
  } finally {
    waitForResponse.value = false
  }
}
</script>

<template>
  <Background>
    <div class="w-full max-w-3xl my-4">
      <!-- Header with animated shapes -->
      <div class="flex flex-col items-center mb-4 md:mb-6 lg:mb-8 px-2 relative">
        <div class="absolute top-5 -left-5 opacity-50 hidden md:block">
          <GameShapes
            :color="settingsStore.darkMode ? 'violet' : 'default'"
            animated
            size="md"
            type="circle"
          />
        </div>
        <div class="absolute top-5 -right-5 opacity-50 hidden md:block">
          <GameShapes
            :color="settingsStore.darkMode ? 'fuchsia' : 'default'"
            animated
            size="md"
            type="triangle"
          />
        </div>

        <Title class="text-4xl md:text-4xl mb-3"> Create New Lobby </Title>
        <p class="text-gray-600 dark:text-app-violet-200 text-center max-w-md">
          Configure your game settings and starting inventory for an exciting auction experience
        </p>
      </div>

      <!-- Form Container -->
      <BaseCard class="mb-2 md:mb-4 lg:mb-6">
        <form class="flex flex-grow flex-col gap-4 lg:gap-6">
          <!-- Game Settings Section -->
          <div class="flex flex-col justify-start gap-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="bg-blue-100 dark:bg-app-violet-500/20 p-2 rounded-lg">
                <svg
                  class="h-5 w-5 text-blue-500 dark:text-app-violet-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clip-rule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    fill-rule="evenodd"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-zinc-900 dark:text-white">Game Settings</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 g:gap-6">
              <FormEntry
                class="w-full"
                v-model="rounds"
                :max="lobbyConfigSchema.shape.rounds.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.rounds.minValue ?? 0"
                :step="1"
                placeHolder="Number of rounds"
                type="number"
                title="Rounds"
                v-bind="roundsProps"
              />

              <FormEntry
                class="w-full"
                v-model="maxPlayers"
                :max="lobbyConfigSchema.shape.maxPlayers.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.maxPlayers.minValue ?? 0"
                :step="1"
                placeHolder="Maximum number of players"
                type="number"
                title="Max players"
                v-bind="maxPlayersProps"
              />

              <FormEntry
                class="w-full"
                v-model="bidTime"
                :max="lobbyConfigSchema.shape.bidTime.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.bidTime.minValue ?? 0"
                :step="2"
                placeHolder="Time to bid in seconds"
                type="number"
                title="Bid time (seconds)"
                v-bind="bidTimeProps"
              />
              <FormEntry
                class="w-full"
                v-model="startAmount"
                :max="lobbyConfigSchema.shape.startAmount.maxValue ?? undefined"
                :min="lobbyConfigSchema.shape.startAmount.minValue ?? 0"
                :step="100"
                placeHolder="Starting amount of money"
                type="number"
                title="Starting amount"
                v-bind="startAmountProps"
              />
            </div>
          </div>

          <!-- Inventory Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-4">
              <div class="bg-purple-100 dark:bg-app-fuchsia-500/20 p-2 rounded-lg">
                <svg
                  class="h-5 w-5 text-purple-500 dark:text-app-fuchsia-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-zinc-900 dark:text-white">
                Starting Inventory
              </h2>
            </div>

            <div>
              <InventorySelector
                :details="
                  new Map([
                    [
                      'square',
                      {
                        min: 0,
                        max:
                          lobbyConfigSchema.shape.startInventory.shape.items.element.shape.quantity
                            .maxValue ?? 100,
                      },
                    ],
                    [
                      'triangle',
                      {
                        min: 0,
                        max:
                          lobbyConfigSchema.shape.startInventory.shape.items.element.shape.quantity
                            .maxValue ?? 100,
                      },
                    ],
                    [
                      'circle',
                      {
                        min: 0,
                        max:
                          lobbyConfigSchema.shape.startInventory.shape.items.element.shape.quantity
                            .maxValue ?? 100,
                      },
                    ],
                  ])
                "
                :items="items!"
                v-bind="itemsProps"
              >
                <template #header>
                  <div class="flex items-center gap-2 mb-4">
                    <p class="text-gray-600 dark:text-gray-300 text-sm">
                      Set the initial quantity for each item type
                    </p>
                  </div>
                </template>
              </InventorySelector>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-2">
            <LoadingButton
              :disable="!canSubmit"
              :loading="waitForResponse"
              class="w-full"
              @click="handleForm"
              >Create Lobby
            </LoadingButton>

            <p
              v-if="!canSubmit && !isAuthenticated"
              class="mt-3 text-center text-sm text-red-500 dark:text-red-400"
            >
              You need to be logged in to create a lobby
            </p>
          </div>
        </form>
      </BaseCard>
    </div>
  </Background>
</template>
