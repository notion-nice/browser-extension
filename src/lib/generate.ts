import MarkdownIt from "markdown-it"

import { getExtname } from "~utility"
import { upgradeImgPath } from "~utils/constant"
import { uploadFile } from "~utils/cos"
import highlightjs from "~utils/langHighlight"

import { getAxiosNotion, getUserInfo } from "./notion"
import { titleToMarkdown } from "./titleToMarkdown"

interface Properties {
  isPlus: boolean
  taskId: string
  preamble: number
}

const markdownParser = new MarkdownIt()

export const generateMarkdown = async (properties: Properties) => {
  const info = await getAxiosNotion()
  if (!info) {
    throw Error("The pageId does not exist in the current path")
  }
  const [axiosNotion, spaceId, pageId] = info
  const page = await axiosNotion
    .post("/syncRecordValues", {
      requests: [
        {
          pointer: { table: "block", id: pageId, spaceId },
          version: -1
        }
      ]
    })
    .then((r) => r.data?.recordMap?.block?.[pageId]?.value?.value)

  const contentIds = page.content as string[]
  const blocks = await getblockMap(contentIds)

  return blocksToMarkdown(contentIds, blocks, properties)
}

const blocksToMarkdown = async (
  contentIds: string[],
  blocks: any,
  properties: Properties
) => {
  const mds: string[] = await Promise.all(
    contentIds.map(async (id) => {
      const block = blocks[id]?.value?.value
      const md = await blockToMarkdown(block, properties)
      return `${md}\n\n`
    })
  )
  return mds.join("")
}

const getblockMap = async (contentIds: string[]) => {
  const info = await getAxiosNotion()
  if (!info) {
    throw Error("The pageId does not exist in the current path")
  }
  const [axiosNotion, spaceId] = info
  const blocks = await axiosNotion
    .post("/syncRecordValues", {
      requests: contentIds.map((id) => ({
        pointer: { table: "block", id, spaceId },
        version: -1
      }))
    })
    .then((r) => r.data?.recordMap?.block)
  return blocks
}

const blockToMarkdown = async (block: any, properties: Properties) => {
  switch (block.type) {
    case "text":
      return converterText(block, properties)
    case "code":
      return converterCode(block, properties)
    case "callout":
      return converterCallout(block, properties)
    case "image":
      return converterImage(block, properties)
    case "bookmark":
      return converterBookmark(block, properties)
    case "bulleted_list":
      return converterBulletedList(block, properties)
    case "page":
      return converterPage(block, properties)
    case "column_list":
      return converterColumnList(block, properties)
    case "embed":
      return converterEmbed(block, properties)
    case "equation":
      return converterEquation(block, properties)
    case "header":
      return converterHeader(block, 1, properties)
    case "sub_header":
      return converterHeader(block, 2, properties)
    case "sub_sub_header":
      return converterHeader(block, 3, properties)
    case "external_object_instance":
      return converterLinkPreview(block, properties)
    case "numbered_list":
      return converterNumberedList(block, properties)
    case "quote":
      return converterQuote(block, properties)
    case "table":
      return converterTable(block, properties)
    case "to_do":
      return converterTodo(block, properties)
    case "toggle":
      return converterToggle(block, properties)
    case "video":
      return converterVideo(block, properties)
    case "ai_block":
      return converteAiBlock(block, properties)
    case "table_of_contents":
      return "[toc]"

    case "pdf":
    case "file":
    case "collection_view": // Child database
    case "transclusion_reference": // Synced block
    case "breadcrumb":
    case "button":
    default:
      return ""
  }
}

const convertePreamble = ({ preamble }: Properties) => {
  if (!preamble) return ""
  return Array.from({ length: preamble })
    .map(() => "\t")
    .join("")
}

const converteBlockContent = async (block: any, properties: Properties) => {
  const contentIds = block.content as string[]
  if (!contentIds?.length) return ""

  const blocks = await getblockMap(contentIds)
  const md = await blocksToMarkdown(contentIds, blocks, properties)
  return md
}

const converteAiBlock = async (block: any, properties: Properties) => {
  const s: string[] = []

  const title = titleToMarkdown(block.properties?.title)
  if (title) s.push(title)
  const md = await converteBlockContent(block, properties)
  if (md) s.push(md)

  return `${convertePreamble(properties)}${s.join("\n\n")}`
}

const converterVideo = async (block: any, properties: Properties) => {
  const preamble = convertePreamble(properties)

  const source = titleToMarkdown(block.properties?.source)
  return `${preamble}[${source}](${source})`
}

const converterToggle = async (block: any, properties: Properties) => {
  const s: string[] = []

  const title = titleToMarkdown(block.properties?.title)
  if (title) s.push(`* ${title}`)
  const md = await converteBlockContent(block, {
    ...properties,
    preamble: properties.preamble + 1
  })
  if (md) s.push(md)

  return `${convertePreamble(properties)}${s.join("\n\n")}`
}

const converterTodo = async (block: any, properties: Properties) => {
  let content = ""

  const title = titleToMarkdown(block.properties?.title)
  const checked = titleToMarkdown(block.properties?.checked) === "Yes"

  content += convertePreamble(properties)
  if (checked) {
    content += `- [x] <s>${title}</s>`
  } else {
    content += `- [ ] ${title}`
  }

  const md = await converteBlockContent(block, {
    ...properties,
    preamble: properties.preamble + 1
  })
  if (md) content += `\n\n${md}`

  return content
}

const converterTable = async (block: any, properties: Properties) => {
  const contentIds = block.content as string[]
  const order: string[] = block.format?.table_block_column_order || []
  if (!contentIds?.length) return ""
  let content = ""
  content += convertePreamble(properties)
  content += `<section class="table-container"><table><tbody>`

  const blocks = await getblockMap(contentIds)

  content += contentIds.reduce((str, id) => {
    const block = blocks[id]?.value?.value
    if (block?.type !== "table_row") return str
    str += `<tr>`

    str += order
      .map((column) => {
        const title = titleToMarkdown(block.properties?.[column])
        return `<td>${title}</td>`
      })
      .join("")

    str += `</tr>`
    return str
  }, "")

  content += `</tbody></table></section>`

  return content
}

const converterQuote = async (block: any, properties: Properties) => {
  const s: string[] = []

  const title = titleToMarkdown(block.properties?.title)
  if (title) s.push(title)
  const md = await converteBlockContent(block, properties)
  if (md) s.push(md)

  return `${convertePreamble(properties)}<blockquote>${s.join("\n\n")}</blockquote>`
}

const converterNumberedList = async (block: any, properties: Properties) => {
  const title = titleToMarkdown(block.properties?.title)

  let content = `${convertePreamble(properties)}1. ${title}`

  const md = await converteBlockContent(block, {
    ...properties,
    preamble: properties.preamble + 1
  })
  if (md) content += `\n\n${md}`

  return content
}

const converterLinkPreview = async (block: any, properties: Properties) => {
  const source = block.format?.url || ""
  return `${convertePreamble(properties)}[${source}](${source})`
}

const converterHeader = async (
  block: any,
  level: number,
  properties: Properties
) => {
  let title = titleToMarkdown(block.properties?.title)
  switch (level) {
    case 1:
      title = `${convertePreamble(properties)}<h1>${title}</h1>`
      break
    case 2:
      title = `${convertePreamble(properties)}<h2>${title}</h2>`
      break
    case 3:
      title = `${convertePreamble(properties)}<h3>${title}</h3>`
      break

    default:
      break
  }
  const md = await converteBlockContent(block, properties)
  if (md) title += `\n\n${md}`

  return title
}

const converterEquation = async (block: any, properties: Properties) => {
  const title = titleToMarkdown(block.properties?.title)
  return `${convertePreamble(properties)}$$${title}$$`
}

const converterEmbed = async (block: any, properties: Properties) => {
  const source = titleToMarkdown(block.properties?.source)
  return `${convertePreamble(properties)}[${source}](${source})`
}

const converterColumnList = async (block: any, properties: Properties) => {
  const contentIds = block.content as string[]
  if (!contentIds?.length) return ""
  let content = ""
  content += convertePreamble(properties)
  content += `<section class="column_list">`

  const blocks = await getblockMap(contentIds)

  const mds: string[] = await Promise.all(
    contentIds.map(async (id) => {
      const block = blocks[id]?.value?.value
      if (block?.type !== "column") return ""
      const ratio = block.format.column_ratio || 0
      const md = await converteBlockContent(block, properties)
      return `<section class="column" style="flex: ${ratio};">${md}</section>`
    })
  )
  content += mds.join("")
  content += `</section>`

  return content
}

const converterPage = async (block: any, properties: Properties) => {
  let link: string = block.id || ""
  link = link.split("-").join("")
  const title = titleToMarkdown(block.properties?.title)
  const icon = block.format?.page_icon || ""
  if (!link) return ""

  return `${convertePreamble(properties)}[${icon} ${title}](https://www.notion.so/${link})`
}

const converterBulletedList = async (block: any, properties: Properties) => {
  const title = titleToMarkdown(block.properties?.title)

  let content = `${convertePreamble(properties)}- ${title}`

  const md = await converteBlockContent(block, {
    ...properties,
    preamble: properties.preamble + 1
  })
  if (md) content += `\n\n${md}`

  return content
}

const converterBookmark = async (block: any, properties: Properties) => {
  const link = titleToMarkdown(block.properties?.link)
  const title = titleToMarkdown(block.properties?.title)
  const icon = block.format?.bookmark_icon || ""
  return `${convertePreamble(properties)}[${icon} ${title}](${link})`
}

const converterImage = async (block: any, properties: Properties) => {
  const user = await getUserInfo()
  const format = block.format || {}
  let width = format.block_width || 640
  let title = titleToMarkdown(block.properties?.title)
  const source = format.display_source || block.properties?.source?.[0]?.[0]
  if (!source) return ""
  if (title === "Untitled") title = ""
  if (typeof width === "number") width = `${width}px`
  let content = ""
  let url = upgradeImgPath

  if (properties.isPlus) {
    url = `https://www.notion.so/image/${encodeURIComponent(source)}?table=block&id=${block.id}&spaceId=${block.space_id}&userId=${user.userId}&taskId=${properties.taskId}`
    try {
      const [pathname] = url.split("?")
      const extname = getExtname(pathname)

      const ret = await uploadFile(properties.taskId, {
        blockId: block.id,
        url,
        extname
      })
      url = ret.url
    } catch (error) {
      console.error(error)
    }
  }

  content += convertePreamble(properties)
  content += title
    ? `<figure><img width="${width}" src="${url}" alt="${title}"><figcaption>${title}</figcaption></figure>`
    : `<figure><img width="${width}" src="${url}" alt=""></figure>`

  return content
}

const converterCallout = async (block: any, properties: Properties) => {
  // const format = block.format || {}
  const title = titleToMarkdown(block.properties?.title)
  // return `${convertePreamble(properties)}<blockquote>${format.page_icon} ${title}</blockquote>`
  return `${convertePreamble(properties)}<blockquote>${title}</blockquote>`
}

const converterCode = async (block: any, properties: Properties) => {
  if (!block.properties) return ""
  let content = ""
  content += convertePreamble(properties)
  content += `<pre class="custom"><code class="hljs">`

  const lang = titleToMarkdown(block.properties?.language)
  const str = titleToMarkdown(block.properties?.title)
  if (lang && highlightjs.getLanguage(lang)) {
    try {
      const formatted = highlightjs
        .highlight(lang, str, true)
        .value.replace(/\n/g, "<br/>") // 换行用br表示
        .replace(/\s/g, "&nbsp;") // 用nbsp替换空格
        .replace(/span&nbsp;/g, "span ") // span标签修复
      content += formatted
    } catch (e) {
      console.log(e)
      content += markdownParser.utils.escapeHtml(str)
    }
  } else {
    content += markdownParser.utils.escapeHtml(str)
  }

  content += `</code></pre>`
  return content
}

const converterText = async (block: any, properties: Properties) => {
  return `${convertePreamble(properties)}${titleToMarkdown(block.properties?.title)}\n`
}
