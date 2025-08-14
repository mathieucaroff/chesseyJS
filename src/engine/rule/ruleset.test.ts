/// <reference path="../../type.d.ts" />
import { describe, test, expect } from "vitest"
import {
  movementRuleRecord,
  canPieceAttackSquare,
  isUnderAttack,
  canPawnMoveTo,
} from "./ruleset"
import { initialBoard } from "../game/game"

const makeEmptyBoard = () =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "_"))

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
        expect(canPieceAttackSquare(4, 3, 3, 4, "p", "white", state)).toBe(true) // e4 attacks d5
        expect(canPieceAttackSquare(4, 3, 5, 4, "p", "white", state)).toBe(true) // e4 attacks f5
        expect(canPieceAttackSquare(4, 3, 4, 4, "p", "white", state)).toBe(
          false,
        ) // e4 doesn't attack e5
        expect(canPieceAttackSquare(4, 3, 3, 3, "p", "white", state)).toBe(
          false,
        ) // e4 doesn't attack d4
      })

      test("should detect black pawn attacks", () => {
        const state: State = { ...testState, turn: "black" }

        // Black pawn at e5 can attack d4 and f4
        expect(canPieceAttackSquare(4, 4, 3, 3, "p", "black", state)).toBe(true) // e5 attacks d4
        expect(canPieceAttackSquare(4, 4, 5, 3, "p", "black", state)).toBe(true) // e5 attacks f4
        expect(canPieceAttackSquare(4, 4, 4, 3, "p", "black", state)).toBe(
          false,
        ) // e5 doesn't attack e4
        expect(canPieceAttackSquare(4, 4, 3, 4, "p", "black", state)).toBe(
          false,
        ) // e5 doesn't attack d5
      })
    })

    describe("knight attacks", () => {
      test("should detect knight attacks", () => {
        const emptyBoard = makeEmptyBoard()
        const state = { ...testState, board: emptyBoard }

        // Knight at e5 (4,4) attacks specific squares
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
          expect(canPieceAttackSquare(4, 4, x, y, "n", "white", state)).toBe(
            true,
          )
        })

        // Knight shouldn't attack adjacent squares
        expect(canPieceAttackSquare(4, 4, 3, 4, "n", "white", state)).toBe(
          false,
        )
        expect(canPieceAttackSquare(4, 4, 5, 4, "n", "white", state)).toBe(
          false,
        )
        expect(canPieceAttackSquare(4, 4, 4, 3, "n", "white", state)).toBe(
          false,
        )
        expect(canPieceAttackSquare(4, 4, 4, 5, "n", "white", state)).toBe(
          false,
        )
      })
    })

    describe("bishop attacks", () => {
      test("should detect diagonal attacks", () => {
        const emptyBoard = makeEmptyBoard()
        const state = { ...testState, board: emptyBoard }

        // Bishop at d4 can attack diagonally
        expect(canPieceAttackSquare(3, 3, 0, 0, "b", "white", state)).toBe(true) // a1
        expect(canPieceAttackSquare(3, 3, 6, 6, "b", "white", state)).toBe(true) // g7
        expect(canPieceAttackSquare(3, 3, 0, 6, "b", "white", state)).toBe(true) // a7
        expect(canPieceAttackSquare(3, 3, 6, 0, "b", "white", state)).toBe(true) // g1

        // Bishop shouldn't attack orthogonally
        expect(canPieceAttackSquare(3, 3, 3, 0, "b", "white", state)).toBe(
          false,
        ) // d1
        expect(canPieceAttackSquare(3, 3, 0, 3, "b", "white", state)).toBe(
          false,
        ) // a4
      })

      test("should be blocked by pieces", () => {
        const boardWithPiece = makeEmptyBoard()
        boardWithPiece[2][2] = "p" // Piece blocking diagonal
        const state = { ...testState, board: boardWithPiece }

        // Bishop at d4 blocked by piece at c3
        expect(canPieceAttackSquare(3, 3, 2, 2, "b", "white", state)).toBe(true) // Can attack the blocking piece
        expect(canPieceAttackSquare(3, 3, 1, 1, "b", "white", state)).toBe(
          false,
        ) // Cannot attack beyond
        expect(canPieceAttackSquare(3, 3, 0, 0, "b", "white", state)).toBe(
          false,
        ) // Cannot attack beyond
      })
    })

    describe("rook attacks", () => {
      test("should detect orthogonal attacks", () => {
        const emptyBoard = makeEmptyBoard()
        const state = { ...testState, board: emptyBoard }

        // Rook at d4 can attack orthogonally
        expect(canPieceAttackSquare(3, 3, 3, 0, "r", "white", state)).toBe(true) // d1
        expect(canPieceAttackSquare(3, 3, 3, 7, "r", "white", state)).toBe(true) // d8
        expect(canPieceAttackSquare(3, 3, 0, 3, "r", "white", state)).toBe(true) // a4
        expect(canPieceAttackSquare(3, 3, 7, 3, "r", "white", state)).toBe(true) // h4

        // Rook shouldn't attack diagonally
        expect(canPieceAttackSquare(3, 3, 4, 4, "r", "white", state)).toBe(
          false,
        ) // e5
        expect(canPieceAttackSquare(3, 3, 2, 2, "r", "white", state)).toBe(
          false,
        ) // c3
      })
    })

    describe("queen attacks", () => {
      test("should combine rook and bishop attacks", () => {
        const emptyBoard = makeEmptyBoard()
        const state = { ...testState, board: emptyBoard }

        // Queen at d4 can attack in all directions
        expect(canPieceAttackSquare(3, 3, 3, 0, "q", "white", state)).toBe(true) // d1 (rook-like)
        expect(canPieceAttackSquare(3, 3, 0, 3, "q", "white", state)).toBe(true) // a4 (rook-like)
        expect(canPieceAttackSquare(3, 3, 0, 0, "q", "white", state)).toBe(true) // a1 (bishop-like)
        expect(canPieceAttackSquare(3, 3, 6, 6, "q", "white", state)).toBe(true) // g7 (bishop-like)
      })
    })

    describe("king attacks", () => {
      test("should detect adjacent square attacks", () => {
        const emptyBoard = makeEmptyBoard()
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
          expect(canPieceAttackSquare(3, 3, x, y, "k", "white", state)).toBe(
            true,
          )
        })

        // King shouldn't attack distant squares
        expect(canPieceAttackSquare(3, 3, 1, 1, "k", "white", state)).toBe(
          false,
        )
        expect(canPieceAttackSquare(3, 3, 5, 5, "k", "white", state)).toBe(
          false,
        )
        expect(canPieceAttackSquare(3, 3, 3, 1, "k", "white", state)).toBe(
          false,
        )
      })
    })

    describe("edge cases", () => {
      test("should handle attacks near board edges", () => {
        const emptyBoard = makeEmptyBoard()
        const state = { ...testState, board: emptyBoard }

        // Knight at corner should only attack valid squares
        expect(canPieceAttackSquare(0, 0, 1, 2, "n", "white", state)).toBe(true)
        expect(canPieceAttackSquare(0, 0, 2, 1, "n", "white", state)).toBe(true)

        // Rook at edge should attack along rank/file
        expect(canPieceAttackSquare(0, 0, 7, 0, "r", "white", state)).toBe(true)
        expect(canPieceAttackSquare(0, 0, 0, 7, "r", "white", state)).toBe(true)
      })
    })

    describe("piece color parameter", () => {
      test("should respect piece color for pawn attacks", () => {
        const emptyBoard = makeEmptyBoard()
        const state = { ...testState, board: emptyBoard }

        // White pawn should attack forward (up the board)
        expect(canPieceAttackSquare(4, 3, 3, 4, "p", "white", state)).toBe(true)
        expect(canPieceAttackSquare(4, 3, 5, 4, "p", "white", state)).toBe(true)
        expect(canPieceAttackSquare(4, 3, 3, 2, "p", "white", state)).toBe(
          false,
        )

        // Black pawn should attack forward (down the board)
        expect(canPieceAttackSquare(4, 4, 3, 3, "p", "black", state)).toBe(true)
        expect(canPieceAttackSquare(4, 4, 5, 3, "p", "black", state)).toBe(true)
        expect(canPieceAttackSquare(4, 4, 3, 5, "p", "black", state)).toBe(
          false,
        )
      })

      test("should work regardless of piece color for other pieces", () => {
        const emptyBoard = makeEmptyBoard()
        const state = { ...testState, board: emptyBoard }

        // Knight attacks should be same regardless of color
        expect(canPieceAttackSquare(4, 4, 6, 5, "n", "white", state)).toBe(true)
        expect(canPieceAttackSquare(4, 4, 6, 5, "n", "black", state)).toBe(true)

        // Rook attacks should be same regardless of color
        expect(canPieceAttackSquare(3, 3, 3, 7, "r", "white", state)).toBe(true)
        expect(canPieceAttackSquare(3, 3, 3, 7, "r", "black", state)).toBe(true)
      })
    })
  })
})

describe("isUnderAttack", () => {
  const emptyBoard = makeEmptyBoard()

  test("should detect attacks by various pieces", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[4][4] = "Q" // Black queen at e5
    board[2][2] = "r" // White rook at c3

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Queen should attack diagonally and orthogonally
    expect(isUnderAttack(7, 7, "black", state)).toBe(true) // h8 attacked by black queen
    expect(isUnderAttack(4, 0, "black", state)).toBe(true) // e1 attacked by black queen
    expect(isUnderAttack(0, 4, "black", state)).toBe(true) // a5 attacked by black queen

    // Rook should attack orthogonally
    expect(isUnderAttack(2, 0, "white", state)).toBe(true) // c1 attacked by white rook
    expect(isUnderAttack(2, 7, "white", state)).toBe(true) // c8 attacked by white rook
    expect(isUnderAttack(0, 2, "white", state)).toBe(true) // a3 attacked by white rook
    expect(isUnderAttack(7, 2, "white", state)).toBe(true) // h3 attacked by white rook

    // Squares not under attack
    expect(isUnderAttack(0, 0, "black", state)).toBe(false) // a1 protected by the white rook
    expect(isUnderAttack(1, 1, "black", state)).toBe(false) // b2 protected by the white rook
    expect(isUnderAttack(3, 3, "white", state)).toBe(false) // d4 queen not attacked by white
  })

  test("should detect pawn attacks", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[3][4] = "p" // White pawn at e4 (x=4, y=3)
    board[4][3] = "P" // Black pawn at d5 (x=3, y=4)

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // White pawn at e4 attacks d5 and f5
    expect(isUnderAttack(3, 4, "white", state)).toBe(true) // d5 under attack by white pawn
    expect(isUnderAttack(5, 4, "white", state)).toBe(true) // f5 under attack by white pawn
    expect(isUnderAttack(4, 4, "white", state)).toBe(false) // e5 not under attack by white pawn

    // Black pawn at d5 attacks c4 and e4
    expect(isUnderAttack(2, 3, "black", state)).toBe(true) // c4 under attack by black pawn
    expect(isUnderAttack(4, 3, "black", state)).toBe(true) // e4 under attack by black pawn
    expect(isUnderAttack(3, 3, "black", state)).toBe(false) // d4 not under attack by black pawn
  })

  test("should detect knight attacks", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[4][4] = "n" // White knight at e5

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Knight attacks
    const knightTargets = [
      [6, 5],
      [6, 3],
      [5, 6],
      [5, 2],
      [2, 5],
      [2, 3],
      [3, 6],
      [3, 2],
    ]

    knightTargets.forEach(([x, y]) => {
      expect(isUnderAttack(x, y, "white", state)).toBe(true)
    })

    // Adjacent squares should not be attacked
    expect(isUnderAttack(3, 4, "white", state)).toBe(false)
    expect(isUnderAttack(5, 4, "white", state)).toBe(false)
    expect(isUnderAttack(4, 3, "white", state)).toBe(false)
    expect(isUnderAttack(4, 5, "white", state)).toBe(false)
  })

  test("should handle blocked attacks", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[0][0] = "r" // White rook at a1
    board[3][0] = "p" // White pawn blocking at d1

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Squares before blocking piece should be attacked
    expect(isUnderAttack(1, 0, "white", state)).toBe(true) // b1
    expect(isUnderAttack(2, 0, "white", state)).toBe(true) // c1

    // Squares after blocking piece should not be attacked
    expect(isUnderAttack(0, 4, "white", state)).toBe(false) // e1
    expect(isUnderAttack(0, 7, "white", state)).toBe(false) // h1
  })

  test("should return false when no pieces of attacking color", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[4][4] = "k" // Only white king

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    expect(isUnderAttack(0, 0, "black", state)).toBe(false)
    expect(isUnderAttack(7, 7, "black", state)).toBe(false)
  })

  test("should handle attacks on board edges", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[0][0] = "n" // White knight at corner

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Valid knight moves from corner
    expect(isUnderAttack(2, 1, "white", state)).toBe(true)
    expect(isUnderAttack(1, 2, "white", state)).toBe(true)

    // Squares not attacked by knight
    expect(isUnderAttack(0, 1, "white", state)).toBe(false)
    expect(isUnderAttack(1, 0, "white", state)).toBe(false)
  })

  test("should correctly identify king being under attack", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[0][4] = "k" // White king at e1
    board[7][4] = "R" // Black rook at e8
    board[7][5] = "K" // Black king at f8

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // King should be under attack by rook
    expect(isUnderAttack(4, 0, "black", state)).toBe(true) // White king at e1 under attack by black rook
    expect(isUnderAttack(5, 7, "white", state)).toBe(false) // Black king not under attack by white pieces
  })

  test("should handle multiple attacking pieces", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[0][0] = "r" // White rook at a1
    board[7][7] = "b" // White bishop at h8
    board[3][3] = "n" // White knight at d4

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Square attacked by rook
    expect(isUnderAttack(0, 7, "white", state)).toBe(true) // a8
    // Square attacked by bishop
    expect(isUnderAttack(0, 0, "white", state)).toBe(false) // a1 has own piece
    expect(isUnderAttack(6, 6, "white", state)).toBe(true) // g7
    // Square attacked by knight
    expect(isUnderAttack(5, 4, "white", state)).toBe(true) // f5
    expect(isUnderAttack(1, 2, "white", state)).toBe(true) // b3
  })
})

describe("canPawnMoveTo", () => {
  const emptyBoard = makeEmptyBoard()

  test("should allow white pawn forward moves", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[1][4] = "p" // White pawn at e2

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // One square forward
    expect(canPawnMoveTo(4, 1, 4, 2, state)).toBe(true)
    // Two squares forward from starting position
    expect(canPawnMoveTo(4, 1, 4, 3, state)).toBe(true)
    // Cannot move backward
    expect(canPawnMoveTo(4, 1, 4, 0, state)).toBe(false)
    // Cannot move sideways
    expect(canPawnMoveTo(4, 1, 5, 1, state)).toBe(false)
  })

  test("should allow black pawn forward moves", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[6][4] = "P" // Black pawn at e7

    const state: State = {
      board,
      turn: "black",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // One square forward (down for black)
    expect(canPawnMoveTo(4, 6, 4, 5, state)).toBe(true)
    // Two squares forward from starting position
    expect(canPawnMoveTo(4, 6, 4, 4, state)).toBe(true)
    // Cannot move backward
    expect(canPawnMoveTo(4, 6, 4, 7, state)).toBe(false)
    // Cannot move sideways
    expect(canPawnMoveTo(4, 6, 5, 6, state)).toBe(false)
  })

  test("should allow diagonal captures", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[3][4] = "p" // White pawn at e4
    board[4][3] = "P" // Black piece to capture at d5
    board[4][4] = "P" // Black piece preventing the pawn to move forward
    board[4][5] = "P" // Black piece to capture at f5

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Can capture diagonally
    expect(canPawnMoveTo(4, 3, 3, 4, state)).toBe(true) // Capture left
    expect(canPawnMoveTo(4, 3, 5, 4, state)).toBe(true) // Capture right
    // Cannot capture forward
    expect(canPawnMoveTo(4, 3, 4, 4, state)).toBe(false)
  })

  test("should not allow diagonal moves without capture", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[3][4] = "p" // White pawn at e4

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Cannot move diagonally to empty squares
    expect(canPawnMoveTo(4, 3, 3, 4, state)).toBe(false)
    expect(canPawnMoveTo(4, 3, 5, 4, state)).toBe(false)
  })

  test("should not allow capturing own pieces", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[3][4] = "p" // White pawn at e4
    board[4][3] = "r" // White piece at d5

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Cannot capture own piece
    expect(canPawnMoveTo(4, 3, 3, 4, state)).toBe(false)
  })

  test("should handle en passant captures", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[4][4] = "p" // White pawn at e5
    board[4][3] = "P" // Black pawn at d5 (that just moved two squares)

    const state: State = {
      board,
      turn: "white",
      enPassant: 3, // d-file
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Can capture en passant
    expect(canPawnMoveTo(4, 4, 3, 5, state)).toBe(true)
    // Normal forward move still works
    expect(canPawnMoveTo(4, 4, 4, 5, state)).toBe(true)
    // Cannot capture on other diagonal without piece
    expect(canPawnMoveTo(4, 4, 5, 5, state)).toBe(false)
  })

  test("should handle black en passant captures", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[3][3] = "P" // Black pawn at d4
    board[3][4] = "p" // White pawn at e4 (that just moved two squares)

    const state: State = {
      board,
      turn: "black",
      enPassant: 4, // e-file
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Can capture en passant (black moves down)
    expect(canPawnMoveTo(3, 3, 4, 2, state)).toBe(true)
  })

  test("should be blocked by pieces", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[1][4] = "p" // White pawn at e2
    board[2][4] = "P" // Black piece blocking at e3

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // Cannot move forward when blocked
    expect(canPawnMoveTo(4, 1, 4, 2, state)).toBe(false)
    expect(canPawnMoveTo(4, 1, 4, 3, state)).toBe(false)
  })

  test("should only allow two-square move from starting position", () => {
    const board = [...emptyBoard.map((row) => [...row])]
    board[3][4] = "p" // White pawn at e4 (not starting position)

    const state: State = {
      board,
      turn: "white",
      enPassant: -1,
      whiteCanCastle: { long: true, short: true },
      blackCanCastle: { long: true, short: true },
    }

    // One square is fine
    expect(canPawnMoveTo(4, 3, 4, 4, state)).toBe(true)
    // Two squares not allowed from non-starting position
    expect(canPawnMoveTo(4, 3, 4, 5, state)).toBe(false)
  })
})
