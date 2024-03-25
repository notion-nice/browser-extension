export const titleToMarkdown = (title: any[][]) => {
  if (!(title instanceof Array)) return ""
  return title.reduce((str, cur) => {
    let md = cur[0]
    const properties = cur[1] as string[][]
    if (["⁍", "‣"].includes(cur[0])) {
      md = ""
    }
    if (properties) {
      properties.map(([t, v]) => {
        switch (t) {
          case "i":
            md = `<i>${md}</i>`
            break
          case "b":
            md = `<b>${md}</b>`
            break
          case "_":
            md = `<u>${md}</u>`
            break
          case "s":
            md = `<s>${md}</s>`
            break
          case "c":
            md = `<code>${md}</code>`
            break
          case "e":
            md = `$${v}$`
            break
          case "a":
            md = `[${md}](${v})`
            // md = `<a target="_blank" href="${v}">${md}</a>`
            break
          case "h":
            md = `<span class="h_${v}">${md}</span>`
            break

          case "d": //TODO  时间Block
          case "u": //TODO  用户信息
          case "p": //TODO  页面信息
          default:
            break
        }
      })
    }

    return str + md
  }, "")
}
