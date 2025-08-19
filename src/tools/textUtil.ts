export function swapCase(str: string): string {
  return str
    .split("")
    .map((char) =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase(),
    )
    .join("")
}
