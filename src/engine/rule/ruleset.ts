import { EntityKind, Move } from "../../type";
import { move } from "../game/game";
import { State } from "../state/state";

export type MoveListResult = Move[] | "stalemate" | "checkmate"

const knightDeltaList: [number, number][] = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
]

const kingDeltaList: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

const towerDeltaList: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

const bishopDeltaList: [number, number][] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

const queenDeltaList = [
  ...towerDeltaList,
  ...bishopDeltaList,
]

export function takeValueOf(kind: string) {
  return {
    p: 1,
    r: 5,
    n: 3,
    b: 3,
    q: 9,
    k: Infinity,
  }[kind.toLowerCase()] ?? 0
}

export function getRawAvailableMoveList(state: State): MoveListResult {
  const isEnnemy = (square: string) => {
    return Number(square.toUpperCase() === square) !== state.turn
  }
  const inbound = (x: number, y:number) => {
    return x >= 0 && x < 8 && y >= 0 && y < 8
  }


  let availableMoveList: Move[] = []
  const addMoveForEntity = (e: string, x: number, y: number) => {
    // Handle piece walk, for rooks, bishops and queen(s)
    const handlePieceWalk = (kind: EntityKind) => ([dx, dy]: [number, number]) => {
      let nx = x
      let ny = y
      while (true) {
        nx += dx
        ny += dy
        if (!inbound(nx, ny)) {
          return
        }
        let square = state.board[y * 8 + x]
        if (square === "_") {
          availableMoveList.push(move(x, y, nx, ny, kind))
        } else if (isEnnemy(square)) {
          availableMoveList.push(move(x, y, nx, ny, kind, takeValueOf(square)))
          return
        } else {
          // the piece is an ally, we cannot take it
          return
        }
      }
    }

    // Handle piece jump, for knights and the king
    const handlePieceJump = (kind: EntityKind) => ([dx, dy]: [number, number]) => {
      const nx = x + dx
      const ny = y + dy
      const square = state.board[y * 8 + x]
      if (inbound(nx, ny) && (square === "_" || isEnnemy(square))) {
        availableMoveList.push(move(x, y, nx, ny, kind, takeValueOf(square)))
      }
    }

    // Find the given entity and add all the moves it can do to the
    // available move list.
    ;({
      p: () => {
        const dy = 1 - 2 * state.turn
        const ny = y + dy
        ;[-1, 0, 1].forEach((dx: number) => {
          const nx = x + dx
          const square = state.board[8 * ny + nx]
          if (dx === 0) {
            if (square === '_') {
              availableMoveList.push(move(x,y, nx, ny, 'p'))
            }
          } else{
            if (isEnnemy(square)) {
              availableMoveList.push(move(x, y, nx, ny, 'p', takeValueOf(square)))
            }
          }
        })
      },
      r: () => {
        towerDeltaList.forEach(handlePieceWalk('r'))
      },
      b: () => {
        bishopDeltaList.forEach(handlePieceWalk('b'))
      },
      q: () => {
        queenDeltaList.forEach(handlePieceWalk('q'))
      },
      n: () => {
        knightDeltaList.forEach(handlePieceJump('n'))
      },
      k: () => {
        kingDeltaList.forEach(handlePieceJump('k'))
      },
    })[e]!()
  }

  state.board.forEach((e, k) => {
    if (Number(e.match(/[A-Z]/)) === state.turn) {
      let x = k % 8
      let y = Math.floor(k / 8)
      addMoveForEntity(e.toLowerCase(), x, y)
    }
  })
  return availableMoveList
}

