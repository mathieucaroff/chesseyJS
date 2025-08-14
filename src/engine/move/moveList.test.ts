/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { getAvailableMoveList } from "./moveList"
import { initialState } from "../state/state"

const makeEmptyBoard = () =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "_"))

describe("Move List Module", () => {
  describe("getAvailableMoveList", () => {
    test("should return valid moves for initial position", () => {
      const state = initialState()
      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        expect(moves.length).toBe(20) // 16 pawn moves + 4 knight moves

        // Check pawn moves
        const pawnMoves = moves.filter((move) => move.kind === "p")
        expect(pawnMoves.length).toBe(16) // 8 single + 8 double pawn moves

        // Check knight moves
        const knightMoves = moves.filter((move) => move.kind === "n")
        expect(knightMoves.length).toBe(4) // Na3, Nc3, Nf3, Nh3
      }
    })

    test("should include long pawn moves from starting position", () => {
      const state = initialState()
      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        const longPawnMoves = moves.filter(
          (move) => move.special === "longPawnMove",
        )
        expect(longPawnMoves.length).toBe(8) // One for each pawn

        // Check specific long pawn move
        const e4Move = longPawnMoves.find(
          (move) => move.x === 4 && move.nx === 4 && move.ny === 3,
        )
        expect(e4Move).toBeDefined()
        if (e4Move) {
          expect(e4Move.special).toBe("longPawnMove")
          expect(e4Move.kind).toBe("p")
        }
      }
    })

    test("should handle en passant moves", () => {
      // Setup position with en passant possibility
      const board = makeEmptyBoard()
      board[0] = ["r", "n", "b", "q", "k", "b", "n", "r"]
      board[7] = ["R", "N", "B", "Q", "K", "B", "N", "R"]
      board[4][3] = "P" // Black pawn that just moved two squares
      board[4][4] = "p" // White pawn that can capture en passant

      const state: State = {
        board,
        turn: "white",
        enPassant: 3, // d-file
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        const enPassantMoves = moves.filter(
          (move) => move.special === "enPassant",
        )
        expect(enPassantMoves.length).toBe(1)

        const enPassantMove = enPassantMoves[0]
        expect(enPassantMove.x).toBe(4) // From e-file
        expect(enPassantMove.nx).toBe(3) // To d-file
        expect(enPassantMove.y).toBe(4) // From rank 5
        expect(enPassantMove.ny).toBe(5) // To rank 6
      }
    })

    test("should handle castling moves", () => {
      // Setup castling position
      const board = makeEmptyBoard()
      board[0] = ["r", "_", "_", "_", "k", "_", "_", "r"] // Clear path for castling
      board[7][4] = "K" // Black king (minimal setup)

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        const castleMoves = moves.filter(
          (move) =>
            move.special === "castleShort" || move.special === "castleLong",
        )
        expect(castleMoves.length).toBe(2) // Both short and long castling

        const shortCastle = castleMoves.find(
          (move) => move.special === "castleShort",
        )
        const longCastle = castleMoves.find(
          (move) => move.special === "castleLong",
        )

        expect(shortCastle).toBeDefined()
        expect(longCastle).toBeDefined()

        if (shortCastle) {
          expect(shortCastle.x).toBe(4) // King from e1
          expect(shortCastle.nx).toBe(6) // King to g1
        }

        if (longCastle) {
          expect(longCastle.x).toBe(4) // King from e1
          expect(longCastle.nx).toBe(2) // King to c1
        }
      }
    })

    test("should not allow castling through check", () => {
      // Setup position where castling path is under attack
      const board = makeEmptyBoard()
      board[0] = ["r", "_", "_", "_", "k", "_", "_", "r"]
      board[7][4] = "K" // Black king (minimal setup)
      board[1][5] = "R" // Black rook attacking f1 (short castle path) from f2

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        const shortCastleMoves = moves.filter(
          (move) => move.special === "castleShort",
        )
        expect(shortCastleMoves.length).toBe(0) // Should not allow short castling

        const longCastleMoves = moves.filter(
          (move) => move.special === "castleLong",
        )
        expect(longCastleMoves.length).toBe(1) // Long castling should still be possible
      }
    })

    test("should not allow moves that leave king in check", () => {
      // Setup position where moving a piece would expose the king
      const board = makeEmptyBoard()
      board[0][4] = "k" // White king
      board[0][3] = "b" // White bishop protecting king
      board[0][0] = "R" // Black rook that would attack king if bishop moves
      board[7][4] = "K" // Black king (required for valid position)

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        // Bishop should not be able to move away from protection duty
        const bishopMoves = moves.filter(
          (move) => move.x === 3 && move.y === 0 && move.kind === "b",
        )
        expect(bishopMoves.length).toBe(0)
      }
    })

    test("should return checkmate when no legal moves and king in check", () => {
      // Setup checkmate position (back rank mate)
      const board = makeEmptyBoard()
      board[0][4] = "k" // White king on e1
      board[1][4] = "p" // White pawn blocking king escape on e2
      board[1][3] = "p" // White pawn blocking king escape on d2
      board[1][5] = "p" // White pawn blocking king escape on f2
      board[0][0] = "R" // Black rook delivering checkmate on a1
      board[7][4] = "K" // Black king (required for valid position)

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const result = getAvailableMoveList(state, true)
      expect(result).toBe("checkmate")
    })

    test("should return stalemate when no legal moves and king not in check", () => {
      // Setup stalemate position
      const board = makeEmptyBoard()
      board[0][0] = "k" // White king in corner
      board[2][1] = "Q" // Black queen controlling escape squares
      board[2][0] = "K" // Black king preventing escape

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const result = getAvailableMoveList(state, true)
      expect(result).toBe("stalemate")
    })

    test("should handle pawn captures", () => {
      // Setup position with pawn capture opportunity
      const board = makeEmptyBoard()
      board[0] = ["r", "n", "b", "q", "k", "b", "n", "r"]
      board[7] = ["R", "N", "B", "Q", "K", "B", "N", "R"]
      board[3][4] = "p" // White pawn
      board[4][3] = "P" // Black pawn that can be captured
      board[4][5] = "P" // Black pawn that can be captured

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        const pawnCaptures = moves.filter(
          (move) =>
            move.x === 4 &&
            move.y === 3 &&
            move.kind === "p" &&
            (move.nx === 3 || move.nx === 5) &&
            move.ny === 4,
        )
        expect(pawnCaptures.length).toBe(2) // Can capture on both diagonals
      }
    })

    test("should handle piece blocking and capturing", () => {
      // Setup position with various pieces
      const board = makeEmptyBoard()
      board[0][0] = "r" // White rook
      board[0][3] = "P" // Black piece blocking
      board[0][7] = "R" // Black piece that can be captured
      board[7][4] = "K" // Black king
      board[4][0] = "k" // White king (required for valid position)

      const state: State = {
        board,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const moves = getAvailableMoveList(state, true)

      expect(Array.isArray(moves)).toBe(true)
      if (Array.isArray(moves)) {
        const rookMoves = moves.filter(
          (move) => move.x === 0 && move.y === 0 && move.kind === "r",
        )

        // Rook should be able to move to squares before the blocking piece
        const movesToSquare1 = rookMoves.filter((move) => move.nx === 1)
        const movesToSquare2 = rookMoves.filter((move) => move.nx === 2)
        const movesToSquare3 = rookMoves.filter((move) => move.nx === 3) // Capture
        const movesToSquare4 = rookMoves.filter((move) => move.nx === 4) // Should not exist

        expect(movesToSquare1.length).toBe(1)
        expect(movesToSquare2.length).toBe(1)
        expect(movesToSquare3.length).toBe(1) // Can capture
        expect(movesToSquare4.length).toBe(0) // Cannot move beyond capture
      }
    })
  })
})
