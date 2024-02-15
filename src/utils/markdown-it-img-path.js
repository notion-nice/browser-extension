// src/utils/markdown-it-img-path.js
function isRelativePath(url) {
  // 简单的相对路径检测
  return (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("//")
  )
}

function replaceImagePath(md, options) {
  const defaultRenderer =
    md.renderer.rules.image ||
    function (tokens, idx, _, _env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.image = function (tokens, idx, _, env, self) {
    const token = tokens[idx]
    const srcIndex = token.attrIndex("src")
    if (srcIndex >= 0) {
      const url = token.attrs[srcIndex][1]

      console.log(url)
      if (isRelativePath(url) && options.host) {
        token.attrs[srcIndex][1] = options.host + url
      }
    }

    // 调用默认渲染器或其他插件可能添加的渲染器
    return defaultRenderer(tokens, idx, options, env, self)
  }
}

export default (md, options) => {
  replaceImagePath(md, options)
}
