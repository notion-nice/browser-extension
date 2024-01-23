import { StyleProvider } from "@ant-design/cssinjs"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { App, ConfigProvider, theme } from "antd"
import tailwindCSS from "data-text:~tailwindCSS.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"
import { useEffect, useState } from "react"

import { MenuFold, Panel } from "~components"
import { getElement, onElementLoaded } from "~utility"

export const config: PlasmoCSConfig = {
  matches: ["https://www.notion.so/*"]
}
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

const notionAppCls = ".notion-app-inner"

const PlasmoOverlay = ({ anchor }: PlasmoCSUIProps) => {
  console.log("anchor: ", anchor.element.nextElementSibling?.shadowRoot)
  const [themeType, setThemeType] = useState<"light" | "dark">()

  const shadowRoot = anchor.element.nextElementSibling?.shadowRoot

  useEffect(() => {
    let observer: MutationObserver | null = null
    onElementLoaded(notionAppCls).then((isPresent) => {
      if (isPresent) {
        const targetNode: HTMLDivElement = getElement(notionAppCls)

        function cb() {
          // 检查 class 是否包含暗主题或亮主题
          const isDarkTheme = targetNode.classList.contains("notion-dark-theme")
          const isLightTheme =
            targetNode.classList.contains("notion-light-theme")

          // 根据主题变化做出响应
          if (isDarkTheme) {
            setThemeType("dark")
          }
          if (isLightTheme) {
            setThemeType("light")
          }
        }

        cb()
        observer = new MutationObserver(function (mutationsList, _observer) {
          for (const mutation of mutationsList) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              cb()
            }
          }
        })

        // 使用配置开始观察目标节点
        observer.observe(targetNode, {
          attributes: true,
          attributeFilter: ["class"]
        })
      }
      return null
    })

    return () => {
      observer?.disconnect()
    }
  }, [])

  if (!themeType) return null

  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeType === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm
      }}
      getPopupContainer={() => shadowRoot as any}>
      <StyleProvider container={shadowRoot} hashPriority="high">
        <CacheProvider value={styleCache}>
          <App>
            <MenuFold>
              <Panel />
            </MenuFold>
          </App>
        </CacheProvider>
      </StyleProvider>
    </ConfigProvider>
  )
}

export default PlasmoOverlay
