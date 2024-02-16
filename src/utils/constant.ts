export const SHADOW_HOST_ID = "notion-nice-content-root"
export const CONTENT = "nice-content"
export const STYLE = "nice-style"
export const TEMPLATE_NUM = "nice-template_num"
export const CODE_NUM = "nice-code_num"
export const PREVIEW_TYPE = "nice-preview_type"
export const BASIC_THEME_ID = "nice-basic-theme"
export const CODE_THEME_ID = "nice-code-theme"
export const MARKDOWN_THEME_ID = "nice-markdown-theme"
export const FONT_THEME_ID = "nice-font-theme"
export const LAYOUT_ID = "nice"
export const BOX_ID = "nice-rich-text-box"

export const RIGHT_SYMBOL = "✔️"
export const EXPORT_FILENAME_SUFFIX = ".md"

export const STYLE_LABELS = [
  BASIC_THEME_ID,
  MARKDOWN_THEME_ID,
  CODE_THEME_ID,
  FONT_THEME_ID
]

export const TEMPLATE_OPTIONS = [
  {
    id: "normal",
    name: "默认主题"
  },
  {
    id: "fullStackBlue",
    name: "全栈蓝"
  },
  {
    id: "nightPurple",
    name: "凝夜紫"
  },
  {
    id: "cuteGreen",
    name: "萌绿"
  },
  {
    id: "extremeBlack",
    name: "极简黑"
  },
  {
    id: "orangeHeart",
    name: "橙心"
  },
  {
    id: "green",
    name: "绿意",
    author: "夜尽天明"
  },
  {
    id: "wechatFormat",
    name: "WeChat-Format"
  },
  {
    id: "blueCyan",
    name: "兰青"
  },
  {
    id: "red",
    name: "红绯"
  },
  {
    id: "blue",
    name: "蓝莹"
  },
  {
    id: "custom",
    name: "自定义"
  }
]

export const TEMPLATE_CUSTOM_NUM = TEMPLATE_OPTIONS.length - 1

export const CODE_OPTIONS = [
  {
    id: "wechat",
    name: "微信代码主题"
  },
  {
    id: "atomOneDark",
    macId: "macAtomOneDark",
    name: "atom-one-dark"
  },
  {
    id: "atomOneLight",
    macId: "macAtomOneLight",
    name: "atom-one-light"
  },
  {
    id: "monokai",
    macId: "macMonokai",
    name: "monokai"
  },
  {
    id: "github",
    macId: "macGithub",
    name: "github"
  },
  {
    id: "vs2015",
    macId: "macVs2015",
    name: "vs2015"
  },
  {
    id: "xcode",
    macId: "macXcode",
    name: "xcode"
  }
]

export const SITDOWN_OPTIONS = [
  {
    key: "wechat",
    value: "微信公众号 - https://mp.weixin.qq.com/"
  },
  {
    key: "zhihu",
    value: "知乎专栏 - https://zhuanlan.zhihu.com/"
  },
  {
    key: "juejin",
    value: "掘金 - https://juejin.im/post/"
  },
  {
    key: "csdn",
    value: "CSDN - https://blog.csdn.net/"
  },
  {
    key: "other",
    value: "其他"
  }
]
