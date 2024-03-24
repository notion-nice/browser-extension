import { getAxiosNotion } from "./notion"

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

  const blocks = await axiosNotion
    .post("/syncRecordValues", {
      requests: contentIds.map((id) => ({
        pointer: { table: "block", id, spaceId },
        version: -1
      }))
    })
    .then((r) => r.data?.recordMap?.block)

  return blocksToMarkdown(contentIds, blocks)
}

export const blocksToMarkdown = async (contentIds: string[], blocks: any) => {
  let md = ""
  await Promise.all(
    contentIds.map(async (id) => {
      const block = blocks[id]?.value?.value
      md += blockToMarkdown(block)
    })
  )
  return md
}

const blockToMarkdown = (block: any) => {
  switch (block.type) {
    case "text":
      return converterText(block)
    case "code":
      return converterCode(block)

    default:
      return ""
  }
}

const converterCode = (block: any) => {
  if (!block.properties) return ""
  const language = block.properties.language[0][0]
  const title = block.properties.title[0][0]
  return `\`\`\`${language}
${title}
\`\`\`
`
}

const converterText = (block: any) => {
  if (!block.properties) return ""
  const title = block.properties.title[0][0]
  return `${title}\n`
}
