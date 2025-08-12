import { initialBoard } from "../game/game"

export function initialState(): State {
  return {
    board: initialBoard(),
    turn: "white",
    enPassant: -1,
    whiteCanCastle: { long: true, short: true },
    blackCanCastle: { long: true, short: true },
  }
}

export function kingIsInCheck(state: State): boolean {
  // Find the king's position
  const kingLetter = state.turn === "white" ? "K" : "k"
  // Search through the 2D board array
  let kingPosition = { x: -1, y: -1 }
  for (let y = 0; y < state.board.length; y++) {
    for (let x = 0; x < state.board[y].length; x++) {
      if (state.board[y][x] === kingLetter) {
        kingPosition = { x, y }
        break
      }
    }
    if (kingPosition.x !== -1) break
  }
  // TODO
  return false
}
