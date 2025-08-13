/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { getLetter, getNotation } from "./notation"
import { initialBoard } from "../game/game"

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
      expect(notation).toBe("dxe5 e.p.")
    })

    test("should return correct notation for pawn promotion", () => {
      const move: Omit<Move, "notation"> = {
        x: 4,
        y: 6,
        nx: 4,
        ny: 7,
        kind: "q", // Promotion to queen
        special: "promotion",
      }

      const notation = getNotation(move, testState)
      expect(notation).toBe("e7=Q")
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
      expect(notation).toBe("e3")
    })

    test("should return empty string for regular moves (TODO)", () => {
      const move: Omit<Move, "notation"> = {
        x: 1,
        y: 0,
        nx: 2,
        ny: 2,
        kind: "n",
        special: "",
      }

      const notation = getNotation(move, testState)
      expect(notation).toBe("") // TODO: implement regular move notation
    })

    test("should handle promotion to different pieces", () => {
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

        const notation = getNotation(move, testState)
        expect(notation).toBe(`a7=${piece.toUpperCase()}`)
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
        expect(notation).toBe(`${expectedFrom}x${expectedTo}5 e.p.`)
      })
    })
  })
})
