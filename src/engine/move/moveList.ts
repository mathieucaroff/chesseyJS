import { getNotation } from "../notation/notation"
import { isUnderAttack, movementRuleRecord } from "../rule/ruleset"
import { applyMoveToState, kingIsInCheck } from "../state/state"
import { forEachInBoard, inbound } from "../util/boardUtil"
import { oppositeTurn, readCaseToTurn } from "../util/turnUtil"

/** Generates all legal moves available for the current player in the given state */
export function getAvailableMoveList(
  state: State,
  withNotation: boolean,
): MoveOptionList {
  const isEnnemy = (square: string) => {
    if (square === "_") return false
    return readCaseToTurn(square) !== state.turn
  }

  const makeMove = (
    x: number,
    y: number,
    nx: number,
    ny: number,
    kind: EntityKind,
    special: SpecialMoveName,
    state: State,
  ): Move => ({
    x,
    y,
    nx,
    ny,
    kind,
    special,
    notation: withNotation
      ? getNotation({ x, y, nx, ny, kind, special }, state)
      : "",
  })

  let availableMoveList: Move[] = []
  const addMoveForEntity = (kind: EntityKind, x: number, y: number) => {
    let movementRule = movementRuleRecord[kind]
    if (movementRule === "pawn") {
      const dy = state.turn === "white" ? 1 : -1
      ;[-1, 0, 1].forEach((dx: number) => {
        const nx = x + dx
        let ny = y + dy
        if (!inbound(nx, ny)) return
        const square = state.board[ny][nx]
        if (dx === 0) {
          if (square === "_") {
            availableMoveList.push(makeMove(x, y, nx, ny, "p", "", state))
            ny += dy
            if (y === (state.turn === "white" ? 1 : 6)) {
              if (inbound(nx, ny) && state.board[ny][nx] === "_") {
                availableMoveList.push(
                  makeMove(x, y, nx, ny, "p", "longPawnMove", state),
                )
              }
            }
          }
        } else {
          if (isEnnemy(square)) {
            availableMoveList.push(makeMove(x, y, nx, ny, "p", "", state))
          }
        }
      })
      return
    }
    // pawn move handling region end

    // Handling all the pieces here (but not the pawns)
    const { deltaList, repeat } = movementRule
    ;[...deltaList, ...deltaList.map(([dx, dy]) => [-dx, -dy])].forEach(
      ([dx, dy]) => {
        // Handle piece walk, for rooks, bishops and queen(s)
        // The piece can move in the given direction until it hits the edge of
        // the board or an ally piece.
        let nx = x
        let ny = y
        for (let k = 0; k < (repeat ? 8 : 1); k++) {
          nx += dx
          ny += dy
          if (!inbound(nx, ny)) {
            return
          }
          let square = state.board[ny][nx]
          if (square === "_") {
            availableMoveList.push(makeMove(x, y, nx, ny, kind, "", state))
          } else if (isEnnemy(square)) {
            availableMoveList.push(makeMove(x, y, nx, ny, kind, "", state))
            return
          } else {
            // the piece is an ally, we cannot take it
            return
          }
        }
      },
    )
  }

  // Go through the board to add all the available moves for each piece
  forEachInBoard(state.board, (piece, x, y) => {
    if (piece !== "_" && readCaseToTurn(piece) === state.turn) {
      addMoveForEntity(piece.toLowerCase() as EntityKind, x, y)
    }
  })

  // Add the en passant moves
  if (state.enPassant >= 0) {
    const nx = state.enPassant
    const ny = state.turn === "white" ? 5 : 2
    const y = state.turn === "white" ? 4 : 3
    const pawnLetter = state.turn === "white" ? "p" : "P"
    ;[-1, 1].forEach((dx) => {
      const x = nx + dx
      if (inbound(x, y) && state.board[y][x] === pawnLetter) {
        availableMoveList.push(makeMove(x, y, nx, ny, "p", "enPassant", state))
      }
    })
  }

  // Add the castling moves
  const addCastlingMoves = (row: number, canCastle: Castle) => {
    // Cannot castle if king is in check
    if (isUnderAttack(4, row, oppositeTurn(state.turn), state)) {
      return
    }

    // Long castling (queenside)
    if (canCastle.long) {
      const allSquaresAvailable = [1, 2, 3].every(
        (col) =>
          state.board[row][col] === "_" &&
          !isUnderAttack(col, row, oppositeTurn(state.turn), state),
      )
      if (allSquaresAvailable) {
        availableMoveList.push(
          makeMove(4, row, 2, row, "k", "castleLong", state),
        )
      }
    }

    // Short castling (kingside)
    if (canCastle.short) {
      const allSquaresAvailable = [5, 6].every(
        (col) =>
          state.board[row][col] === "_" &&
          !isUnderAttack(col, row, oppositeTurn(state.turn), state),
      )
      if (allSquaresAvailable) {
        availableMoveList.push(
          makeMove(4, row, 6, row, "k", "castleShort", state),
        )
      }
    }
  }

  if (state.turn === "white") addCastlingMoves(0, state.whiteCanCastle)
  if (state.turn === "black") addCastlingMoves(7, state.blackCanCastle)

  availableMoveList = availableMoveList.filter((move) => {
    // Check if the move puts/leaves the king in check
    const testState = applyMoveToState(move, state)
    testState.turn = state.turn
    return !kingIsInCheck(testState)
  })

  if (availableMoveList.length === 0) {
    return kingIsInCheck(state) ? "checkmate" : "stalemate"
  }

  return availableMoveList
}
