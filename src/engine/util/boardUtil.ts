export function inbound(x: number, y: number) {
  return x >= 0 && x < 8 && y >= 0 && y < 8
}

export function findAllInBoard(board: Board, piece: string): Position[] {
  const positionArray: Position[] = []
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === piece) {
        positionArray.push({ x, y })
      }
    }
  }
  return positionArray
}

export function forEachInBoard(
  board: Board,
  callback: (piece: string, x: number, y: number) => unknown,
): void {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      let stop = callback(board[y][x], x, y)
      if (stop) return
    }
  }
}
