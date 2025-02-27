<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import InventorySelector from '@/components/InventorySelector.vue'
import { computed, ref } from 'vue'
import { lobbyConfigSchema } from '@/schemas/LobbySchema.ts'
import LoadingButton from '@/components/LoadingButton.vue'
import { createLobby } from '@/api/lobbyService.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { InvalidData } from '@/api/Errors.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import router from '@/router'

const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
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

    const res = await createLobby({
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
      .alreadyInLobby('', () => router.push('/lobby'))
      .authenticationError('', () => router.push('/login'))
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
  <form>
    <FormEntry
      v-model="rounds"
      :max="lobbyConfigSchema.shape.rounds.maxValue ?? undefined"
      :min="lobbyConfigSchema.shape.rounds.minValue ?? 0"
      :step="1"
      placeHolder="Number of rounds"
      title="Rounds"
      type="number"
      v-bind="roundsProps"
    ></FormEntry>
    <FormEntry
      v-model="maxPlayers"
      :max="lobbyConfigSchema.shape.maxPlayers.maxValue ?? undefined"
      :min="lobbyConfigSchema.shape.maxPlayers.minValue ?? 0"
      :step="1"
      placeHolder="Maximum number of players"
      title="Max players"
      type="number"
      v-bind="maxPlayersProps"
    ></FormEntry>
    <FormEntry
      v-model="bidTime"
      :max="lobbyConfigSchema.shape.bidTime.maxValue ?? undefined"
      :min="lobbyConfigSchema.shape.bidTime.minValue ?? 0"
      :step="2"
      placeHolder="Time to bid in seconds"
      title="Bid time"
      type="number"
      v-bind="bidTimeProps"
    ></FormEntry>
    <FormEntry
      v-model="startAmount"
      :max="lobbyConfigSchema.shape.startAmount.maxValue ?? undefined"
      :min="lobbyConfigSchema.shape.startAmount.minValue ?? 0"
      :step="100"
      placeHolder="Starting amount of money"
      title="Start amount"
      type="number"
      v-bind="startAmountProps"
    ></FormEntry>

    <InventorySelector
      :items="items!"
      :max="
        lobbyConfigSchema.shape.startInventory.shape.items.element.shape.quantity.maxValue ??
        undefined
      "
      :min="lobbyConfigSchema.shape.startInventory.shape.items.element.shape.quantity.minValue ?? 0"
      v-bind="itemsProps"
    >
      <template #header>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Select starting items</h2>
      </template>
    </InventorySelector>
    <LoadingButton
      :disable="!canSubmit.value"
      :loading="waitForResponse"
      text="Create"
      @click="handleForm"
    >
    </LoadingButton>
  </form>
</template>
