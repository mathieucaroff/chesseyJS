/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { getLetter, getNotation } from "./notation"
import { initialBoard } from "../game/game"

const makeEmptyBoard = () =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "_"))

describe("Notation Module", () => {
  describe("getLetter", () => {
    test("should return correct letters for column indices", () => {
      expect(getLetter(0)).toBe("a")
      expect(getLetter(1)).toBe("b")
      expect(getLetter(2)).toBe("c")
      expect(getLetter(3)).toBe("d")
      expect(getLetter(4)).toBe("e")
      expect(getLetter(5)).toBe("f")
      expect(getLetter(6)).toBe("g")
      expect(getLetter(7)).toBe("h")
    })

    test("should handle edge cases", () => {
      expect(getLetter(-1)).toBe("`") // ASCII char before 'a'
      expect(getLetter(8)).toBe("i")
      expect(getLetter(25)).toBe("z")
    })
  })

  describe("getNotation", () => {
    const testState: State = {
      board: initialBoard(),
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    test("should return correct notation for short castling", () => {
      const move: Omit<Move, "notation"> = {
        x: 4,
        y: 0,
        nx: 6,
        ny: 0,
        kind: "k",
        special: "castleShort",
      }

      const notation = getNotation(move, testState)
      expect(notation).toBe("O-O")
    })

    test("should return correct notation for long castling", () => {
      const move: Omit<Move, "notation"> = {
        x: 4,
        y: 0,
        nx: 2,
        ny: 0,
        kind: "k",
        special: "castleLong",
      }

      const notation = getNotation(move, testState)
      expect(notation).toBe("O-O-O")
    })

    test("should return correct notation for en passant", () => {
      const move: Omit<Move, "notation"> = {
        x: 3,
        y: 4,
        nx: 4,
        ny: 5,
        kind: "p",
        special: "enPassant",
      }

      const notation = getNotation(move, testState)
      expect(notation).toBe("dxe6")
    })

    test("should return correct notation for pawn promotion", () => {
      // Create empty board for non-capture promotion test
      const emptyBoard = makeEmptyBoard()

      const state: State = {
        board: emptyBoard,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const move: Omit<Move, "notation"> = {
        x: 4,
        y: 6,
        nx: 4,
        ny: 7,
        kind: "q", // Promotion to queen
        special: "promotion",
      }

      const notation = getNotation(move, state)
      expect(notation).toBe("e8=Q")
    })

    test("should return correct notation for long pawn move", () => {
      const move: Omit<Move, "notation"> = {
        x: 4,
        y: 1,
        nx: 4,
        ny: 3,
        kind: "p",
        special: "longPawnMove",
      }

      const notation = getNotation(move, testState)
      expect(notation).toBe("e4")
    })

    test("should handle move disambiguation when multiple pieces can reach the same square", () => {
      const emptyBoard = makeEmptyBoard()
      emptyBoard[0][1] = "n" // White knight at b1
      emptyBoard[0][3] = "n" // White knight at d1
      emptyBoard[4][4] = "k" // White king at e5

      const state: State = {
        board: emptyBoard,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      // Both knights can reach c3: b1->c3 (delta 1,2) and d1->c3 (delta -1,2)
      const knightMove: Omit<Move, "notation"> = {
        x: 1,
        y: 0,
        nx: 2,
        ny: 2,
        kind: "n",
        special: "",
      }

      const notation = getNotation(knightMove, state)
      expect(notation).toBe("Nbc3") // Should disambiguate by file
    })

    test("should handle captures with correct notation", () => {
      const emptyBoard = makeEmptyBoard()
      emptyBoard[2][2] = "n" // White knight at c3
      emptyBoard[3][4] = "P" // Black piece at e4 to capture
      emptyBoard[4][4] = "k" // White king at e5

      const state: State = {
        board: emptyBoard,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const captureMove: Omit<Move, "notation"> = {
        x: 2,
        y: 2,
        nx: 4,
        ny: 3,
        kind: "n",
        special: "",
      }

      const notation = getNotation(captureMove, state)
      expect(notation).toBe("Nxe4")
    })

    test("should handle pawn captures", () => {
      const emptyBoard = makeEmptyBoard()
      emptyBoard[3][4] = "p" // White pawn at e4
      emptyBoard[4][3] = "P" // Black piece at d5 to capture
      emptyBoard[0][0] = "k" // White king at a1

      const state: State = {
        board: emptyBoard,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const pawnCapture: Omit<Move, "notation"> = {
        x: 4,
        y: 3,
        nx: 3,
        ny: 4,
        kind: "p",
        special: "",
      }

      const notation = getNotation(pawnCapture, state)
      expect(notation).toBe("exd5")
    })

    test("should handle regular pawn moves", () => {
      const emptyBoard = makeEmptyBoard()
      emptyBoard[3][4] = "p" // White pawn at e4
      emptyBoard[0][0] = "k" // White king at a1

      const state: State = {
        board: emptyBoard,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const pawnMove: Omit<Move, "notation"> = {
        x: 4,
        y: 3,
        nx: 4,
        ny: 4,
        kind: "p",
        special: "",
      }

      const notation = getNotation(pawnMove, state)
      expect(notation).toBe("e5")
    })

    test("should add check notation when move gives check", () => {
      const emptyBoard = makeEmptyBoard()
      emptyBoard[0][0] = "k" // White king at a1
      emptyBoard[7][4] = "K" // Black king at e8
      emptyBoard[6][0] = "r" // White rook at a7

      const state: State = {
        board: emptyBoard,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const checkMove: Omit<Move, "notation"> = {
        x: 0,
        y: 6,
        nx: 4,
        ny: 6,
        kind: "r",
        special: "",
      }

      const notation = getNotation(checkMove, state)
      expect(notation).toBe("Re7+") // Should add + for check
    })

    test("should return correct notation for regular knight move", () => {
      const move: Omit<Move, "notation"> = {
        x: 1,
        y: 0,
        nx: 2,
        ny: 2,
        kind: "n",
        special: "",
      }

      const notation = getNotation(move, testState)
      expect(notation).toBe("Nc3")
    })

    test("should handle promotion to different pieces", () => {
      // Create empty board for non-capture promotion test
      const emptyBoard = makeEmptyBoard()

      const state: State = {
        board: emptyBoard,
        turn: "white",
        enPassant: -1,
        whiteCanCastle: { long: false, short: false },
        blackCanCastle: { long: false, short: false },
      }

      const pieces: EntityKind[] = ["q", "r", "b", "n"]

      pieces.forEach((piece) => {
        const move: Omit<Move, "notation"> = {
          x: 0,
          y: 6,
          nx: 0,
          ny: 7,
          kind: piece,
          special: "promotion",
        }

        const notation = getNotation(move, state)
        expect(notation).toBe(`a8=${piece.toUpperCase()}`)
      })
    })

    test("should handle en passant from different files", () => {
      const files = [0, 1, 2, 3, 4, 5, 6, 7]

      files.forEach((file) => {
        const move: Omit<Move, "notation"> = {
          x: file,
          y: 4,
          nx: (file + 1) % 8,
          ny: 5,
          kind: "p",
          special: "enPassant",
        }

        const notation = getNotation(move, testState)
        const expectedFrom = getLetter(file)
        const expectedTo = getLetter((file + 1) % 8)
        expect(notation).toBe(`${expectedFrom}x${expectedTo}6`)
      })
    })
  })
})
