import { describe, it, expect, beforeEach } from 'vitest'
import { useSnakeGame, TILE_COUNT } from '../../src/composable/useSnakeGame'

describe('useSnakeGame', () => {
  let game: ReturnType<typeof useSnakeGame>

  beforeEach(() => {
    game = useSnakeGame()
  })

  describe('初始化', () => {
    it('初始状态下蛇只有一个节', () => {
      expect(game.snake.value).toHaveLength(1)
      expect(game.snake.value[0]).toEqual({ x: 10, y: 10 })
    })

    it('初始得分为 0', () => {
      expect(game.score.value).toBe(0)
    })

    it('初始状态为 idle', () => {
      expect(game.gameState.value).toBe('idle')
    })
  })

  describe('方向变更', () => {
    it('setDirection 后 tick 应用方向', () => {
      game.start()
      game.setDirection({ x: 0, y: -1 })
      game.tick()
      expect(game.snake.value[0].y).toBe(9)
    })

    it('180° 掉头被拒绝', () => {
      game.start() // 默认向右
      game.setDirection({ x: -1, y: 0 }) // 尝试向左
      game.tick()
      expect(game.snake.value[0].x).toBe(11) // 仍然向右
    })

    it('支持向下', () => {
      game.start()
      game.setDirection({ x: 0, y: 1 })
      game.tick()
      expect(game.snake.value[0]).toEqual({ x: 10, y: 11 })
    })

    it('支持向左', () => {
      game.start()
      game.setDirection({ x: 0, y: 1 }) // 先向下脱离同轴
      game.tick()
      game.setDirection({ x: -1, y: 0 })
      game.tick()
      expect(game.snake.value[0]).toEqual({ x: 9, y: 11 })
    })

    it('支持向上', () => {
      game.start()
      game.setDirection({ x: 0, y: 1 }) // 向下
      game.tick() // (10, 11)
      game.setDirection({ x: 1, y: 0 }) // 向右脱离同轴
      game.tick() // (11, 11)
      game.setDirection({ x: 0, y: -1 }) // 向上
      game.tick() // (11, 10)
      expect(game.snake.value[0]).toEqual({ x: 11, y: 10 })
    })

    it('支持向右（默认方向）', () => {
      game.start()
      game.tick()
      expect(game.snake.value[0]).toEqual({ x: 11, y: 10 })
    })
  })

  describe('吃食物', () => {
    it('吃到食物后蛇身增长且得分增加', () => {
      const initialLength = game.snake.value.length
      game.start()
      game.food.value = { x: 11, y: 10 }
      game.tick()
      expect(game.snake.value.length).toBe(initialLength + 1)
      expect(game.score.value).toBe(1)
    })

    it('未吃到食物时蛇身长度不变', () => {
      const initialLength = game.snake.value.length
      game.start()
      game.food.value = { x: 0, y: 0 }
      game.tick()
      expect(game.snake.value.length).toBe(initialLength)
      expect(game.score.value).toBe(0)
    })
  })

  describe('撞墙判定', () => {
    it('撞右墙触发 gameover', () => {
      game.start()
      game.snake.value = [{ x: TILE_COUNT - 1, y: 10 }]
      game.tick()
      expect(game.gameState.value).toBe('gameover')
    })

    it('撞左墙触发 gameover', () => {
      game.start()
      game.snake.value = [{ x: 0, y: 10 }]
      game.setDirection({ x: 0, y: 1 }) // 先向下脱离同轴
      game.tick()
      game.setDirection({ x: -1, y: 0 })
      game.tick()
      expect(game.gameState.value).toBe('gameover')
    })

    it('撞上墙触发 gameover', () => {
      game.start()
      game.snake.value = [{ x: 10, y: 0 }]
      game.setDirection({ x: 0, y: -1 })
      game.tick()
      expect(game.gameState.value).toBe('gameover')
    })

    it('撞下墙触发 gameover', () => {
      game.start()
      game.snake.value = [{ x: 10, y: TILE_COUNT - 1 }]
      game.setDirection({ x: 0, y: 1 })
      game.tick()
      expect(game.gameState.value).toBe('gameover')
    })
  })

  describe('撞自身判定', () => {
    it('蛇头撞到自身触发 gameover', () => {
      game.start()
      // 蛇头 (5,5)，身体 (5,4), (4,4), (4,5)
      game.snake.value = [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
      ]
      game.setDirection({ x: 0, y: -1 }) // 向上 → (5,4) 撞到自身
      game.tick()
      expect(game.gameState.value).toBe('gameover')
    })
  })

  describe('食物生成', () => {
    it('食物不与蛇身重叠', () => {
      game.start()
      game.food.value = { x: 11, y: 10 }
      game.tick() // 吃到食物，placeFood 被调用
      const isInSnake = game.snake.value.some(
        s => s.x === game.food.value.x && s.y === game.food.value.y,
      )
      expect(isInSnake).toBe(false)
    })
  })

  describe('速度递增', () => {
    it('吃到食物后速度递增', () => {
      game.start()
      const initialSpeed = game.speed.value
      game.food.value = { x: 11, y: 10 }
      game.tick()
      expect(game.speed.value).toBeLessThan(initialSpeed)
    })
  })

  describe('状态切换', () => {
    it('idle → running → paused → running', () => {
      expect(game.gameState.value).toBe('idle')
      game.start()
      expect(game.gameState.value).toBe('running')
      game.pause()
      expect(game.gameState.value).toBe('paused')
      game.resume()
      expect(game.gameState.value).toBe('running')
    })

    it('running → gameover', () => {
      game.start()
      game.snake.value = [{ x: TILE_COUNT - 1, y: 10 }]
      game.tick()
      expect(game.gameState.value).toBe('gameover')
    })

    it('gameover 后可以重新 start', () => {
      game.start()
      game.snake.value = [{ x: TILE_COUNT - 1, y: 10 }]
      game.tick()
      expect(game.gameState.value).toBe('gameover')
      game.start()
      expect(game.gameState.value).toBe('running')
      expect(game.snake.value).toEqual([{ x: 10, y: 10 }])
    })
  })

  describe('restart', () => {
    it('restart 重置所有状态', () => {
      game.start()
      game.food.value = { x: 11, y: 10 }
      game.tick()
      expect(game.score.value).toBe(1)

      game.restart()
      expect(game.gameState.value).toBe('idle')
      expect(game.score.value).toBe(0)
      expect(game.snake.value).toEqual([{ x: 10, y: 10 }])
      expect(game.speed.value).toBe(120)
    })
  })
})
