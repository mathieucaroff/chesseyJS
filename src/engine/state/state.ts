import { initialBoard } from "../game/game"
import { canPieceAttackSquare, isUnderAttack } from "../rule/ruleset"
import { findAllInBoard, forEachInBoard } from "../util/boardUtil"
import { oppositeTurn, readCaseToTurn } from "../util/turnUtil"

export function initialState(): State {
  return {
    board: initialBoard(),
    turn: "white",
    enPassant: -1,
    whiteCanCastle: { long: true, short: true },
    blackCanCastle: { long: true, short: true },
  }
}

export function applyMoveToState(move: Move, state: State): State {
  // Create a deep copy of the board
  const newBoard: Board = state.board.map((row) => [...row])

  // Apply the basic move
  const piece = newBoard[move.y][move.x]
  newBoard[move.ny][move.nx] = piece
  newBoard[move.y][move.x] = "_"

  // Handle special moves
  let newEnPassant = -1
  let newWhiteCanCastle = { ...state.whiteCanCastle }
  let newBlackCanCastle = { ...state.blackCanCastle }

  switch (move.special) {
    case "enPassant":
      // Remove the captured pawn
      const capturedPawnY = state.turn === "white" ? 4 : 3
      newBoard[capturedPawnY][move.nx] = "_"
      break

    case "castleShort":
    case "castleLong":
      // Move the rook
      const rookX = move.special === "castleShort" ? 7 : 0
      const newRookX = move.special === "castleShort" ? 5 : 3
      const rookY = move.y
      newBoard[rookY][newRookX] = newBoard[rookY][rookX]
      newBoard[rookY][rookX] = "_"

      // Update castling rights
      if (state.turn === "white") {
        newWhiteCanCastle = { long: false, short: false }
      } else {
        newBlackCanCastle = { long: false, short: false }
      }
      break

    case "longPawnMove":
      // Set en passant square
      newEnPassant = move.nx
      break

    case "promotion":
      // The piece is already set to the promotion piece in move.kind
      newBoard[move.ny][move.nx] =
        state.turn === "white"
          ? move.kind.toLowerCase() // White pieces are lowercase
          : move.kind.toUpperCase() // Black pieces are uppercase
      break
  }

  // Update castling rights if king or rook moved
  if (move.kind === "k") {
    if (state.turn === "white") {
      newWhiteCanCastle = { long: false, short: false }
    } else {
      newBlackCanCastle = { long: false, short: false }
    }
  } else if (move.kind === "r") {
    if (state.turn === "white") {
      if (move.x === 0 && move.y === 0) newWhiteCanCastle.long = false
      if (move.x === 7 && move.y === 0) newWhiteCanCastle.short = false
    } else {
      if (move.x === 0 && move.y === 7) newBlackCanCastle.long = false
      if (move.x === 7 && move.y === 7) newBlackCanCastle.short = false
    }
  }

  return {
    board: newBoard,
    turn: state.turn === "white" ? "black" : "white",
    enPassant: newEnPassant,
    whiteCanCastle: newWhiteCanCastle,
    blackCanCastle: newBlackCanCastle,
  }
}

export function kingIsInCheck(state: State): boolean {
  // Find the king's position - look for the king of the current player
  const kingLetter = state.turn === "white" ? "k" : "K"
  let kingPositionArray = findAllInBoard(state.board, kingLetter)
  if (kingPositionArray.length !== 1) {
    throw new Error(
      `Found ${kingPositionArray.length} king(s) ${kingLetter} on board`,
    )
  }

  const { x: kx, y: ky } = kingPositionArray[0]

  // Check if any opponent piece can reach the king's position
  return isUnderAttack(kx, ky, oppositeTurn(state.turn), state)
}
