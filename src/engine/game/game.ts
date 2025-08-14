/** Creates a new game instance from the provided history and state */
export function createGame(history: GameHistory, state: State): Game {
  return {
    history,
    state,
  }
}

/**
 * Lower case letters are white pieces, upper case letters are black pieces.
 * Row 0 is white's home rank, row 7 is black's home rank.
 * @returns The chess board in its initial state.
 */
export function initialBoard(): Board {
  return [
    [..."rnbqkbnr"], // Row 0: White pieces (lowercase) on rank 1
    [..."pppppppp"], // Row 1: White pawns (lowercase) on rank 2
    [..."________"], // Row 2: Empty rank 3
    [..."________"], // Row 3: Empty rank 4
    [..."________"], // Row 4: Empty rank 5
    [..."________"], // Row 5: Empty rank 6
    [..."PPPPPPPP"], // Row 6: Black pawns (uppercase) on rank 7
    [..."RNBQKBNR"], // Row 7: Black pieces (uppercase) on rank 8
  ]
}
