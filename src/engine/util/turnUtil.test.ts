/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { applyTurnToCase, readCaseToTurn, oppositeTurn } from "./turnUtil"

describe("Turn Utilities", () => {
  describe("applyTurnToCase", () => {
    test("should return lowercase for white turn", () => {
      expect(applyTurnToCase("white", "K")).toBe("k")
      expect(applyTurnToCase("white", "Q")).toBe("q")
      expect(applyTurnToCase("white", "R")).toBe("r")
      expect(applyTurnToCase("white", "B")).toBe("b")
      expect(applyTurnToCase("white", "N")).toBe("n")
      expect(applyTurnToCase("white", "P")).toBe("p")
    })

    test("should return uppercase for black turn", () => {
      expect(applyTurnToCase("black", "k")).toBe("K")
      expect(applyTurnToCase("black", "q")).toBe("Q")
      expect(applyTurnToCase("black", "r")).toBe("R")
      expect(applyTurnToCase("black", "b")).toBe("B")
      expect(applyTurnToCase("black", "n")).toBe("N")
      expect(applyTurnToCase("black", "p")).toBe("P")
    })

    test("should handle already correct case", () => {
      expect(applyTurnToCase("white", "k")).toBe("k")
      expect(applyTurnToCase("white", "p")).toBe("p")
      expect(applyTurnToCase("black", "K")).toBe("K")
      expect(applyTurnToCase("black", "P")).toBe("P")
    })

    test("should handle special characters", () => {
      expect(applyTurnToCase("white", "_")).toBe("_")
      expect(applyTurnToCase("black", "_")).toBe("_")
      expect(applyTurnToCase("white", "1")).toBe("1")
      expect(applyTurnToCase("black", "1")).toBe("1")
    })
  })

  describe("readCaseToTurn", () => {
    test("should return white for lowercase letters", () => {
      expect(readCaseToTurn("k")).toBe("white")
      expect(readCaseToTurn("q")).toBe("white")
      expect(readCaseToTurn("r")).toBe("white")
      expect(readCaseToTurn("b")).toBe("white")
      expect(readCaseToTurn("n")).toBe("white")
      expect(readCaseToTurn("p")).toBe("white")
    })

    test("should return black for uppercase letters", () => {
      expect(readCaseToTurn("K")).toBe("black")
      expect(readCaseToTurn("Q")).toBe("black")
      expect(readCaseToTurn("R")).toBe("black")
      expect(readCaseToTurn("B")).toBe("black")
      expect(readCaseToTurn("N")).toBe("black")
      expect(readCaseToTurn("P")).toBe("black")
    })

    test("should handle non-alphabetic characters", () => {
      expect(readCaseToTurn("_")).toBe("white") // _ is same as lowercase
      expect(readCaseToTurn("1")).toBe("white")
      expect(readCaseToTurn("!")).toBe("white")
    })

    test("should be inverse of applyTurnToCase", () => {
      const letters = ["k", "q", "r", "b", "n", "p"]

      letters.forEach((letter) => {
        const whiteCase = applyTurnToCase("white", letter)
        const blackCase = applyTurnToCase("black", letter)

        expect(readCaseToTurn(whiteCase)).toBe("white")
        expect(readCaseToTurn(blackCase)).toBe("black")
      })
    })
  })

  describe("oppositeTurn", () => {
    test("should return opposite turn", () => {
      expect(oppositeTurn("white")).toBe("black")
      expect(oppositeTurn("black")).toBe("white")
    })

    test("should be its own inverse", () => {
      expect(oppositeTurn(oppositeTurn("white"))).toBe("white")
      expect(oppositeTurn(oppositeTurn("black"))).toBe("black")
    })
  })

  describe("Turn utilities integration", () => {
    test("should convert piece to correct case and read back correctly", () => {
      const originalPiece = "k"

      // Convert to white piece
      const whitePiece = applyTurnToCase("white", originalPiece)
      expect(whitePiece).toBe("k")
      expect(readCaseToTurn(whitePiece)).toBe("white")

      // Convert to black piece
      const blackPiece = applyTurnToCase("black", originalPiece)
      expect(blackPiece).toBe("K")
      expect(readCaseToTurn(blackPiece)).toBe("black")
    })

    test("should handle round-trip conversions", () => {
      const pieces = ["k", "q", "r", "b", "n", "p"]
      const turns: Turn[] = ["white", "black"]

      pieces.forEach((piece) => {
        turns.forEach((turn) => {
          const convertedPiece = applyTurnToCase(turn, piece)
          const readTurn = readCaseToTurn(convertedPiece)
          expect(readTurn).toBe(turn)
        })
      })
    })
  })
})
