/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import { movementRuleRecord, canPieceAttackSquare } from "./ruleset"
import { initialBoard } from "../game/game"

describe("Ruleset Module", () => {
  describe("movementRuleRecord", () => {
    test("should have rules for all piece types", () => {
      expect(movementRuleRecord.p).toBe("pawn")
      expect(movementRuleRecord.n).toBeDefined()
      expect(movementRuleRecord.b).toBeDefined()
      expect(movementRuleRecord.r).toBeDefined()
      expect(movementRuleRecord.q).toBeDefined()
      expect(movementRuleRecord.k).toBeDefined()
    })

    test("should have correct movement patterns for knight", () => {
      const knightRule = movementRuleRecord.n as PieceMovementRule
      expect(knightRule.repeat).toBe(false)
      expect(knightRule.deltaList).toHaveLength(4)

      // Knight should have L-shaped moves
      const expectedDeltas = [
        [2, 1],
        [2, -1],
        [1, 2],
        [1, -2],
      ]
      expect(knightRule.deltaList).toEqual(expectedDeltas)
    })

    test("should have correct movement patterns for bishop", () => {
      const bishopRule = movementRuleRecord.b as PieceMovementRule
      expect(bishopRule.repeat).toBe(true)
      expect(bishopRule.deltaList).toEqual([
        [1, 1],
        [1, -1],
      ])
    })

    test("should have correct movement patterns for rook", () => {
      const rookRule = movementRuleRecord.r as PieceMovementRule
      expect(rookRule.repeat).toBe(true)
      expect(rookRule.deltaList).toEqual([
        [0, 1],
        [1, 0],
      ])
    })

    test("should have correct movement patterns for queen", () => {
      const queenRule = movementRuleRecord.q as PieceMovementRule
      const bishopRule = movementRuleRecord.b as PieceMovementRule
      const rookRule = movementRuleRecord.r as PieceMovementRule

      expect(queenRule.repeat).toBe(true)
      expect(queenRule.deltaList).toEqual([
        ...bishopRule.deltaList,
        ...rookRule.deltaList,
      ])
    })

    test("should have correct movement patterns for king", () => {
      const kingRule = movementRuleRecord.k as PieceMovementRule
      const queenRule = movementRuleRecord.q as PieceMovementRule

      expect(kingRule.repeat).toBe(false)
      expect(kingRule.deltaList).toEqual(queenRule.deltaList)
    })
  })

  describe("canPieceAttackSquare", () => {
    const testState: State = {
      board: initialBoard(),
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    describe("pawn attacks", () => {
      test("should detect white pawn attacks", () => {
        const state: State = { ...testState, turn: "white" }

        // White pawn at e4 can attack d5 and f5
        expect(canPieceAttackSquare(4, 3, 3, 4, "p", state)).toBe(true) // e4 attacks d5
        expect(canPieceAttackSquare(4, 3, 5, 4, "p", state)).toBe(true) // e4 attacks f5
        expect(canPieceAttackSquare(4, 3, 4, 4, "p", state)).toBe(false) // e4 doesn't attack e5
        expect(canPieceAttackSquare(4, 3, 3, 3, "p", state)).toBe(false) // e4 doesn't attack d4
      })

      test("should detect black pawn attacks", () => {
        const state: State = { ...testState, turn: "black" }

        // Black pawn at e5 can attack d4 and f4
        expect(canPieceAttackSquare(4, 4, 3, 3, "p", state)).toBe(true) // e5 attacks d4
        expect(canPieceAttackSquare(4, 4, 5, 3, "p", state)).toBe(true) // e5 attacks f4
        expect(canPieceAttackSquare(4, 4, 4, 3, "p", state)).toBe(false) // e5 doesn't attack e4
        expect(canPieceAttackSquare(4, 4, 3, 4, "p", state)).toBe(false) // e5 doesn't attack d5
      })
    })

    describe("knight attacks", () => {
      test("should detect knight attacks", () => {
        const emptyBoard = Array(8)
          .fill(null)
          .map(() => Array(8).fill("_"))
        const state = { ...testState, board: emptyBoard }

        // Knight at e4 attacks specific squares
        const knightSquares = [
          [6, 5],
          [6, 3],
          [5, 6],
          [5, 2], // 2,1 and 2,-1 and 1,2 and 1,-2
          [2, 5],
          [2, 3],
          [3, 6],
          [3, 2], // -2,1 and -2,-1 and -1,2 and -1,-2
        ]

        knightSquares.forEach(([x, y]) => {
          expect(canPieceAttackSquare(4, 4, x, y, "n", state)).toBe(true)
        })

        // Knight shouldn't attack adjacent squares
        expect(canPieceAttackSquare(4, 4, 3, 4, "n", state)).toBe(false)
        expect(canPieceAttackSquare(4, 4, 5, 4, "n", state)).toBe(false)
        expect(canPieceAttackSquare(4, 4, 4, 3, "n", state)).toBe(false)
        expect(canPieceAttackSquare(4, 4, 4, 5, "n", state)).toBe(false)
      })
    })

    describe("bishop attacks", () => {
      test("should detect diagonal attacks", () => {
        const emptyBoard = Array(8)
          .fill(null)
          .map(() => Array(8).fill("_"))
        const state = { ...testState, board: emptyBoard }

        // Bishop at d4 can attack diagonally
        expect(canPieceAttackSquare(3, 3, 0, 0, "b", state)).toBe(true) // a1
        expect(canPieceAttackSquare(3, 3, 6, 6, "b", state)).toBe(true) // g7
        expect(canPieceAttackSquare(3, 3, 0, 6, "b", state)).toBe(true) // a7
        expect(canPieceAttackSquare(3, 3, 6, 0, "b", state)).toBe(true) // g1

        // Bishop shouldn't attack orthogonally
        expect(canPieceAttackSquare(3, 3, 3, 0, "b", state)).toBe(false) // d1
        expect(canPieceAttackSquare(3, 3, 0, 3, "b", state)).toBe(false) // a4
      })

      test("should be blocked by pieces", () => {
        const boardWithPiece = Array(8)
          .fill(null)
          .map(() => Array(8).fill("_"))
        boardWithPiece[2][2] = "p" // Piece blocking diagonal
        const state = { ...testState, board: boardWithPiece }

        // Bishop at d4 blocked by piece at c3
        expect(canPieceAttackSquare(3, 3, 2, 2, "b", state)).toBe(true) // Can attack the blocking piece
        expect(canPieceAttackSquare(3, 3, 1, 1, "b", state)).toBe(false) // Cannot attack beyond
        expect(canPieceAttackSquare(3, 3, 0, 0, "b", state)).toBe(false) // Cannot attack beyond
      })
    })

    describe("rook attacks", () => {
      test("should detect orthogonal attacks", () => {
        const emptyBoard = Array(8)
          .fill(null)
          .map(() => Array(8).fill("_"))
        const state = { ...testState, board: emptyBoard }

        // Rook at d4 can attack orthogonally
        expect(canPieceAttackSquare(3, 3, 3, 0, "r", state)).toBe(true) // d1
        expect(canPieceAttackSquare(3, 3, 3, 7, "r", state)).toBe(true) // d8
        expect(canPieceAttackSquare(3, 3, 0, 3, "r", state)).toBe(true) // a4
        expect(canPieceAttackSquare(3, 3, 7, 3, "r", state)).toBe(true) // h4

        // Rook shouldn't attack diagonally
        expect(canPieceAttackSquare(3, 3, 4, 4, "r", state)).toBe(false) // e5
        expect(canPieceAttackSquare(3, 3, 2, 2, "r", state)).toBe(false) // c3
      })
    })

    describe("queen attacks", () => {
      test("should combine rook and bishop attacks", () => {
        const emptyBoard = Array(8)
          .fill(null)
          .map(() => Array(8).fill("_"))
        const state = { ...testState, board: emptyBoard }

        // Queen at d4 can attack in all directions
        expect(canPieceAttackSquare(3, 3, 3, 0, "q", state)).toBe(true) // d1 (rook-like)
        expect(canPieceAttackSquare(3, 3, 0, 3, "q", state)).toBe(true) // a4 (rook-like)
        expect(canPieceAttackSquare(3, 3, 0, 0, "q", state)).toBe(true) // a1 (bishop-like)
        expect(canPieceAttackSquare(3, 3, 6, 6, "q", state)).toBe(true) // g7 (bishop-like)
      })
    })

    describe("king attacks", () => {
      test("should detect adjacent square attacks", () => {
        const emptyBoard = Array(8)
          .fill(null)
          .map(() => Array(8).fill("_"))
        const state = { ...testState, board: emptyBoard }

        // King at d4 can attack all adjacent squares
        const adjacentSquares = [
          [2, 2],
          [2, 3],
          [2, 4],
          [3, 2],
          [3, 4],
          [4, 2],
          [4, 3],
          [4, 4],
        ]

        adjacentSquares.forEach(([x, y]) => {
          expect(canPieceAttackSquare(3, 3, x, y, "k", state)).toBe(true)
        })

        // King shouldn't attack distant squares
        expect(canPieceAttackSquare(3, 3, 1, 1, "k", state)).toBe(false)
        expect(canPieceAttackSquare(3, 3, 5, 5, "k", state)).toBe(false)
        expect(canPieceAttackSquare(3, 3, 3, 1, "k", state)).toBe(false)
      })
    })

    describe("edge cases", () => {
      test("should handle attacks near board edges", () => {
        const emptyBoard = Array(8)
          .fill(null)
          .map(() => Array(8).fill("_"))
        const state = { ...testState, board: emptyBoard }

        // Knight at corner should only attack valid squares
        expect(canPieceAttackSquare(0, 0, 1, 2, "n", state)).toBe(true)
        expect(canPieceAttackSquare(0, 0, 2, 1, "n", state)).toBe(true)

        // Rook at edge should attack along rank/file
        expect(canPieceAttackSquare(0, 0, 7, 0, "r", state)).toBe(true)
        expect(canPieceAttackSquare(0, 0, 0, 7, "r", state)).toBe(true)
      })
    })
  })
})
