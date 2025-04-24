<script lang="ts" setup>
import FormEntry from '@/components/common/FormEntry.vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import InventorySelector from '@/components/common/InventorySelector.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { lobbyConfigSchema } from '@/schemas/LobbySchema.ts'
import LoadingButton from '@/components/common/LoadingButton.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { InvalidData } from '@/api/Errors.ts'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import Background from '@/components/common/Background.vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import GameShapes from '@/components/icons/GameShapes.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import Title from '@/components/common/Title.vue'
import AppIcons from '@/components/icons/AppIcons.vue'

const authStore = useAuthStore()
const router = useRouter()
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

const canSubmit = computed(
  () =>
    isAuthenticated.value &&
    !roundsProps.value.error &&
    !maxPlayersProps.value.error &&
    !bidTimeProps.value.error &&
    !startAmountProps.value.error &&
    !itemsProps.value.error,
)
const waitForResponse = ref(false)
const handleForm = async () => {
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
    await new Promise((resolve) => setTimeout(resolve, 200))
    await router.replace('/lobby')
  } catch (e) {
    const err = errorsHandler
      .create(e)
      .unknownError()
      .invalidData()
      .alreadyInLobby('You already joined a lobby', async () => {
        await router.replace('/lobby')
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
  <Background container-class="gap-2 lg:gap-4 xl:gap-6 h-fit px-2 py-4 sm:pb-6 sm:my-0">
    <!-- Header with animated shapes -->
    <div class="flex w-full flex-col items-center mb-4 px-2 relative">
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

      <Title class="text-3xl md:text-4xl mb-2"> Create New Lobby </Title>
      <p class="text-gray-600 dark:text-app-violet-200 text-center max-w-md text-sm md:text-base">
        Configure your game settings and starting inventory for an exciting auction experience
      </p>
    </div>

    <!-- Main content container -->
    <BaseCard class="flex flex-col gap-4 max-w-5xl">
      <form class="flex flex-col">
        <!-- Main content area - flex row on desktop, column on mobile -->
        <div class="flex flex-col lg:flex-row gap-6 lg:min-h-[150px] lg:max-h-[50vh]">
          <!-- Game Settings Section -->
          <div class="flex flex-grow flex-col lg:w-1/2">
            <div class="flex items-center gap-2 mb-4">
              <div class="bg-blue-100 dark:bg-app-violet-500/20 p-2 rounded-lg">
                <AppIcons color="violet" name="settings" />
              </div>
              <Title class="text-xl">Game Settings</Title>
            </div>

            <div
              class="bg-gray-50 dark:bg-neutral-900 p-2 lg:p-4 rounded-lg flex-grow flex flex-col"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4 flex-grow">
                <FormEntry
                  v-model="rounds"
                  :max="lobbyConfigSchema.shape.rounds.maxValue ?? undefined"
                  :min="lobbyConfigSchema.shape.rounds.minValue ?? 0"
                  :step="1"
                  class="w-full"
                  placeHolder="Number of rounds"
                  title="Rounds"
                  type="number"
                  v-bind="roundsProps"
                />

                <FormEntry
                  v-model="maxPlayers"
                  :max="lobbyConfigSchema.shape.maxPlayers.maxValue ?? undefined"
                  :min="lobbyConfigSchema.shape.maxPlayers.minValue ?? 0"
                  :step="1"
                  class="w-full"
                  placeHolder="Maximum number of players"
                  title="Max players"
                  type="number"
                  v-bind="maxPlayersProps"
                />

                <FormEntry
                  v-model="bidTime"
                  :max="lobbyConfigSchema.shape.bidTime.maxValue ?? undefined"
                  :min="lobbyConfigSchema.shape.bidTime.minValue ?? 0"
                  :step="2"
                  class="w-full"
                  placeHolder="Time to bid in seconds"
                  title="Bid time (seconds)"
                  type="number"
                  v-bind="bidTimeProps"
                />
                <FormEntry
                  v-model="startAmount"
                  :max="lobbyConfigSchema.shape.startAmount.maxValue ?? undefined"
                  :min="lobbyConfigSchema.shape.startAmount.minValue ?? 0"
                  :step="100"
                  class="w-full"
                  placeHolder="Starting amount of money"
                  title="Starting amount"
                  type="number"
                  v-bind="startAmountProps"
                />
              </div>
            </div>
          </div>

          <!-- Inventory Section -->
          <div class="flex flex-col lg:w-1/2">
            <div class="flex items-center gap-2 mb-4">
              <div class="bg-purple-100 dark:bg-app-fuchsia-500/20 p-2 rounded-lg">
                <AppIcons color="fuchsia" name="inventory" />
              </div>
              <h2 class="text-xl font-semibold text-zinc-900 dark:text-white">
                Starting Inventory
              </h2>
            </div>

            <div
              class="bg-gray-50 dark:bg-neutral-900 p-2 lg:p-4 rounded-lg flex-grow flex flex-col overflow-hidden"
            >
              <!-- Responsive height for inventory -->
              <InventorySelector
                class="w-full h-full"
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
                @update:items="items = $event"
                v-bind="itemsProps"
                compact
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
        </div>
      </form>
    </BaseCard>

    <!-- Create Lobby Button - Always at the bottom -->
    <div class="flex items-center justify-center w-full p-2">
      <LoadingButton
        :disable="!canSubmit"
        :loading="waitForResponse"
        class="w-full max-w-md"
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
  </Background>
</template>
