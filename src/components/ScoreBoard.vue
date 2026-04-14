<script setup lang="ts">
import { computed } from 'vue'
import type { GameState } from '../types/game'

const props = defineProps<{
  score: number
  gameState: GameState
}>()

const emit = defineEmits<{
  start: []
  pause: []
  resume: []
  restart: []
}>()

const startButtonText = computed(() => {
  if (props.gameState === 'idle') return '开始游戏'
  return '重新开始'
})

const pauseButtonText = computed(() => {
  if (props.gameState === 'paused') return '继续'
  return '暂停'
})

function handleStart() {
  if (props.gameState === 'idle' || props.gameState === 'gameover') {
    emit('start')
  } else {
    emit('restart')
  }
}

function handlePause() {
  if (props.gameState === 'running') {
    emit('pause')
  } else if (props.gameState === 'paused') {
    emit('resume')
  }
}
</script>

<template>
  <div class="score-board">
    <div class="score">得分: <span class="score-value">{{ score }}</span></div>
    <div class="controls">
      <button class="btn btn-primary" @click="handleStart">
        {{ startButtonText }}
      </button>
      <button
        class="btn btn-secondary"
        :disabled="gameState !== 'running' && gameState !== 'paused'"
        @click="handlePause"
      >
        {{ pauseButtonText }}
      </button>
    </div>
    <div class="tip">方向键 ↑ ↓ ← → 或 W A S D 控制</div>
  </div>
</template>

<style scoped>
.score-board {
  text-align: center;
  margin-top: 15px;
}

.score {
  color: #eee;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.score-value {
  color: var(--color-primary);
  font-weight: bold;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 10px 25px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: #16213e;
  color: #eee;
}

.btn-secondary:hover:not(:disabled) {
  background: #1a2744;
}

.tip {
  color: #aaa;
  margin-top: 12px;
  font-size: 0.9rem;
}
</style>
