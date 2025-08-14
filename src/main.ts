/// <reference path="./type.d.ts" />

import { gameFromText } from "./tools/history"

// The user passes the list of half-moves separated by space and moves
// separated by semicolon.
//
// The application responds by listing the white pieces kinds and positions,
// the black pieces kinds and positions, and the list of available moves for
// the current player.

/**
 * Main entry point that processes command line arguments to create a chess
 * game from text notation
 */
async function main() {
  const game = gameFromText(process.argv[2] || "")
}

main().catch(console.error)
