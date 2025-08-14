/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { initialState, applyMoveToState, kingIsInCheck } from "./state"
import { initialBoard } from "../game/game"

const makeEmptyBoard = () =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "_"))

describe("State Module", () => {
  describe("initialState", () => {
    test("should return correct initial chess state", () => {
      const state = initialState()

      expect(state.board).toEqual(initialBoard())
      expect(state.turn).toBe("white")
      expect(state.enPassant).toBe(-1)
      expect(state.whiteCanCastle).toEqual({ long: true, short: true })
      expect(state.blackCanCastle).toEqual({ long: true, short: true })
    })

    test("should return new instance each time", () => {
      const state1 = initialState()
      const state2 = initialState()

      expect(state1).toEqual(state2)
      expect(state1).not.toBe(state2)
      expect(state1.board).not.toBe(state2.board)
    })
  })

  describe("applyMoveToState", () => {
    test("should apply basic piece move", () => {
      const state = initialState()
      const move: Move = {
        x: 4,
        y: 1,
        nx: 4,
        ny: 3,
        kind: "p",
        special: "",
        notation: "e4",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.board[1][4]).toBe("_") // Original position empty
      expect(newState.board[3][4]).toBe("p") // New position has piece
      expect(newState.turn).toBe("black") // Turn changed
      expect(newState.enPassant).toBe(-1) // No en passant
    })

    test("should handle long pawn move and set en passant", () => {
      const state = initialState()
      const move: Move = {
        x: 4,
        y: 1,
        nx: 4,
        ny: 3,
        kind: "p",
        special: "longPawnMove",
        notation: "e4",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.enPassant).toBe(4) // En passant column set
      expect(newState.turn).toBe("black")
    })

    test("should handle en passant capture", () => {
      // Setup state with en passant possibility
      const board = initialBoard()
      board[4][3] = "P" // Black pawn that moved two squares
      board[4][4] = "p" // White pawn ready to capture
      board[6][3] = "_" // Remove original black pawn

      const state: State = {
        board,
        turn: "white",
        enPassant: 3, // En passant on d-file
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const move: Move = {
        x: 4,
        y: 4,
        nx: 3,
        ny: 5,
        kind: "p",
        special: "enPassant",
        notation: "exd6",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.board[4][4]).toBe("_") // Original pawn position empty
      expect(newState.board[5][3]).toBe("p") // Pawn moved to capture square
      expect(newState.board[4][3]).toBe("_") // Captured pawn removed
      expect(newState.enPassant).toBe(-1) // En passant cleared
    })

    test("should handle short castling", () => {
      // Setup castling position
      const board = initialBoard()
      board[0][5] = "_" // Remove bishop
      board[0][6] = "_" // Remove knight

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const move: Move = {
        x: 4,
        y: 0,
        nx: 6,
        ny: 0,
        kind: "k",
        special: "castleShort",
        notation: "O-O",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.board[0][4]).toBe("_") // King original position empty
      expect(newState.board[0][6]).toBe("k") // King moved to g1
      expect(newState.board[0][7]).toBe("_") // Rook original position empty
      expect(newState.board[0][5]).toBe("r") // Rook moved to f1
      expect(newState.whiteCanCastle).toEqual({ long: false, short: false })
    })

    test("should handle long castling", () => {
      // Setup castling position
      const board = initialBoard()
      board[0][1] = "_" // Remove knight
      board[0][2] = "_" // Remove bishop
      board[0][3] = "_" // Remove queen

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const move: Move = {
        x: 4,
        y: 0,
        nx: 2,
        ny: 0,
        kind: "k",
        special: "castleLong",
        notation: "O-O-O",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.board[0][4]).toBe("_") // King original position empty
      expect(newState.board[0][2]).toBe("k") // King moved to c1
      expect(newState.board[0][0]).toBe("_") // Rook original position empty
      expect(newState.board[0][3]).toBe("r") // Rook moved to d1
      expect(newState.whiteCanCastle).toEqual({ long: false, short: false })
    })

    test("should handle pawn promotion", () => {
      // Setup promotion position
      const board = makeEmptyBoard()
      board[6][4] = "p" // White pawn ready to promote

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const move: Move = {
        x: 4,
        y: 6,
        nx: 4,
        ny: 7,
        kind: "q", // Promote to queen
        special: "promotion",
        notation: "e8=Q",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.board[6][4]).toBe("_") // Original position empty
      expect(newState.board[7][4]).toBe("q") // Promoted to queen (white piece is lowercase)
    })

    test("should update castling rights when king moves", () => {
      const state = initialState()
      const move: Move = {
        x: 4,
        y: 0,
        nx: 4,
        ny: 1,
        kind: "k",
        special: "",
        notation: "Ke2",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.whiteCanCastle).toEqual({ long: false, short: false })
      expect(newState.blackCanCastle).toEqual({ long: true, short: true })
    })

    test("should update castling rights when rook moves", () => {
      const state = initialState()

      // Move white queenside rook
      const move: Move = {
        x: 0,
        y: 0,
        nx: 0,
        ny: 1,
        kind: "r",
        special: "",
        notation: "Ra2",
      }

      const newState = applyMoveToState(move, state)

      expect(newState.whiteCanCastle).toEqual({ long: false, short: true })
      expect(newState.blackCanCastle).toEqual({ long: true, short: true })
    })

    test("should preserve original state immutability", () => {
      const state = initialState()
      const originalBoard = state.board.map((row) => [...row])

      const move: Move = {
        x: 4,
        y: 1,
        nx: 4,
        ny: 3,
        kind: "p",
        special: "",
        notation: "e4",
      }

      applyMoveToState(move, state)

      // Original state should be unchanged
      expect(state.board).toEqual(originalBoard)
      expect(state.turn).toBe("white")
    })
  })

  describe("kingIsInCheck", () => {
    test("should return false for initial position", () => {
      const state = initialState()
      expect(kingIsInCheck(state)).toBe(false)
    })

    test("should detect check from queen", () => {
      const board = makeEmptyBoard()
      board[0][4] = "k" // White king
      board[7][4] = "Q" // Black queen attacking king

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(kingIsInCheck(state)).toBe(true)
    })

    test("should detect check from rook", () => {
      const board = makeEmptyBoard()
      board[0][4] = "k" // White king
      board[0][0] = "R" // Black rook attacking king horizontally

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(kingIsInCheck(state)).toBe(true)
    })

    test("should detect check from bishop", () => {
      const board = makeEmptyBoard()
      board[0][4] = "k" // White king
      board[2][2] = "B" // Black bishop attacking king diagonally

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(kingIsInCheck(state)).toBe(true)
    })

    test("should detect check from knight", () => {
      const board = makeEmptyBoard()
      board[4][4] = "k" // White king
      board[2][3] = "N" // Black knight attacking king

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(kingIsInCheck(state)).toBe(true)
    })

    test("should detect check from black pawn", () => {
      const board = makeEmptyBoard()
      board[4][4] = "k" // White king at e5
      board[5][5] = "P" // Black pawn at f6 attacking king diagonally

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(kingIsInCheck(state)).toBe(true)
    })

    test("should detect check from white pawn", () => {
      const board = makeEmptyBoard()
      board[4][4] = "K" // Black king at e5
      board[3][3] = "p" // White pawn at d4 attacking king diagonally

      const state: State = {
        board,
        turn: "black",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(kingIsInCheck(state)).toBe(true)
    })

    test("should not detect check when blocked", () => {
      const board = makeEmptyBoard()
      board[0][4] = "k" // White king
      board[0][2] = "p" // White piece blocking
      board[0][0] = "R" // Black rook (blocked)

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(kingIsInCheck(state)).toBe(false)
    })

    test("should throw error if multiple kings found", () => {
      const board = makeEmptyBoard()
      board[0][4] = "k" // First white king
      board[1][4] = "k" // Second white king (invalid)

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(() => kingIsInCheck(state)).toThrow("Found 2 king(s) k on board")
    })

    test("should throw error if no king found", () => {
      const board = makeEmptyBoard()
      // No king on board

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      expect(() => kingIsInCheck(state)).toThrow("Found 0 king(s) k on board")
    })
  })
})
