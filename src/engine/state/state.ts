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
  const kingPosition = state.board.findIndex((e) => e === kingLetter)
  // TODO
  return false
}
