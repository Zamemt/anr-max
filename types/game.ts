export interface Player {
  id: string
  name: string
  avatar: string
  score: number
  tokens: number
  isConnected: boolean
}

export interface SkillCard {
  id: string
  name: string
  description: string
  cost: number
  cooldown: number
  icon: string
}

export interface GameState {
  currentPlayer: "player1" | "player2"
  animalChain: string[]
  timeLeft: number
  round: number
  isListening: boolean
  gamePhase: "waiting" | "playing" | "finished"
}

export interface GameResult {
  winner: Player
  loser: Player
  tokensEarned: number
  finalChain: string[]
}
