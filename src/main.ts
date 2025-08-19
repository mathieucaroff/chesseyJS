/// <reference path="./type.d.ts" />

import { get } from "http"
import { gameFromText } from "./tools/history"
import { getAvailableMoveList } from "./engine/move/moveList"
import { swapCase } from "./tools/textUtil"

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
  let game: Game
  try {
    game = gameFromText(process.argv[2] || "")
  } catch (error) {
    const text = String(error).replace(/^Error: /, "")
    console.error(text)
    console.log(text)
    return
  }

  // Last played move
  const lastMove =
    game.history.extraMove ?? game.history.movePairList.slice(-1)[0][1]
  console.log(`I play ${lastMove.notation}`)

  // Game history
  let history = game.history.movePairList
    .map((pair) => `${pair[0].notation} ${pair[1].notation}`)
    .join("; ")
  if (game.history.extraMove) {
    history += `; ${game.history.extraMove.notation}`
  }
  console.log(`Game history: ${history}`)

  // Board visual representation
  console.log("The board is:")
  const rawFenArray: string[] = []
  ;[...game.state.board].reverse().forEach((row) => {
    rawFenArray.push(swapCase(row.join("")))
    console.log(swapCase(row.join(" ")).replace(/_/g, "-"))
  })

  // Board FEN representation
  let fenCount = 0
  const fenCharacterArray: string[] = []
  rawFenArray
    .join("/")
    .split("")
    .forEach((char, index) => {
      if (char !== "_") {
        if (fenCount > 0) {
          fenCharacterArray.push(String(fenCount))
          fenCount = 0
        }
        fenCharacterArray.push(char)
        fenCount = 0
      } else {
        fenCount++
      }
    })
  if (fenCount > 0) {
    fenCharacterArray.push(String(fenCount))
  }
  const fen = fenCharacterArray.join("")
  console.log(`FEN: ${fen}`)

  // Available moves
  const availableMoves = getAvailableMoveList(game.state, true)
  if (!Array.isArray(availableMoves)) {
    console.log(availableMoves)
    return
  }

  const count = availableMoves.length
  const s = count > 1 ? "s" : ""
  const isare = count > 1 ? "are" : "is"
  console.log(
    `There ${isare} ${count} move${s} available to ${game.state.turn}:`,
  )
  console.log("- " + availableMoves.map((move) => move.notation).join("\n- "))
}

main().catch(console.error)
