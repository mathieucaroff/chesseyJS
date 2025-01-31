import { ensureSpacelessURL, resolveSearch } from "./lib/urlParameter"
import { GameHistory, Versus } from "./type"

export interface ChesseyConfig {
  versus: Versus
  dark: boolean
  gameHistory: GameHistory
}

export function getConfig(location: Location) {
  ensureSpacelessURL(location)

  let config = resolveSearch<ChesseyConfig>(location, {
    versus: [() => "humanAi" as Versus],
    dark: [() => false],
    gameHistory: [() => ""],
  })
  console.log(config)
  return config
}