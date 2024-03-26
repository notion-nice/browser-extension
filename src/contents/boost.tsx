import styleText from "data-text:~content.scss"
import type { PlasmoCSConfig, PlasmoGetRootContainer } from "plasmo"

import { displayOutline } from "../feature/outline"

export const config: PlasmoCSConfig = {
  matches: ["https://www.notion.so/*"]
}

export const getRootContainer: PlasmoGetRootContainer = () => {
  let el = document.getElementById("notion-feature") as HTMLDivElement
  if (!el) {
    el = document.createElement("div")
    el.id = "notion-feature"
  }
  return el
}

displayOutline(true, () => {
  let styleElement = document.getElementById("notion-boost") as HTMLStyleElement
  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = "notion-boost"
  }

  styleElement.textContent = styleText
  const headElement = document.head || document.getElementsByTagName("head")[0]

  headElement.appendChild(styleElement)
})

export default () => null
