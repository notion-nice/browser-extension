import cssText from "data-text:~global.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"
import { useEffect, useState } from "react"

import { MenuFold, Panel } from "~components"
import { Toaster } from "~components/ui/toaster"
import { getElement, onElementLoaded } from "~utility"
import { SHADOW_HOST_ID } from "~utils/constant"

export const config: PlasmoCSConfig = {
  matches: ["https://www.notion.so/*"]
}
export const getShadowHostId = () => SHADOW_HOST_ID

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const notionAppCls = ".notion-app-inner"
const PlasmoOverlay = ({}: PlasmoCSUIProps) => {
  const [themeType, setThemeType] = useState<"light" | "dark">()

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
            console.log("Dark theme detected")
          }
          if (isLightTheme) {
            setThemeType("light")
            console.log("Light theme detected")
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
    <div id="notion-flink-app" className={themeType}>
      <MenuFold>
        <Panel />
      </MenuFold>
      <Toaster />
    </div>
  )
}

export default PlasmoOverlay
