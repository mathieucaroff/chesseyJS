export function getLetter(x: number): string {
  return String.fromCharCode(97 + x)
}

/** Get the name of the given move */
export function getNotation(
  move: Omit<Move, "notation">,
  state: State,
): string {
  const { x, y, nx, ny, kind, special } = move
  switch (special) {
    case "castleShort":
      return `O-O`
    case "castleLong":
      return `O-O-O`
    case "enPassant":
      return `${getLetter(x)}x${getLetter(nx)}${ny} e.p.`
    case "promotion":
      return `${getLetter(nx)}${ny}=${kind.toUpperCase()}`
    case "longPawnMove":
      return `${getLetter(nx)}${ny}`
  }
  // TODO
  return ""
}
