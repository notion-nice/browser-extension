import { useMount } from "ahooks"

import TEMPLATE from "~template"
import {
  BASIC_THEME_ID,
  CODE_THEME_ID,
  MARKDOWN_THEME_ID,
  STYLE,
  STYLE_LABELS,
  TEMPLATE_CUSTOM_NUM,
  TEMPLATE_NUM,
  TEMPLATE_OPTIONS
} from "~utils/constant"
import { addStyleLabel, replaceStyle } from "~utils/helper"

import { Converter } from "./Converter"

export const Panel = () => {
  useMount(() => {
    let style = ""
    // let codeStyle = ""

    // 如果为空先把数据放进去
    if (!window.localStorage.getItem(STYLE)) {
      window.localStorage.setItem(STYLE, TEMPLATE.style.custom)
    }

    const templateNum = parseInt(window.localStorage.getItem(TEMPLATE_NUM), 10)

    // 用于处理刷新后的信息持久化
    // 属于自定义主题则从localstorage中读数据
    if (templateNum === TEMPLATE_CUSTOM_NUM) {
      style = window.localStorage.getItem(STYLE)
    } else {
      if (templateNum && templateNum < TEMPLATE_OPTIONS.length) {
        const { id } = TEMPLATE_OPTIONS[templateNum]
        style = TEMPLATE.style[id]
      } else {
        style = TEMPLATE.style.normal
      }
    }

    // 在 plasmo-csui 中添加style标签
    addStyleLabel(STYLE_LABELS)

    // 初始化整体主题
    replaceStyle(BASIC_THEME_ID, TEMPLATE.basic)
    replaceStyle(MARKDOWN_THEME_ID, style)
    replaceStyle(CODE_THEME_ID, TEMPLATE.code.macVs2015)
  })
  return <Converter />
}
