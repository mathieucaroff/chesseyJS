export function createGame(history: GameHistory, state: State): Game {
  return {
    history,
    state,
  }
}

/**
 * Lower case letters are white pieces, upper case letters are black pieces.
 * @returns The chess board in its initial state.
 */
export function initialBoard(): Board {
  return [
    [..."rnbqkbnr"],
    [..."pppppppp"],
    [..."________"],
    [..."________"],
    [..."________"],
    [..."________"],
    [..."PPPPPPPP"],
    [..."RNBQKBNR"],
  ]
}
