export interface Point {
  x: number
  y: number
}

export type Direction = Point

export type GameState = 'idle' | 'running' | 'paused' | 'gameover'
