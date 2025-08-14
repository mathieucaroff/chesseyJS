import { getAvailableMoveList } from "../move/moveList"
import { canPawnMoveTo, canPieceAttackSquare } from "../rule/ruleset"
import { applyMoveToState, kingIsInCheck } from "../state/state"
import { readCaseToTurn } from "../util/turnUtil"

/** Converts a file number (0-7) to its corresponding chess letter (a-h) */
export function getLetter(x: number): string {
  return String.fromCharCode(97 + x)
}

/** Converts a rank number (0-7) to its corresponding chess rank (1-8) */
function getRank(y: number): number {
  return y + 1
}

/**
 * Determines if a move is a capture based on the target square or special
 * move type
 */
function isCapture(move: Omit<Move, "notation">, state: State): boolean {
  const targetSquare = state.board[move.ny][move.nx]
  return targetSquare !== "_" || move.special === "enPassant"
}

/** Checks if making a test move would leave the king in check */
function wouldBeInCheck(
  state: State,
  testMove: Omit<Move, "notation">,
): boolean {
  // Import here to avoid circular dependency
  const testState = applyMoveToState({ ...testMove, notation: "" }, state)
  return kingIsInCheck(testState)
}

/**
 * Finds all pieces of the same type and color that could potentially move to
 * the same destination
 */
function findSimilarMoves(
  move: Omit<Move, "notation">,
  state: State,
): Array<{ x: number; y: number }> {
  const { nx, ny, kind } = move
  const similarMoves: Array<{ x: number; y: number }> = [] // Search the board for pieces of the same type and color
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = state.board[y][x]

      // Skip empty squares
      if (piece === "_") continue

      // Check if it's the same piece type and color as the moving piece
      const pieceKind = piece.toLowerCase() as EntityKind
      const pieceColor = readCaseToTurn(piece)

      if (pieceKind === kind && pieceColor === state.turn) {
        // Skip the original piece position
        if (x === move.x && y === move.y) continue

        // For non-pawn pieces, we can use canPieceAttackSquare directly
        // For pawns, we need special logic since canPieceAttackSquare only
        // handles attacks
        if (pieceKind === "p") {
          // Check if this pawn can move to the destination
          if (canPawnMoveTo(x, y, nx, ny, state)) {
            similarMoves.push({ x, y })
          }
        } else {
          // For other pieces, check if they can attack/move to the destination
          // We need to temporarily clear the destination square to check
          // movement
          const originalPiece = state.board[ny][nx]
          const tempState = {
            ...state,
            board: state.board.map((row, rowIdx) =>
              rowIdx === ny
                ? row.map((cell, colIdx) => (colIdx === nx ? "_" : cell))
                : [...row],
            ),
          }

          if (
            canPieceAttackSquare(x, y, nx, ny, pieceKind, pieceColor, tempState)
          ) {
            similarMoves.push({ x, y })
          }
        }
      }
    }
  }

  return similarMoves
}

/**
 * Generates disambiguation notation for non-pawn pieces when multiple pieces
 * can reach the same square
 */
function getNonPawnDisambiguation(
  move: Omit<Move, "notation">,
  state: State,
): string {
  if (move.kind === "p") return "" // Pawns don't need disambiguation except for captures

  const similarMoves = findSimilarMoves(move, state)
  if (similarMoves.length === 0) return ""

  // Check if file disambiguation is enough
  const sameFile = similarMoves.filter((m) => m.x === move.x)
  if (sameFile.length === 0) {
    return getLetter(move.x)
  }

  // Check if rank disambiguation is enough
  const sameRank = similarMoves.filter((m) => m.y === move.y)
  if (sameRank.length === 0) {
    return getRank(move.y).toString()
  }

  // Use full square notation
  return `${getLetter(move.x)}${getRank(move.y)}`
}

/** Converts a move to standard algebraic notation (SAN) */
export function getNotation(
  move: Omit<Move, "notation">,
  state: State,
): string {
  const { x, y, nx, ny, kind, special } = move

  // Handle regular moves
  let notation = ""

  const destination = `${getLetter(nx)}${getRank(ny)}`

  // Handle special moves first
  notation = {
    castleShort: () => `O-O`,
    castleLong: () => `O-O-O`,
    enPassant: () => `${getLetter(x)}x${destination}`,
    promotion: () => {
      let promotionBase = `${destination}`
      if (isCapture(move, state)) {
        promotionBase = `${getLetter(x)}x${promotionBase}`
      }
      return `${promotionBase}=${kind.toUpperCase()}`
    },
    longPawnMove: () => `${destination}`,
    "": () => "",
  }[special]()

  if (!special) {
    // Piece notation (empty for pawns)
    if (kind !== "p") {
      notation += kind.toUpperCase()
      notation += getNonPawnDisambiguation(move, state)
    }

    // Capture notation
    if (isCapture(move, state)) {
      if (kind === "p") {
        // Pawn captures include the file
        notation += getLetter(x)
      }
      notation += "x"
    }

    // Destination square
    notation += destination
  }

  // Check if this move puts the opponent in check or checkmate
  // We need to create a test state to check this

  const testMove: Move = { ...move, notation: "" }
  if (wouldBeInCheck(state, testMove)) {
    // Check if it's checkmate by seeing if opponent has any legal moves
    const testState = applyMoveToState(testMove, state)
    const opponentMoves = getAvailableMoveList(testState, false)

    if (opponentMoves === "checkmate") {
      notation += "#"
    } else {
      notation += "+"
    }
  }

  return notation
}
