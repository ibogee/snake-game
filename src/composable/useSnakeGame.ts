import { ref, shallowRef } from 'vue'
import type { Point, Direction, GameState } from '../types/game'

const GRID_SIZE = 20
const TILE_COUNT = 20
const INITIAL_SPEED = 120
const MIN_SPEED = 50
const SPEED_DECREMENT = 2

export { GRID_SIZE, TILE_COUNT }

export function useSnakeGame() {
  const snake = ref<Point[]>([{ x: 10, y: 10 }])
  const food = ref<Point>({ x: 15, y: 15 })
  const score = ref(0)
  const speed = ref(INITIAL_SPEED)
  const gameState = ref<GameState>('idle')
  const direction = ref<Direction>({ x: 0, y: 0 })
  const nextDirection = ref<Direction>({ x: 0, y: 0 })

  const gameLoop = shallowRef<ReturnType<typeof setInterval> | null>(null)

  function init() {
    snake.value = [{ x: 10, y: 10 }]
    food.value = { x: 15, y: 15 }
    direction.value = { x: 0, y: 0 }
    nextDirection.value = { x: 0, y: 0 }
    score.value = 0
    speed.value = INITIAL_SPEED
    gameState.value = 'idle'
  }

  function placeFood() {
    let newFood: Point
    do {
      newFood = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT),
      }
    } while (snake.value.some(s => s.x === newFood.x && s.y === newFood.y))
    food.value = newFood
  }

  function update() {
    direction.value = { ...nextDirection.value }
    if (direction.value.x === 0 && direction.value.y === 0) return

    const head: Point = {
      x: snake.value[0].x + direction.value.x,
      y: snake.value[0].y + direction.value.y,
    }

    // 撞墙
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      gameOver()
      return
    }
    // 撞自身
    if (snake.value.some(s => s.x === head.x && s.y === head.y)) {
      gameOver()
      return
    }

    snake.value = [head, ...snake.value]

    if (head.x === food.value.x && head.y === food.value.y) {
      score.value++
      placeFood()
      // 加速
      if (speed.value > MIN_SPEED) {
        speed.value -= SPEED_DECREMENT
        restartLoop()
      }
    } else {
      snake.value = snake.value.slice(0, -1)
    }
  }

  /** 手动推进一帧——用于测试，直接执行 update 逻辑 */
  function tick() {
    update()
  }

  function gameOver() {
    stopLoop()
    gameState.value = 'gameover'
  }

  function stopLoop() {
    if (gameLoop.value !== null) {
      clearInterval(gameLoop.value)
      gameLoop.value = null
    }
  }

  function restartLoop() {
    stopLoop()
    gameLoop.value = setInterval(update, speed.value)
  }

  function start() {
    if (gameState.value === 'running') return
    if (gameState.value === 'idle' || gameState.value === 'gameover') {
      init()
      direction.value = { x: 1, y: 0 }
      nextDirection.value = { x: 1, y: 0 }
    }
    gameState.value = 'running'
    restartLoop()
  }

  function pause() {
    if (gameState.value !== 'running') return
    stopLoop()
    gameState.value = 'paused'
  }

  function resume() {
    if (gameState.value !== 'paused') return
    gameState.value = 'running'
    restartLoop()
  }

  function restart() {
    stopLoop()
    init()
  }

  function setDirection(dir: Direction) {
    // 防止 180° 掉头——基于已缓冲的方向判断
    if (nextDirection.value.x + dir.x === 0 && nextDirection.value.y + dir.y === 0) return
    nextDirection.value = dir
  }

  return {
    snake,
    food,
    score,
    speed,
    gameState,
    direction,
    start,
    pause,
    resume,
    restart,
    setDirection,
    tick,
  }
}
