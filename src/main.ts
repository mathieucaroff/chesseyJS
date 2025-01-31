import * as packageInfo from "../package.json"
import { githubCornerHTML } from "./lib/githubCorner"

import { getConfig } from "./config"
import "./style.css"


async function main() {
  let config = getConfig(location)


  let cornerDiv = document.createElement("div")
  cornerDiv.innerHTML = githubCornerHTML(
    packageInfo.repository.url,
    packageInfo.version,
  )
  document.body.appendChild(cornerDiv)
}

main()
