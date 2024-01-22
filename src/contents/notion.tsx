import { StyleProvider } from "@ant-design/cssinjs"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { ConfigProvider } from "antd"
import tailwindCSS from "data-text:~tailwindCSS.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"

import { MenuFold } from "~components"

export const config: PlasmoCSConfig = {
  matches: ["https://www.notion.so/*"]
}
// export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
//   document.querySelector(`[href="/#pricing"]`)
// export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
//   document.querySelector("#notion-flink-inject")
export const getShadowHostId = () => "notion-flink-content-root"

const styleElement = document.createElement("style")

const styleCache = createCache({
  key: "notion-flink-content-style-cache",
  prepend: true,
  container: styleElement
})

export const getStyle = () => {
  // If you don't use TailwindCSS, you can comment it out (styleElement.textContent = TailwindCSS)
  // Antd style exception due to use of TailwindCSS, you can comment it and import the style.css
  //   styleElement.textContent = TailwindCSS

  // import tailwindCSS from "data-text:~tailwindCSS.css"
  styleElement.textContent = tailwindCSS

  // import cssText from "data-text:~style.css"
  // styleElement.textContent = cssText
  //   styleElement.textContent = cssText

  return styleElement
}

const PlasmoOverlay = ({ anchor }: PlasmoCSUIProps) => {
  console.log("anchor: ", anchor.element.nextElementSibling?.shadowRoot)

  const shadowRoot = anchor.element.nextElementSibling?.shadowRoot

  return (
    <ConfigProvider getPopupContainer={() => shadowRoot as any}>
      <StyleProvider container={shadowRoot} hashPriority="high">
        <CacheProvider value={styleCache}>
          <MenuFold>
            <div className="h-full w-[260px]"></div>
          </MenuFold>
        </CacheProvider>
      </StyleProvider>
    </ConfigProvider>
  )
}

export default PlasmoOverlay
