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

/**
 * Checks if the path between two positions is clear of pieces for sliding
 * pieces
 */
function isPathClear(
  x: number,
  y: number,
  nx: number,
  ny: number,
  state: State,
): boolean {
  const dx = Math.sign(nx - x)
  const dy = Math.sign(ny - y)

  let currentX = x + dx
  let currentY = y + dy

  while (currentX !== nx || currentY !== ny) {
    if (state.board[currentY][currentX] !== "_") {
      return false
    }
    currentX += dx
    currentY += dy
  }

  return true
}

/** Determines if a pawn can legally move from one position to another */
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

/** Checks if a piece can legally move to a destination square */
export function canPieceMoveTo(
  x: number,
  y: number,
  nx: number,
  ny: number,
  kind: EntityKind,
  state: State,
): boolean {
  // This is a simplified version - you might want to import and use the actual
  // movement validation from ruleset.ts
  const dx = nx - x
  const dy = ny - y

  switch (kind) {
    case "r": // Rook
      return (dx === 0 || dy === 0) && isPathClear(x, y, nx, ny, state)
    case "n": // Knight
      return (
        (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
        (Math.abs(dx) === 1 && Math.abs(dy) === 2)
      )
    case "b": // Bishop
      return Math.abs(dx) === Math.abs(dy) && isPathClear(x, y, nx, ny, state)
    case "q": // Queen
      return (
        (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) &&
        isPathClear(x, y, nx, ny, state)
      )
    case "k": // King
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1
    case "p": // Pawn - use the existing function
      return canPawnMoveTo(x, y, nx, ny, state)
    default:
      return false
  }
}

/**
 * Determines if a piece at a given position can attack a specific target
 * square
 */
export function canPieceAttackSquare(
  x: number,
  y: number,
  kx: number,
  ky: number,
  piece: EntityKind,
  pieceColor: Turn,
  state: State,
): boolean {
  let movementRule = movementRuleRecord[piece]

  if (movementRule === "pawn") {
    const dy = pieceColor === "white" ? 1 : -1
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

/** Checks if a target square is under attack by pieces of a specified color */
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
          byColor,
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
