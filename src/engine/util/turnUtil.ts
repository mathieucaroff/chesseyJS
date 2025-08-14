/**
 * Converts a piece letter to the appropriate case based on the turn
 * (white=lowercase, black=uppercase)
 */
export function applyTurnToCase(turn: Turn, letter: string) {
  if (turn === "white") {
    return letter.toLowerCase()
  } else {
    return letter.toUpperCase()
  }
}

/**
 * Determines the turn/color based on the case of a piece letter
 * (lowercase=white, uppercase=black)
 */
export function readCaseToTurn(letter: string): Turn {
  if (letter === letter.toLowerCase()) {
    return "white"
  } else {
    return "black"
  }
}

/** Returns the opposite turn (white becomes black, black becomes white) */
export function oppositeTurn(turn: Turn): Turn {
  return turn === "white" ? "black" : "white"
}
