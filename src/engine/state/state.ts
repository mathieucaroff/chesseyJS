import { Turn } from "../game/game"

export interface Castle {
    long: boolean
    short: boolean
}

export interface State {
    // A list of the pieces each sitting on one of the 64 squares of the board
    board: string[]
    // Which player's turn is it
    turn: Turn
    // Letter of the column of the pawn which just advanced two squares, if any.
    // Otherwise it is the empty string
    enPassant: string
    // Castle possibilites
    whiteCanCastle: Castle
    blackCanCastle: Castle
}

export function initialBoard() {
  return [
    ...'rnbqkbnr',
    ...'pppppppp',
    ...'________',
    ...'________',
    ...'________',
    ...'________',
    ...'PPPPPPPP',
    ...'RNBQKBNR',
  ]
}

export function initialState(): State {
  return {
    board: initialBoard(),
    turn: 0,
    enPassant: '',
    whiteCanCastle: { long: true, short: true },
    blackCanCastle: { long: true, short: true },
  }
}
