import { getAxiosNotion, getUserInfo } from "./notion"
import { titleToMarkdown } from "./titleToMarkdown"

export const generateMarkdown = async () => {
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

  return blocksToMarkdown(contentIds, blocks)
}

export const blocksToMarkdown = async (contentIds: string[], blocks: any) => {
  const mds: string[] = await Promise.all(
    contentIds.map(async (id) => {
      const block = blocks[id]?.value?.value
      const md = await blockToMarkdown(block)
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

const blockToMarkdown = async (block: any) => {
  switch (block.type) {
    case "text":
      return converterText(block)
    case "code":
      return converterCode(block)
    case "callout":
      return converterCallout(block)
    case "image":
      return converterImage(block)
    case "bookmark":
      return converterBookmark(block)
    case "bulleted_list":
      return converterBulletedList(block)
    case "page":
      return converterPage(block)
    case "column_list":
      return converterColumnList(block)
    case "embed":
      return converterEmbed(block)
    case "equation":
      return converterEquation(block)
    case "header":
      return converterHeader(block, 1)
    case "sub_header":
      return converterHeader(block, 2)
    case "sub_sub_header":
      return converterHeader(block, 3)
    case "external_object_instance":
      return converterLinkPreview(block)
    case "numbered_list":
      return converterNumberedList(block)
    case "quote":
      return converterQuote(block)
    case "table":
      return converterTable(block)
    case "to_do":
      return converterTodo(block)
    case "toggle":
      return converterToggle(block)
    case "video":
      return converterVideo(block)
    case "ai_block":
      return converteAiBlock(block)
    case "table_of_contents":
      return "[TOC]"

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

const converteAiBlock = async (block: any) => {
  let title = block.properties?.title || ""

  if (title) title = titleToMarkdown(block.properties.title)
  const contentIds = block.content as string[]

  if (contentIds?.length) {
    console.log("converteAiBlock", contentIds)
    const blocks = await getblockMap(contentIds)
    const md = await blocksToMarkdown(contentIds, blocks)
    title += "\n" + md
  }

  return title
}

const converterVideo = async (block: any) => {
  const source = titleToMarkdown(block.properties.source)
  return `[${source}](${source})`
}

const converterToggle = async (block: any) => {
  let title = titleToMarkdown(block.properties.title)
  const contentIds = block.content as string[]

  if (contentIds?.length) {
    console.log("converterToggle", contentIds)
    const blocks = await getblockMap(contentIds)
    const md = await blocksToMarkdown(contentIds, blocks)
    title += `\n<blockquote>${md}</blockquote>`
  }

  return `${title}`
}

const converterTodo = async (block: any) => {
  const title = titleToMarkdown(block.properties.title)
  const checked = titleToMarkdown(block.properties.checked) === "Yes"
  if (checked) {
    return `- [x] <s>${title}</s>`
  }
  return `- [ ] ${title}`
}

const converterTable = async (block: any) => {
  const contentIds = block.content as string[]
  const table_block_column_order = block.format?.table_block_column_order || []
  if (!contentIds?.length) return ""

  console.log("converterTable", contentIds)
  const blocks = await getblockMap(contentIds)
  const md = await blocksToMarkdown(contentIds, blocks)
  return md
}

const converterQuote = async (block: any) => {
  let title = titleToMarkdown(block.properties.title)
  const contentIds = block.content as string[]
  if (contentIds?.length) {
    console.log("converterQuote", contentIds)
    const blocks = await getblockMap(contentIds)
    const md = await blocksToMarkdown(contentIds, blocks)
    title += "\n" + md
  }

  return `<blockquote>${title}</blockquote>`
}

const converterNumberedList = async (block: any) => {
  const title = titleToMarkdown(block.properties.title)
  return `1. ${title}`
}

const converterLinkPreview = async (block: any) => {
  const source = block.format?.url || ""
  return `[${source}](${source})`
}

const converterHeader = async (block: any, level: number) => {
  let title = titleToMarkdown(block.properties.title)
  const contentIds = block.content as string[]
  switch (level) {
    case 1:
      title = `<h1>${title}</h1>`
      break
    case 2:
      title = `<h2>${title}</h2>`
      break
    case 3:
      title = `<h3>${title}</h3>`
      break

    default:
      break
  }
  if (contentIds?.length) {
    console.log("converterQuote", contentIds)
    const blocks = await getblockMap(contentIds)
    const md = await blocksToMarkdown(contentIds, blocks)
    title += `\n<blockquote>${md}</blockquote>`
  }

  return title
}

const converterEquation = async (block: any) => {
  const title = titleToMarkdown(block.properties.title)
  return `$$${title}$$`
}

const converterEmbed = async (block: any) => {
  const source = titleToMarkdown(block.properties.source)
  return `[${source}](${source})`
}

const converterColumnList = async (block: any) => {
  const contentIds = block.content as string[]
  if (!contentIds?.length) return ""
  console.log("converterColumnList", contentIds)

  const blocks = await getblockMap(contentIds)

  if (contentIds.length === 2) {
    const [left, right] = contentIds
    const leftMd = await blocksToMarkdown([left], blocks)
    const rightMd = await blocksToMarkdown([right], blocks)
    return `
:::: column
::: column-left

${leftMd}

:::
::: column-right

${rightMd}

:::
::::
`
  }

  return blocksToMarkdown(contentIds, blocks)
}

const converterPage = async (block: any) => {
  let link: string = block.id || ""
  link = link.split("-").join("")
  const title = titleToMarkdown(block.properties.title)
  const icon = block.format?.page_icon || ""
  if (!link) return ""

  return `[${icon} ${title}](https://www.notion.so/${link})`
}

const converterBulletedList = async (block: any) => {
  const title = titleToMarkdown(block.properties.title)
  return `- ${title}`
}

const converterBookmark = async (block: any) => {
  const link = titleToMarkdown(block.properties.link)
  const title = titleToMarkdown(block.properties.title)
  const icon = block.format?.bookmark_icon || ""
  return `[${icon} ${title}](${link})`
}

const converterImage = async (block: any) => {
  const user = await getUserInfo()
  const format = block.format || {}
  const block_width = format.block_width || 640
  let title = titleToMarkdown(block.properties.title)
  const source = format.display_source || block.properties.source?.[0]?.[0]
  if (!source) return ""
  if (title === "Untitled") title = ""
  const url = `https://www.notion.so/image/${encodeURIComponent(source)}?table=block&id=${block.id}&spaceId=${block.space_id}&width=${block_width}&userId=${user.userId}`
  return title
    ? `<figure><img src="${url}" alt="${title}"><figcaption>${title}</figcaption></figure>`
    : `<figure><img src="${url}" alt=""></figure>`
}

const converterCallout = (block: any) => {
  const format = block.format || {}
  const title = titleToMarkdown(block.properties.title)
  return `<blockquote>${format.page_icon} ${title}</blockquote>`
}

const converterCode = (block: any) => {
  if (!block.properties) return ""
  const language = block.properties.language[0][0]
  const title = block.properties.title[0][0]
  return `\`\`\`${language}
${title}
\`\`\``
}

const converterText = (block: any) => {
  if (!block.properties) return ""
  return `${titleToMarkdown(block.properties.title)}\n`
}
