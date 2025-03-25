<script lang="ts" setup>
import { Vortex } from '@/components/ui/vortex'
import { BlurReveal } from '@/components/ui/blur-reveal'
</script>

<template>
  <div class="fixed inset-0 w-full h-screen">
    <Vortex
      :accent-color="['#ff00ff', '#9900ff', '#6600ff']"
      :particle-count="300"
      :range-speed="1"
      :range-y="500"
      background-color="black"
      class="absolute inset-0 z-0"
    />
    <div class="absolute inset-0 z-10 overflow-auto flex justify-center items-center">
      <BlurReveal :delay="0.2" :duration="0.75" class="w-full">
        <slot></slot>
      </BlurReveal>
    </div>
  </div>
</template>
