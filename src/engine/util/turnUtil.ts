export function applyTurnToCase(turn: Turn, letter: string) {
  if (turn === "white") {
    return letter.toLowerCase()
  } else {
    return letter.toUpperCase()
  }
}

export function readCaseToTurn(letter: string): Turn {
  if (letter === letter.toLowerCase()) {
    return "white"
  } else {
    return "black"
  }
}

export function oppositeTurn(turn: Turn): Turn {
  return turn === "white" ? "black" : "white"
}
