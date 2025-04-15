<template>
  <div
    :style="sliderStyles"
    class="slider-container relative mx-auto my-0 grid place-items-center overflow-hidden"
    @focusin="active = 1"
    @focusout="active = 0"
    @mouseenter="active = 1"
    @mouseleave="active = 0"
    @touchend="active = 0"
    @touchstart="active = 1"
  >
    <input
      id="track"
      :v-bind="value"
      class="size-full touch-none opacity-0 focus-visible:outline-offset-4 focus-visible:outline-transparent"
      disabled
      max="100"
      min="0"
      type="range"
    />
    <div
      :class="
        cn('slider-value-labels pointer-events-none absolute inset-x-0 top-0 z-[2] h-1/2 text-base')
      "
      :style="sliderLabelStyles"
      aria-hidden="true"
    ></div>
    <div
      :style="sliderTrackStyles"
      class="slider-track pointer-events-none absolute bottom-0 w-full"
    >
      <div
        class="slider-indicator absolute top-1/2 z-[2] h-3/4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-sm"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  leftColor?: string
  rightColor?: string
  leftTextColor?: string
  rightTextColor?: string
  minShiftLimit?: number
  maxShiftLimit?: number
  leftContent?: string
  rightContent?: string
  indicatorColor?: string
  borderRadius?: number
  darkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: 50,
  minShiftLimit: 40,
  maxShiftLimit: 68,
  leftContent: 'LEFT',
  rightContent: 'RIGHT',
  leftColor: '#CC00FF', // app-fuchsia-500
  rightColor: '#8C33FF', // app-violet-500
  leftTextColor: '#CC00FF', // app-fuchsia-500
  rightTextColor: '#8C33FF', // app-violet-500
  indicatorColor: '#FFFFFF',
  borderRadius: 8,
  darkMode: false,
})

const active = ref(0)

const shift = computed(() =>
  props.value > props.minShiftLimit && props.value < props.maxShiftLimit ? 1 : 0,
)

const sliderStyles = computed(() => ({
  '--value': props.value,
  '--shift': shift.value,
  '--active': active.value,
  '--leftContent': `"${props.leftContent} "`,
  '--rightContent': `" ${props.rightContent}"`,
  '--indicatorColor': indicatorColorHsl.value,
  '--leftTextColor': props.leftTextColor,
  '--rightTextColor': props.rightTextColor,
}))

const sliderLabelStyles = computed(() => ({
  '--shift': shift.value,
}))

const sliderTrackStyles = computed(() => ({
  '--value': props.value,
  '--shift': shift.value,
  '--leftColor': leftColorHsl.value,
  '--rightColor': rightColorHsl.value,
}))

const leftColorHsl = computed(() => {
  const [h, s, l] = hexToHsl(props.leftColor)
  const alpha = props.darkMode ? 0.3 : 0.2
  const lightness = props.darkMode ? 40 : 24 + (30 * (100 - props.value)) / 100
  return `hsl(${h} ${s}% ${lightness}% / ${alpha})`
})

const rightColorHsl = computed(() => {
  const [h, s, l] = hexToHsl(props.rightColor)
  const alpha = props.darkMode ? 0.3 : 0.1 + (0.4 * (100 - props.value)) / 100
  const lightness = props.darkMode ? 40 : l
  return `hsl(${h} ${s}% ${lightness}% / ${alpha})`
})

const indicatorColorHsl = computed(() => {
  const [h, s, l] = hexToHsl(props.indicatorColor)
  const activeAlpha = active.value * 0.5 + 0.5
  return `hsl(${h} ${s}% ${l}% / ${activeAlpha})`
})

const borderRadiusInPx = computed(() => `${props.borderRadius}px`)

function hexToHsl(hex: string): [number, number, number] {
  // Remove "#" if present
  hex = hex.replace(/^#/, '')

  // Parse r, g, b values
  let r = parseInt(hex.substring(0, 2), 16) / 255
  let g = parseInt(hex.substring(2, 4), 16) / 255
  let b = parseInt(hex.substring(4, 6), 16) / 255

  // Find min and max values of r, g, b
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max != min) {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}
</script>

<style scoped>
.slider-container {
  --speed: 0.65s;
  --update: 0s;
  --timing: linear(
    0,
    0.5007 7.21%,
    0.7803 12.29%,
    0.8883 14.93%,
    0.9724 17.63%,
    1.0343 20.44%,
    1.0754 23.44%,
    1.0898 25.22%,
    1.0984 27.11%,
    1.1014 29.15%,
    1.0989 31.4%,
    1.0854 35.23%,
    1.0196 48.86%,
    1.0043 54.06%,
    0.9956 59.6%,
    0.9925 68.11%,
    1
  );
}

.slider-value-labels {
  transform: translateY(calc(var(--shift, 0) * 50%));
  transition: transform var(--speed) var(--timing);
  counter-reset: low var(--value) high calc(100 - var(--value));
}

.slider-value-labels::after,
.slider-value-labels::before {
  font-variant: tabular-nums;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
}

.slider-value-labels::before {
  --range: calc((70 - (var(--value) / 100 * 10)) * 1%);
  color: var(--leftTextColor);
  content: var(--leftContent) counter(low) '%';
  mask: linear-gradient(90deg, hsl(0 0% 100% / 0.6) var(--range), hsl(0 0% 100% / 1) var(--range));
  left: 0.5rem;
}

.slider-value-labels::after {
  --range: calc((50 - (var(--value) / 100 * 10)) * 1%);
  color: var(--rightTextColor);
  content: counter(high) '%' ' ' var(--rightContent);
  mask: linear-gradient(90deg, hsl(0 0% 100% / 1) var(--range), hsl(0 0% 100% / 0.5) var(--range));
  right: 0.5rem;
}

.slider-track {
  height: calc(50% + (var(--shift) * 50%));
  transition: height var(--speed) var(--timing);
}

.slider-track::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--value, 0) * 1% - 0.5rem);
  background: var(--leftColor);
  border-radius: v-bind(borderRadiusInPx);
  transition: width var(--update);
}

.slider-track::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: calc((100 - var(--value, 0)) * 1% - 0.5rem);
  background: var(--rightColor);
  border-radius: v-bind(borderRadiusInPx);
  transition: width var(--update);
}

.slider-indicator {
  background: var(--indicatorColor);
  left: calc(var(--value, 0) * 1%);
  transition: left var(--update);
}

/* Range input styles */
[type='range']::-webkit-slider-thumb {
  appearance: none;
  height: 120px;
  width: 40px;
  margin-top: 0px;
  opacity: 1;
}

[type='range']::-webkit-slider-runnable-track {
  height: 120px;
  background: transparent;
  margin-top: -60px;
}

[type='range']::-moz-range-track {
  height: 120px;
  background: transparent;
  margin-top: -60px;
}
</style>
