import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.notion.so/*"]
}

export const getRootContainer = () =>
  new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const id = "notion-flink-inject"
      if (document.querySelector(`#${id}`)) {
        clearInterval(checkInterval)
        return
      }

      const root = document.querySelector(`#notion-app`)

      const mountDiv = document.createElement("div")
      mountDiv.id = "notion-flink-inject"

      root?.append(mountDiv)

      console.log("c: ", mountDiv)

      clearInterval(checkInterval)
      resolve(mountDiv)
    }, 137)
  })

const Inject = () => {
  return <></>
}

export default Inject
