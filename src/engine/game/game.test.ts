/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { createGame, initialBoard } from "./game"

describe("Game Module", () => {
  describe("createGame", () => {
    test("should create a game with provided history and state", () => {
      const history: GameHistory = {
        movePairList: [],
      }
      const state: State = {
        board: initialBoard(),
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const game = createGame(history, state)

      expect(game).toEqual({
        history,
        state,
      })
      expect(game.history).toBe(history)
      expect(game.state).toBe(state)
    })

    test("should create a game with extra move in history", () => {
      const extraMove: Move = {
        x: 4,
        y: 1,
        nx: 4,
        ny: 3,
        kind: "p",
        special: "longPawnMove",
        notation: "e4",
      }
      const history: GameHistory = {
        movePairList: [],
        extraMove,
      }
      const state: State = {
        board: initialBoard(),
        turn: "black",
        enPassant: 4,
        whiteCanCastle: { long: true, short: true },
        blackCanCastle: { long: true, short: true },
      }

      const game = createGame(history, state)

      expect(game.history.extraMove).toBe(extraMove)
      expect(game.state.turn).toBe("black")
    })
  })

  describe("initialBoard", () => {
    test("should return the standard chess starting position", () => {
      const board = initialBoard()

      // Check board dimensions
      expect(board).toHaveLength(8)
      board.forEach((row) => expect(row).toHaveLength(8))

      // Check specific piece positions
      // Black pieces (rank 8)
      expect(board[7]).toEqual(["R", "N", "B", "Q", "K", "B", "N", "R"])

      // Black pawns (rank 7)
      expect(board[6]).toEqual(["P", "P", "P", "P", "P", "P", "P", "P"])

      // Empty ranks (ranks 6, 5, 4, 3)
      for (let i = 2; i <= 5; i++) {
        expect(board[i]).toEqual(["_", "_", "_", "_", "_", "_", "_", "_"])
      }

      // White pawns (rank 2)
      expect(board[1]).toEqual(["p", "p", "p", "p", "p", "p", "p", "p"])

      // White pieces (rank 1)
      expect(board[0]).toEqual(["r", "n", "b", "q", "k", "b", "n", "r"])
    })

    test("should return a new board instance each time", () => {
      const board1 = initialBoard()
      const board2 = initialBoard()

      expect(board1).toEqual(board2)
      expect(board1).not.toBe(board2)
      expect(board1[0]).not.toBe(board2[0])
    })

    test("should have correct piece case conventions", () => {
      const board = initialBoard()

      // White pieces should be lowercase
      board[0].forEach((piece) => {
        expect(piece).toBe(piece.toLowerCase())
      })
      board[1].forEach((piece) => {
        expect(piece).toBe(piece.toLowerCase())
      })

      // Black pieces should be uppercase
      board[6].forEach((piece) => {
        expect(piece).toBe(piece.toUpperCase())
      })
      board[7].forEach((piece) => {
        expect(piece).toBe(piece.toUpperCase())
      })

      // Empty squares should be underscore
      for (let i = 2; i <= 5; i++) {
        board[i].forEach((piece) => {
          expect(piece).toBe("_")
        })
      }
    })
  })
})
