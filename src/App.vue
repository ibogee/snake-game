<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSnakeGame } from './composable/useSnakeGame'
import GameBoard from './components/GameBoard.vue'
import ScoreBoard from './components/ScoreBoard.vue'

const { snake, food, score, gameState, start, pause, resume, restart, setDirection } =
  useSnakeGame()

function handleKeydown(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault()
    if (gameState.value === 'idle' || gameState.value === 'gameover') {
      start()
    } else if (gameState.value === 'running') {
      pause()
    } else if (gameState.value === 'paused') {
      resume()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="app">
    <h1 class="title">贪吃蛇</h1>
    <GameBoard
      :snake="snake"
      :food="food"
      :game-state="gameState"
      @direction-change="setDirection"
    />
    <ScoreBoard
      :score="score"
      :game-state="gameState"
      @start="start"
      @pause="pause"
      @resume="resume"
      @restart="restart"
    />
    <div v-if="gameState === 'gameover'" class="gameover-overlay">
      <div class="gameover-text">游戏结束</div>
      <div class="gameover-score">得分: {{ score }}</div>
    </div>
  </div>
</template>

<style>
:root {
  --color-primary: #e94560;
  --color-primary-dark: #c81e45;
  --color-snake-head: #4ecca3;
  --color-snake-body: #45b393;
  --color-bg: #1a1a2e;
  --color-surface: #16213e;
  --bg-canvas: #0f3460;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg);
  font-family: 'Microsoft YaHei', sans-serif;
  position: relative;
}

.title {
  color: var(--color-primary);
  margin-bottom: 10px;
  font-size: 2rem;
}

.gameover-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 30px 50px;
  border-radius: 12px;
  text-align: center;
}

.gameover-text {
  color: var(--color-primary);
  font-size: 28px;
  margin-bottom: 8px;
}

.gameover-score {
  color: #eee;
  font-size: 18px;
}
</style>
