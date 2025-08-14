import { applyMoveToState, initialState } from "../engine/state/state"
import { canPieceMoveTo } from "../engine/rule/ruleset"
import { applyTurnToCase } from "../engine/util/turnUtil"

/** Checks if a text string is empty or contains only whitespace */
function isEmpty(text: string) {
  return text.trim().length === 0
}

/**
 * Validates the format of a text-based move history to ensure it follows
 * expected structure
 */
export function checkTextMoveHistoryFormat(textMoveList: string[][]) {
  if (textMoveList.length === 0) {
    return
  }
  const last = textMoveList.slice(-1)[0]
  let skipLast = false
  if (last.length === 1) {
    if (isEmpty(last[0])) {
      throw new Error("Invalid history: empty last move pair")
    }
    skipLast = true
  }
  textMoveList.forEach((part, index) => {
    if (skipLast && index === textMoveList.length - 1) {
      return
    }
    if (part.length !== 2) {
      const count = part.length - 1
      throw new Error(
        `Invalid history: expected single space in move pair ${index}, got ${count}`,
      )
    }
    part.forEach((half) => {
      if (isEmpty(half)) {
        throw new Error(`Invalid history: empty move in pair ${index}`)
      }
    })
  })
}

/**
 * Parses chess notation string into a Move object with coordinates and
 * special move information
 */
export function parseNotation(notation: string, state: State): Move {
  // Remove check/checkmate indicators
  const short = notation.replace(/[+#]$/, "")

  // Handle special moves first
  let special: SpecialMoveName = ""
  // Handle castling
  // Short castle
  if (short.startsWith("O-O")) {
    let nx = 0
    if (short === "O-O") {
      special = "castleShort"
      nx = 6
    }
    // Long castle
    if (short === "O-O-O") {
      special = "castleLong"
      nx = 2
    }
    const x = 4
    const y = state.turn === "white" ? 0 : 7
    const ny = y
    return { x, y, nx, ny, kind: "k", special, notation }
  }

  // Determine piece kind
  const kind =
    (short.match(/^([RNBQK])/)?.[1].toLowerCase() as EntityKind) ?? "p"
  const character = applyTurnToCase(state.turn, kind)
  const isCapture = short.includes("x")
  const toSquare = short.match(/([a-h][1-8])(=[RNBQ])?$/)?.[0]
  if (!toSquare) {
    throw new Error(`Incorrect notation: ${notation}`)
  }
  const nx = toSquare.charCodeAt(0) - 97
  const ny = Number(toSquare[1]) - 1

  // promotion
  if (short.includes("=")) {
    special = "promotion"
  }
  // longPawnMove
  if (!special && !isCapture && kind === "p") {
    if (state.turn === "white") {
      // longPawnMove white
      if (
        ny === 3 &&
        state.board[2][nx] === "_" &&
        state.board[1][nx] === "p"
      ) {
        special = "longPawnMove"
        return { x: nx, y: 1, nx, ny, kind, special, notation }
      }
    } else {
      // longPawnMove black
      if (
        ny === 4 &&
        state.board[5][nx] === "_" &&
        state.board[6][nx] === "P"
      ) {
        special = "longPawnMove"
        return { x: nx, y: 6, nx, ny, kind, special, notation }
      }
    }
  }

  // Find the source position by checking all possible moves
  let x = -1
  let y = -1

  // For pawns, handle special logic
  if (kind === "p") {
    if (isCapture) {
      // Pawn capture - extract source file
      const disambiguatedCaptureMatch = short.match(/^([a-h])x/)
      y = state.turn === "white" ? ny - 1 : ny + 1
      if (disambiguatedCaptureMatch) {
        x = disambiguatedCaptureMatch[1].charCodeAt(0) - 97
      } else {
        // No disambiguation, check both possible position of the pawn
        // which did the capture
        if (state.board[y][x + 1] === character) {
          x = x + 1
        } else if (state.board[y][x - 1] === character) {
          x = x - 1
        } else {
          throw new Error(`Invalid move ${notation}`)
        }
      }
      // enPassant
      if (state.enPassant === nx && state.board[ny][nx] === "_") {
        special = "enPassant"
      }
    } else {
      // Regular pawn move
      x = nx
      const oneMoveY = state.turn === "white" ? ny - 1 : ny + 1
      const twoMoveY = state.turn === "white" ? ny - 2 : ny + 2

      if (state.board[oneMoveY]?.[x] === applyTurnToCase(state.turn, "p")) {
        y = oneMoveY
      } else if (
        state.board[twoMoveY]?.[x] === applyTurnToCase(state.turn, "p")
      ) {
        y = twoMoveY
        special = "longPawnMove"
      }
    }
  } else {
    // Handle disambiguation for non-pawn pieces
    // Extract possible disambiguation (file or rank or both)
    // Examples: Nbd2, R1e1, Qh4e1
    const disambigMatch = short.match(/^([RNBQK])([a-h1-8]{0,2})x?([a-h][1-8])/)
    if (!disambigMatch) {
      throw new Error(`Invalid move ${notation}`)
    }

    const disambig = disambigMatch[2]

    // Find all possible source squares for this piece
    let candidates: { x: number; y: number }[] = []
    for (let yy = 0; yy < 8; yy++) {
      for (let xx = 0; xx < 8; xx++) {
        if (state.board[yy][xx] === character) {
          // Check if this piece can move to (nx, ny)
          if (canPieceMoveTo(xx, yy, nx, ny, kind, state)) {
            candidates.push({ x: xx, y: yy })
          }
        }
      }
    }

    // Filter candidates by disambiguation
    if (disambig.length === 1) {
      if ("a" <= disambig && disambig <= "h") {
        // File disambiguation
        candidates = candidates.filter(
          (c) => c.x === disambig.charCodeAt(0) - 97,
        )
      } else {
        // Rank disambiguation
        candidates = candidates.filter((c) => c.y === Number(disambig) - 1)
      }
    } else if (disambig.length === 2) {
      // Both file and rank
      candidates = candidates.filter(
        (c) =>
          c.x === disambig.charCodeAt(0) - 97 &&
          c.y === Number(disambig[1]) - 1,
      )
    }

    if (candidates.length === 1) {
      x = candidates[0].x
      y = candidates[0].y
    } else if (candidates.length > 1) {
      // Ambiguous move, but notation should have disambiguation
      throw new Error(`Ambiguous move: ${notation}`)
    } else {
      // No candidate found
      throw new Error(`Invalid move: ${notation}`)
    }
  }

  return {
    x,
    y,
    nx,
    ny,
    kind,
    special,
    notation,
  }
}

/** Creates a complete game object from a text string containing move history */
export function gameFromText(text: string): Game {
  let textMoveList = text.split(";").map((part) => part.trim().split(/ +/))
  if (
    textMoveList.length === 1 &&
    textMoveList[0].length === 1 &&
    isEmpty(textMoveList[0][0])
  ) {
    textMoveList = []
  }
  checkTextMoveHistoryFormat(textMoveList)
  let state = initialState()
  const history: GameHistory = { movePairList: [] }

  textMoveList.forEach((pair, index) => {
    const [from, to] = pair
    const fromMove = parseNotation(from, state)
    state = applyMoveToState(fromMove, state)

    if (to) {
      const toMove = parseNotation(to, state)
      state = applyMoveToState(toMove, state)
      history.movePairList.push([fromMove, toMove])
    } else {
      history.extraMove = fromMove
    }
  })

  return {
    history,
    state,
  }
}
