export type Versus = "humanHuman" | "humanAi" | "AiHuman" | "AiAi"

export interface GameHistory {
  movePairList: MovePairList
  // The extra move is a move made by White which awaits the move from
  // black before it is added to the move pair list.
  extraMove?: Move
}

export type MovePairList = [Move, Move][]

export interface Move {
  ax: number
  ay: number
  bx: number
  by: number
  kind: EntityKind
  takeValue: number
}

export type EntityKind = "p" | "r" | "n" | "b" | "q" | "k"
