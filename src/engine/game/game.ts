import { EntityKind, GameHistory, Move } from "../../type";
import { State } from "../state/state";

export interface Game {
  history: GameHistory
  state: State
}

export type Turn = 0 | 1

export function createGame(history: GameHistory, state: State): Game {
  return {
    history,
    state
  }
}

export function move(ax: number, ay: number, bx: number, by: number, kind: EntityKind, takeValue = 0): Move {
  return { ax, ay, bx, by, kind, takeValue }
}