/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { inbound, findAllInBoard, forEachInBoard } from "./boardUtil"

describe("Board Utilities", () => {
  describe("inbound", () => {
    test("should return true for valid coordinates", () => {
      expect(inbound(0, 0)).toBe(true)
      expect(inbound(7, 7)).toBe(true)
      expect(inbound(3, 4)).toBe(true)
      expect(inbound(0, 7)).toBe(true)
      expect(inbound(7, 0)).toBe(true)
    })

    test("should return false for coordinates outside the board", () => {
      expect(inbound(-1, 0)).toBe(false)
      expect(inbound(0, -1)).toBe(false)
      expect(inbound(8, 0)).toBe(false)
      expect(inbound(0, 8)).toBe(false)
      expect(inbound(-1, -1)).toBe(false)
      expect(inbound(8, 8)).toBe(false)
      expect(inbound(10, 5)).toBe(false)
      expect(inbound(5, 10)).toBe(false)
    })

    test("should handle edge cases", () => {
      expect(inbound(7.5, 7.5)).toBe(true) // Decimal coordinates
      expect(inbound(0.1, 0.1)).toBe(true)
      expect(inbound(7.9, 7.9)).toBe(true)
    })
  })

  describe("findAllInBoard", () => {
    const testBoard: Board = [
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      ["_", "_", "_", "_", "_", "_", "_", "_"],
      ["_", "_", "_", "_", "_", "_", "_", "_"],
      ["_", "_", "_", "_", "k", "_", "_", "_"],
      ["_", "_", "_", "_", "_", "_", "_", "_"],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ]

    test("should find all instances of a piece", () => {
      const whitePawns = findAllInBoard(testBoard, "p")
      expect(whitePawns).toEqual([
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
        { x: 6, y: 1 },
        { x: 7, y: 1 },
      ])

      const blackPawns = findAllInBoard(testBoard, "P")
      expect(blackPawns).toEqual([
        { x: 0, y: 6 },
        { x: 1, y: 6 },
        { x: 2, y: 6 },
        { x: 3, y: 6 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 7, y: 6 },
      ])
    })

    test("should find unique pieces", () => {
      const whiteKings = findAllInBoard(testBoard, "k")
      expect(whiteKings).toEqual([
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ])

      const blackKings = findAllInBoard(testBoard, "K")
      expect(blackKings).toHaveLength(1)
      expect(blackKings).toEqual([{ x: 4, y: 7 }])
    })

    test("should return empty array for non-existent pieces", () => {
      const result = findAllInBoard(testBoard, "z")
      expect(result).toEqual([])
    })

    test("should find empty squares", () => {
      const emptySquares = findAllInBoard(testBoard, "_")
      expect(emptySquares).toHaveLength(8 * 4 - 1) // 4 empty ranks minus 1 king
    })
  })

  describe("forEachInBoard", () => {
    const testBoard: Board = [
      ["r", "n", "_"],
      ["p", "_", "P"],
      ["_", "K", "_"],
    ]

    test("should call callback for each square", () => {
      const visited: Array<{ piece: string; x: number; y: number }> = []

      forEachInBoard(testBoard, (piece, x, y) => {
        visited.push({ piece, x, y })
      })

      expect(visited).toHaveLength(9)
      expect(visited).toEqual([
        { piece: "r", x: 0, y: 0 },
        { piece: "n", x: 1, y: 0 },
        { piece: "_", x: 2, y: 0 },
        { piece: "p", x: 0, y: 1 },
        { piece: "_", x: 1, y: 1 },
        { piece: "P", x: 2, y: 1 },
        { piece: "_", x: 0, y: 2 },
        { piece: "K", x: 1, y: 2 },
        { piece: "_", x: 2, y: 2 },
      ])
    })

    test("should stop iteration when callback returns truthy value", () => {
      const visited: Array<{ piece: string; x: number; y: number }> = []

      forEachInBoard(testBoard, (piece, x, y) => {
        visited.push({ piece, x, y })
        if (piece === "n") {
          return true // Stop here
        }
      })

      expect(visited).toHaveLength(2)
      expect(visited).toEqual([
        { piece: "r", x: 0, y: 0 },
        { piece: "n", x: 1, y: 0 },
      ])
    })

    test("should continue iteration when callback returns falsy value", () => {
      const nonEmptyPieces: Array<{ piece: string; x: number; y: number }> = []

      forEachInBoard(testBoard, (piece, x, y) => {
        if (piece !== "_") {
          nonEmptyPieces.push({ piece, x, y })
        }
        return false // Continue
      })

      expect(nonEmptyPieces).toEqual([
        { piece: "r", x: 0, y: 0 },
        { piece: "n", x: 1, y: 0 },
        { piece: "p", x: 0, y: 1 },
        { piece: "P", x: 2, y: 1 },
        { piece: "K", x: 1, y: 2 },
      ])
    })
  })
})
