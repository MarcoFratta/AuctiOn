<template>
  <div :class="cn('relative h-full w-full', props.containerClass)">
    <Motion
      ref="containerRef"
      :animate="{ opacity: 1 }"
      :initial="{ opacity: 0 }"
      as="div"
      class="absolute inset-0 z-0 flex size-full items-center justify-center bg-transparent"
    >
      <canvas ref="canvasRef"></canvas>
    </Motion>
  </div>
</template>

<script lang="ts" setup>
import { createNoise3D } from 'simplex-noise'
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { templateRef, useDebounceFn } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { Motion } from 'motion-v'

const TAU = 2 * Math.PI
const BASE_TTL = 50
const RANGE_TTL = 150
const PARTICLE_PROP_COUNT = 9
const RANGE_HUE = 100
const NOISE_STEPS = 3
const X_OFF = 0.00125
const Y_OFF = 0.00125
const Z_OFF = 0.0005

interface VortexProps {
  class?: string
  containerClass?: string
  particleCount?: number
  rangeY?: number
  baseHue?: number
  baseSpeed?: number
  rangeSpeed?: number
  baseRadius?: number
  rangeRadius?: number
  backgroundColor?: string
  particleOpacity?: number
}

const props = withDefaults(defineProps<VortexProps>(), {
  particleCount: 700,
  rangeY: 100,
  baseSpeed: 0.0,
  rangeSpeed: 1.5,
  baseRadius: 1,
  rangeRadius: 2,
  baseHue: 220,
  backgroundColor: '#000000',
  particleOpacity: 0.8,
})

const tick = ref<number>(0)
const animationFrame = ref<number | null>(null)
const particleProps = shallowRef<Float32Array | null>(null)
const center = ref<[number, number]>([0, 0])
const ctx = shallowRef<CanvasRenderingContext2D | null>(null)

const canvasRef = templateRef<HTMLCanvasElement | null>('canvasRef')
const containerRef = templateRef<HTMLElement | null>('containerRef')

const particleCache = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 0,
  ttl: 0,
  speed: 0,
  radius: 0,
  hue: 0,
}

const noise3D = createNoise3D()

function rand(n: number) {
  return n * Math.random()
}

function randRange(n: number): number {
  return n - rand(2 * n)
}

function fadeInOut(t: number, m: number): number {
  const hm = 0.5 * m
  return Math.abs(((t + hm) % m) - hm) / hm
}

function lerp(n1: number, n2: number, speed: number): number {
  return (1 - speed) * n1 + speed * n2
}

function initParticle(i: number) {
  if (!particleProps.value || !canvasRef.value) return

  const canvas = canvasRef.value
  particleCache.x = rand(canvas.width)
  particleCache.y = center.value[1] + randRange(props.rangeY)
  particleCache.vx = 0
  particleCache.vy = 0
  particleCache.life = 0
  particleCache.ttl = BASE_TTL + rand(RANGE_TTL)
  particleCache.speed = props.baseSpeed + rand(props.rangeSpeed)
  particleCache.radius = props.baseRadius + rand(props.rangeRadius)
  particleCache.hue = props.baseHue + rand(RANGE_HUE)

  particleProps.value.set(
    [
      particleCache.x,
      particleCache.y,
      particleCache.vx,
      particleCache.vy,
      particleCache.life,
      particleCache.ttl,
      particleCache.speed,
      particleCache.radius,
      particleCache.hue,
    ],
    i,
  )
}

function updateParticle(i: number) {
  if (!particleProps.value || !canvasRef.value || !ctx.value) return

  const canvas = canvasRef.value
  const pProps = particleProps.value
  const context = ctx.value

  particleCache.x = pProps[i]
  particleCache.y = pProps[i + 1]
  particleCache.vx = pProps[i + 2]
  particleCache.vy = pProps[i + 3]
  particleCache.life = pProps[i + 4]
  particleCache.ttl = pProps[i + 5]
  particleCache.speed = pProps[i + 6]
  particleCache.radius = pProps[i + 7]
  particleCache.hue = pProps[i + 8]

  const n =
    noise3D(particleCache.x * X_OFF, particleCache.y * Y_OFF, tick.value * Z_OFF) *
    NOISE_STEPS *
    TAU

  const nextVx = lerp(particleCache.vx, Math.cos(n), 0.5)
  const nextVy = lerp(particleCache.vy, Math.sin(n), 0.5)
  const nextX = particleCache.x + nextVx * particleCache.speed
  const nextY = particleCache.y + nextVy * particleCache.speed

  context.save()
  context.lineCap = 'round'
  context.lineWidth = particleCache.radius

  // Adjust particle color and opacity based on background
  const opacity = fadeInOut(particleCache.life, particleCache.ttl) * props.particleOpacity
  const isLightBackground = isLightColor(props.backgroundColor)

  // Use darker colors for light backgrounds and brighter colors for dark backgrounds
  const lightness = isLightBackground ? '30%' : '60%'
  context.strokeStyle = `hsla(${particleCache.hue},100%,${lightness},${opacity})`

  context.beginPath()
  context.moveTo(particleCache.x, particleCache.y)
  context.lineTo(nextX, nextY)
  context.stroke()
  context.restore()

  pProps[i] = nextX
  pProps[i + 1] = nextY
  pProps[i + 2] = nextVx
  pProps[i + 3] = nextVy
  pProps[i + 4] = particleCache.life + 1

  if (
    nextX > canvas.width ||
    nextX < 0 ||
    nextY > canvas.height ||
    nextY < 0 ||
    particleCache.life > particleCache.ttl
  ) {
    initParticle(i)
  }
}

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
  // Simple check for hex colors
  if (color.startsWith('#')) {
    const hex = color.substring(1)
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    // Calculate perceived brightness
    return r * 0.299 + g * 0.587 + b * 0.114 > 128
  }
  // Default to assuming dark background
  return false
}

function draw() {
  if (!canvasRef.value || !ctx.value || !particleProps.value) return

  const canvas = canvasRef.value
  const context = ctx.value

  tick.value++

  context.fillStyle = props.backgroundColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < particleProps.value.length; i += PARTICLE_PROP_COUNT) {
    updateParticle(i)
  }

  // Adjust blur and brightness based on background color
  const isLightBg = isLightColor(props.backgroundColor)
  const blurAmount = isLightBg ? '4px' : '8px'
  const brightness = isLightBg ? '150%' : '200%'

  context.save()
  context.filter = `blur(${blurAmount}) brightness(${brightness})`
  context.globalCompositeOperation = isLightBg ? 'multiply' : 'lighter'
  context.drawImage(canvas, 0, 0)
  context.restore()

  context.save()
  context.filter = `blur(${isLightBg ? '2px' : '4px'}) brightness(${brightness})`
  context.globalCompositeOperation = isLightBg ? 'multiply' : 'lighter'
  context.drawImage(canvas, 0, 0)
  context.restore()

  animationFrame.value = requestAnimationFrame(draw)
}

const handleResize = useDebounceFn(() => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const { innerWidth, innerHeight } = window
  canvas.width = innerWidth
  canvas.height = innerHeight
  center.value = [0.5 * canvas.width, 0.5 * canvas.height]
}, 150)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx.value = canvas.getContext('2d')
  if (!ctx.value) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  center.value = [0.5 * canvas.width, 0.5 * canvas.height]

  const particlePropsLength = props.particleCount * PARTICLE_PROP_COUNT
  particleProps.value = new Float32Array(particlePropsLength)

  for (let i = 0; i < particlePropsLength; i += PARTICLE_PROP_COUNT) {
    initParticle(i)
  }

  draw()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  window.removeEventListener('resize', handleResize)

  ctx.value = null
  particleProps.value = null
})
</script>
