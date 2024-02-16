import juice from "juice";
// import { toast } from "sonner"
import {
  BASIC_THEME_ID,
  BOX_ID,
  CODE_THEME_ID,
  FONT_THEME_ID,
  LAYOUT_ID,
  MARKDOWN_THEME_ID,
  SHADOW_HOST_ID
} from "./constant"

export async function copyTextToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    console.log("Text copied to clipboard")
  } catch (err) {
    console.error("Failed to copy: ", err)
  }
}

export const solveWeChatMath = () => {
  const shadowRoot = document.getElementById(SHADOW_HOST_ID)?.shadowRoot
  if (!shadowRoot) return
  const layout = shadowRoot.getElementById(LAYOUT_ID)
  if (!layout) return
  const mjxs = layout.getElementsByTagName("mjx-container")
  for (let i = 0; i < mjxs.length; i++) {
    const mjx = mjxs[i]
    if (!mjx.hasAttribute("jax")) {
      break
    }

    // mjx.removeAttribute("data");
    mjx.removeAttribute("jax")
    mjx.removeAttribute("display")
    mjx.removeAttribute("tabindex")
    mjx.removeAttribute("ctxtmenu_counter")
    const svg = mjx.firstChild as SVGElement
    if (!svg) return
    const width = svg.getAttribute("width")!
    const height = svg.getAttribute("height")!
    svg.removeAttribute("width")
    svg.removeAttribute("height")
    svg.style.width = width
    svg.style.height = height
  }
}

export const solveHtml = () => {
  const shadowRoot = document.getElementById(SHADOW_HOST_ID)?.shadowRoot
  if (!shadowRoot) return
  const element = shadowRoot.getElementById(BOX_ID)
  if (!element) return
  const inner = element.children[0].children
  for (const item of inner) {
    item.setAttribute("data-tool", "NotionFlink Preview")
  }
  let html = element.innerHTML
  html = html.replace(
    /<mjx-container (class="inline.+?)<\/mjx-container>/g,
    "<span $1</span>"
  )
  html = html.replace(/\s<span class="inline/g, '&nbsp;<span class="inline')
  html = html.replace(/svg><\/span>\s/g, "svg></span>&nbsp;")
  html = html.replace(/mjx-container/g, "section")
  html = html.replace(/class="mjx-solid"/g, 'fill="none" stroke-width="70"')
  html = html.replace(/<mjx-assistive-mml.+?<\/mjx-assistive-mml>/g, "")
  const basicStyle = shadowRoot.getElementById(BASIC_THEME_ID)?.innerText || ""
  const markdownStyle =
    shadowRoot.getElementById(MARKDOWN_THEME_ID)?.innerText || ""
  const codeStyle = shadowRoot.getElementById(CODE_THEME_ID)?.innerText || ""
  const fontStyle = shadowRoot.getElementById(FONT_THEME_ID)?.innerText || ""
  let res = ""
  try {
    res = juice.inlineContent(
      html,
      basicStyle + markdownStyle + codeStyle + fontStyle,
      {
        inlinePseudoElements: true,
        preserveImportant: true
      }
    )
  } catch (e) {
    // toast.error("请检查 CSS 文件是否编写正确！")
    
    console.error("请检查 CSS 文件是否编写正确！")
  }

  return res
}
