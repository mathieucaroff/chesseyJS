declare global {
  interface Game {
    history: GameHistory
    state: State
  }

  interface GameHistory {
    movePairList: MovePairList
    // The extra move is a move made by White which awaits the move from
    // black before it is added to the move pair list.
    extraMove?: Move
  }

  type MovePairList = [Move, Move][]

  interface Move {
    /** Origin X position of the piece being move */
    x: number
    /** Origin Y position of the piece being move */
    y: number
    /** Destination X position of the piece being move */
    nx: number
    /** Destination Y position of the piece being move */
    ny: number
    /** Kind of the piece being moved. If a pawn promotes, this is the kind of
     * the piece it promotes to. */
    kind: EntityKind
    special: SpecialMoveName
    notation: string
  }

  type EntityKind = "p" | "r" | "n" | "b" | "q" | "k"

  type SpecialMoveName =
    | ""
    | "enPassant"
    | "castleShort"
    | "castleLong"
    | "promotion"
    | "longPawnMove"

  interface State {
    // A list of the pieces each sitting on one of the 64 squares of the board
    board: string[]
    // Which player's turn is it (0 = white, 1 = black)
    turn: Turn
    // 0-7 index of the column of the pawn which just advanced two squares, if any.
    // -1 otherwise
    enPassant: number
    // Castle possibilites
    whiteCanCastle: Castle
    blackCanCastle: Castle
  }

  type Turn = "white" | "black"

  interface Castle {
    long: boolean
    short: boolean
  }

  type MoveOptionList = Move[] | "stalemate" | "checkmate"

  interface PieceMovementRule {
    repeat: boolean
    deltaList: [number, number][]
  }
}

// This empty export statement is required to make this file a module
// which allows the global declarations to work properly
export {}
