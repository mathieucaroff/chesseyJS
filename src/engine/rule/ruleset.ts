import { forEachInBoard, inbound } from "../util/boardUtil"
import { readCaseToTurn } from "../util/turnUtil"

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

export function canPawnMoveTo(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  state: State,
): boolean {
  const piece = state.board[fromY][fromX]
  const isWhitePawn = piece === piece.toLowerCase()
  const dy = isWhitePawn ? 1 : -1

  const deltaX = toX - fromX
  const deltaY = toY - fromY

  // Forward move (one or two squares)
  if (deltaX === 0) {
    if (deltaY === dy && state.board[toY][toX] === "_") return true
    if (
      deltaY === 2 * dy &&
      fromY === (isWhitePawn ? 1 : 6) &&
      state.board[fromY + dy][fromX] === "_" &&
      state.board[toY][toX] === "_"
    )
      return true
  }

  // Diagonal capture
  if (Math.abs(deltaX) === 1 && deltaY === dy) {
    const targetSquare = state.board[toY][toX]
    if (targetSquare !== "_") {
      const targetColor =
        targetSquare === targetSquare.toLowerCase() ? "white" : "black"
      const pawnColor = isWhitePawn ? "white" : "black"
      if (targetColor !== pawnColor) return true
    }
    // En passant
    if (state.enPassant === toX && toY === (isWhitePawn ? 5 : 2)) return true
  }

  return false
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
    // Determine pawn direction based on the actual piece on the board, not state.turn
    const actualPiece = state.board[y][x]
    const isWhitePawn = actualPiece === actualPiece.toLowerCase()
    const dy = isWhitePawn ? 1 : -1
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

      if (nx === kx && ny === ky) return true

      if (!inbound(nx, ny) || state.board[ny][nx] !== "_") break
    }

    return false
  })
}

export function isUnderAttack(
  targetX: number,
  targetY: number,
  byColor: Turn,
  state: State,
): boolean {
  let isAttacked = false
  forEachInBoard(state.board, (piece, x, y) => {
    if (piece === "_") return
    if (readCaseToTurn(piece) === byColor) {
      if (
        canPieceAttackSquare(
          x,
          y,
          targetX,
          targetY,
          piece.toLowerCase() as EntityKind,
          state,
        )
      ) {
        isAttacked = true
        return true // Stop checking once we find a piece that can attack the target
      }
    }
  })
  return isAttacked
}
