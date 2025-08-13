import { inbound } from "../util/boardUtil"

const knightMovementRule: PieceMovementRule = {
  repeat: false,
  deltaList: [
    [2, 1],
    [2, -1],
    [1, 2],
    [1, -2],
  ],
}

const bishopMovementRule: PieceMovementRule = {
  repeat: true,
  deltaList: [
    [1, 1],
    [1, -1],
  ],
}

const towerMovementRule: PieceMovementRule = {
  repeat: true,
  deltaList: [
    [0, 1],
    [1, 0],
  ],
}

const kingMovementRule: PieceMovementRule = {
  repeat: false,
  deltaList: [...bishopMovementRule.deltaList, ...towerMovementRule.deltaList],
}

const queenMovementRule: PieceMovementRule = {
  repeat: true,
  deltaList: kingMovementRule.deltaList,
}

export const movementRuleRecord: Record<
  EntityKind,
  PieceMovementRule | "pawn"
> = {
  p: "pawn",
  n: knightMovementRule,
  b: bishopMovementRule,
  r: towerMovementRule,
  q: queenMovementRule,
  k: kingMovementRule,
}

const pieceValueRecord = {
  p: 1,
  n: 3,
  b: 3.5,
  r: 5,
  q: 9,
  k: Infinity,
}

export function canPieceAttackSquare(
  x: number,
  y: number,
  kx: number,
  ky: number,
  piece: EntityKind,
  state: State,
): boolean {
  let movementRule = movementRuleRecord[piece]

  if (movementRule === "pawn") {
    const dy = state.turn === "white" ? 1 : -1
    const captureSquares = [
      [x - 1, y + dy],
      [x + 1, y + dy],
    ]
    return captureSquares.some(([nx, ny]) => nx === kx && ny === ky)
  }

  const { deltaList, repeat } = movementRule
  const allDeltas = [...deltaList, ...deltaList.map(([dx, dy]) => [-dx, -dy])]

  return allDeltas.some(([dx, dy]) => {
    let nx = x
    let ny = y

    for (let k = 0; k < (repeat ? 8 : 1); k++) {
      nx += dx
      ny += dy

      if (!inbound(nx, ny)) break

      if (nx === kx && ny === ky) return true

      if (state.board[ny][nx] !== "_") break
    }

    return false
  })
}
