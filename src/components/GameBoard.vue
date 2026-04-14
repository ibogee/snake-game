<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Point, GameState, Direction } from '../types/game'
import { GRID_SIZE, TILE_COUNT } from '../composable/useSnakeGame'

const props = defineProps<{
  snake: Point[]
  food: Point
  gameState: GameState
}>()

const emit = defineEmits<{
  directionChange: [dir: Direction]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

function draw() {
  if (!ctx || !canvasRef.value) return
  const canvas = canvasRef.value

  ctx.fillStyle = '#0f3460'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 网格线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
  for (let i = 0; i < TILE_COUNT; i++) {
    ctx.beginPath()
    ctx.moveTo(i * GRID_SIZE, 0)
    ctx.lineTo(i * GRID_SIZE, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * GRID_SIZE)
    ctx.lineTo(canvas.width, i * GRID_SIZE)
    ctx.stroke()
  }

  // 蛇
  props.snake.forEach((seg, i) => {
    ctx!.fillStyle = i === 0 ? '#4ecca3' : '#45b393'
    ctx!.fillRect(
      seg.x * GRID_SIZE + 1,
      seg.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2,
    )
  })

  // 食物
  ctx.fillStyle = '#e94560'
  ctx.beginPath()
  ctx.arc(
    props.food.x * GRID_SIZE + GRID_SIZE / 2,
    props.food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2,
    0,
    Math.PI * 2,
  )
  ctx.fill()
}

function handleKeydown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  switch (key) {
    case 'arrowup':
    case 'w':
      e.preventDefault()
      emit('directionChange', { x: 0, y: -1 })
      break
    case 'arrowdown':
    case 's':
      e.preventDefault()
      emit('directionChange', { x: 0, y: 1 })
      break
    case 'arrowleft':
    case 'a':
      e.preventDefault()
      emit('directionChange', { x: -1, y: 0 })
      break
    case 'arrowright':
    case 'd':
      e.preventDefault()
      emit('directionChange', { x: 1, y: 0 })
      break
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    ctx = canvas.getContext('2d')
  }
  document.addEventListener('keydown', handleKeydown)
  draw()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(
  () => [props.snake, props.food, props.gameState],
  () => draw(),
  { deep: true },
)
</script>

<template>
  <canvas
    ref="canvasRef"
    width="400"
    height="400"
    class="game-canvas"
  />
</template>

<style scoped>
.game-canvas {
  border: 2px solid #16213e;
  border-radius: 8px;
  background: #0f3460;
}
</style>
