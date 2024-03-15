import axios, { type AxiosInstance } from "axios"
import Cookies from "js-cookie"
import { v4 as uuid } from "uuid"

import { sendToBackground } from "@plasmohq/messaging"

import sitdownConverter from "./sitdownConverter"

type MapInfo = [AxiosInstance, string, string]
type UserInfo = {
  userId: string
  customerId: string
  email: string
  name: string
  metadata: any
}
type ExportBlockRet = { exportURL: string; taskId: string; pageId: string }
type ExportOptions = {
  exportType: "markdown" | "html"
  includeContents?: "no_files"
}

const notionClientVersion = "23.13.0.109"
const pageMap = new Map<string, MapInfo>()
const userMap = new Map<string, UserInfo>()

const upgradeImgPath = chrome.runtime.getURL("assets/upgrade.png")

export const exportBlock = (options: ExportOptions) =>
  new Promise<ExportBlockRet>(async (resolve, reason) => {
    const info = await getAxiosNotion()
    if (!info) {
      reason(Error("The pageId does not exist in the current path"))
      return
    }
    const [axiosNotion, spaceId, pageId] = info

    const ret = await axiosNotion.post("/enqueueTask", {
      task: {
        eventName: "exportBlock",
        request: {
          block: { id: pageId, spaceId },
          recursive: false,
          exportOptions: {
            ...options,
            timeZone: "Asia/Shanghai",
            locale: "en",
            // includeContents: "no_files",
            collectionViewExportType: "currentView"
          },
          shouldExportComments: false
        }
      }
    })

    let is_task_in_progress = true

    const taskId = ret.data.taskId

    while (is_task_in_progress) {
      const ret = await axiosNotion.post("/getTasks", {
        taskIds: [taskId]
      })
      const results = ret.data.results
      if (results[0].state === "success") {
        is_task_in_progress = false
        resolve({ exportURL: results[0].status.exportURL, pageId, taskId })
      } else if (results[0].state === "failure") {
        is_task_in_progress = false
        console.error("exportBlock", results[0].error)
        reason(Error(String(results[0].error)))
      } else {
        // cbs.in_progress && (await cbs.in_progress(results[0]));
      }
    }
  })

export const HTMLToMD = async (pageId: string, input: string) => {
  const user = await getUserInfo()
  const isPlus = user.metadata?.plan_type === "plus"
  // 创建一个DOMParser实例
  const parser = new DOMParser()

  // 使用DOMParser解析HTML字符串
  const doc = parser.parseFromString(input, "text/html")
  const imgIds = []

  doc
    .querySelectorAll("article .page-body figure.image")
    .forEach((imgEl: HTMLElement) => {
      const blockId = imgEl.id
      imgEl.innerHTML = `<img src="${upgradeImgPath}">`
      imgIds.push(blockId)
    })

  if (imgIds.length && isPlus) {
    const files = await syncRecordValues(imgIds)
    const ret = await sendToBackground({
      name: "cos",
      body: { pageId, files }
    })
    if (ret.ok) {
      ret.files.forEach(({ blockId, content, url }) => {
        const imgEl = doc.getElementById(blockId)
        imgEl.innerHTML = `<img src="${url}" alt="${content}">`
      })
    }
  }

  const equationIds = []
  const equationMap: Array<{ key: string; content: string }> = []
  doc
    .querySelectorAll("article .page-body figure.equation")
    .forEach((el: HTMLElement) => {
      equationIds.push(el.id)
      el.innerHTML = `<a href="#">${el.id}</a>`
    })

  if (equationIds.length) {
    const map = await syncRecordValues(equationIds)
    map.forEach(({ blockId, content }) => {
      equationMap.push({ key: `[${blockId}](#)`, content })
    })
  }

  const textEquationIds = []
  const textEquationMap: Array<{ key: string; content: string }> = []
  doc
    .querySelectorAll("article .page-body .notion-text-equation-token")
    .forEach((el: HTMLElement) => {
      const id = getParentElementId(el)
      if (id) textEquationIds.push(id)
    })
  if (textEquationIds.length) {
    const map = await syncRecordValues(textEquationIds)
    map.forEach(({ blockId, content, maps }) => {
      const el = doc.getElementById(blockId)
      el.innerHTML = `<p>${content}</p>`
      textEquationMap.push(...Object.keys(maps).map((k) => maps[k]))
    })
  }

  const article = doc.querySelector("article .page-body").innerHTML

  let md = sitdownConverter.GFM(article)

  textEquationMap.map(({ key, content }) => {
    md = md.replace(key, `$${content}$`)
  })

  equationMap.map(({ key, content }) => {
    md = md.replace(key, `$$\n${content}\n$$`)
  })

  return md
}

export const getUserInfo = async () => {
  const [axiosNotion, userId] = getAxiosNotionByUser()

  if (userMap.has(userId)) {
    return userMap.get(userId)
  }

  const user = await axiosNotion
    .post("/getSpaces")
    .then((r) => r.data?.[userId]?.notion_user?.[userId]?.value?.value)

  const ret = await sendToBackground({
    name: "customer",
    body: {
      userId: user.id,
      email: user.email,
      name: user.name
    }
  })

  if (ret.ok) {
    userMap.set(userId, {
      ...user,
      ...ret.customer,
      userId,
      customerId: ret.customer.id
    })
  } else {
    userMap.set(userId, { ...user, id: userId })
  }

  return userMap.get(userId)
}

export const getComboPrice = async () => {
  const ret = await sendToBackground({ name: "prices" })
  if (ret.ok) {
    return ret.price.unit_amount / 100
  }
  return 0
}

export const generatePaymentUrl = async () => {
  const user = await getUserInfo()

  const ret = await sendToBackground({
    name: "payment",
    body: { userId: user.customerId }
  })
  if (!ret.ok) {
    if (ret.customer) {
      userMap.set(user.userId, {
        ...user,
        ...ret.customer,
        userId: user.userId,
        customerId: ret.customer.id
      })
      throw Error("你当前已经开通了会员，无需再次购买")
    }
    throw Error(ret.error.message)
  }
  return ret.url as string
}

const getParentElementId = (el: HTMLElement) => {
  if (!el.parentElement) return null
  if (el.parentElement?.id) {
    return el.parentElement.id
  }
  return getParentElementId(el.parentElement)
}

const syncRecordValues = async (blockIds: string[]) => {
  const userId: string = Cookies.get("notion_user_id")
  const info = await getAxiosNotion()
  if (!info) {
    throw Error("The pageId does not exist in the current path")
  }
  const [axiosNotion, spaceId, pageId] = info
  const ret = await axiosNotion
    .post("/syncRecordValues", {
      requests: blockIds.map((id) => ({
        pointer: { table: "block", id, spaceId },
        version: -1
      }))
    })
    .then((r) => r.data)
  const block = ret.recordMap?.block || {}
  return blockIds
    .map((key) => {
      if (!block[key]) return
      const maps: any = {}
      const flatTitle = (val: any) => {
        if (!val) return ""
        if (val instanceof Array) {
          return val
            .map((item) => {
              if (item[0] == "⁍") {
                if (item[1] instanceof Array) {
                  return item[1].map((i) => {
                    if (i[0] == "e") {
                      const id = [key, uuid()].join("-")
                      maps[id] = { key: `[${id}](#)`, content: i[1] }
                      return `<a href="#">${id}</a>`
                    }
                    return flatTitle(i)
                  })
                }
                return flatTitle(item[1])
              }
              return flatTitle(item)
            })
            .join("")
        }
        return val
      }

      const info = block[key].value?.value || {}
      const title = flatTitle(info.properties?.title) || ""
      const source: string = info.properties?.source?.[0]?.[0]

      switch (info.type) {
        case "image":
          if (!source) return
          const url = `https://www.notion.so/image/${encodeURIComponent(source)}?table=block&id=${key}&spaceId=${spaceId}&width=480&userId=${userId}`
          return {
            blockId: key,
            url,
            maps,
            content: title === "Untitled" ? "" : title
          }
        case "equation":
          if (!title) return
          return { blockId: key, content: title, maps, url: "" }
        case "text":
          if (!title) return
          return { blockId: key, content: title, maps, url: "" }
        default:
          return
      }
    })
    .filter(Boolean)
}

const getAxiosNotion = async () => {
  const [axiosNotion, userId] = getAxiosNotionByUser()

  const pageId = extractNotionPageId(window.location.href)
  if (!pageId) return undefined

  if (pageMap.has(pageId)) {
    return pageMap.get(pageId)
  }
  const res = await axiosNotion.post("/getBacklinksForBlock", {
    block: { id: pageId }
  })
  let spaceId = ""
  if (!!res.data.recordMap.space) {
    spaceId = Object.keys(res.data.recordMap.space)[0]
  } else {
    // res.data.recordMap.space 不存在的時候需要請求其他API以获取spaceId
    const res = await axiosNotion.post("/getPublicPageData", {
      type: "block-space",
      name: "page",
      blockId: pageId,
      requestedOnPublicDomain: false,
      showMoveTo: false,
      saveParent: false,
      shouldDuplicate: false,
      projectManagementLaunch: false,
      configureOpenInDesktopApp: false,
      mobileData: {
        isPush: false
      }
    })
    spaceId = res.data.spaceId
  }

  const _axiosNotion = axios.create({
    baseURL: "https://www.notion.so/api/v3",
    headers: {
      "Notion-Audit-Log-Platform": "web",
      "Notion-Client-Version": notionClientVersion,
      "X-Notion-Active-User-Header": userId,
      "X-Notion-Space-Id": spaceId
    }
  })

  pageMap.set(pageId, [_axiosNotion, spaceId, pageId])

  return pageMap.get(pageId)
}

const getAxiosNotionByUser = () => {
  const userId: string = Cookies.get("notion_user_id")

  const axiosNotion = axios.create({
    baseURL: "https://www.notion.so/api/v3",
    headers: {
      "Notion-Audit-Log-Platform": "web",
      "Notion-Client-Version": notionClientVersion,
      "X-Notion-Active-User-Header": userId
    }
  })

  return [axiosNotion, userId] as const
}

function extractNotionPageId(url: string): string | null {
  // 尝试匹配直接在路径中的页面ID
  const directMatch = url.match(/notion\.so\/.*?([a-f0-9]{32})/)
  if (directMatch && directMatch[1]) {
    return formatPageId(directMatch[1])
  }

  // 尝试匹配作为查询参数的页面ID
  const urlObj = new URL(url)
  const pageIdParam = urlObj.searchParams.get("p")
  if (pageIdParam) {
    return formatPageId(pageIdParam)
  }

  // 如果没有找到匹配项，返回null
  return null
}

// 新增一个函数来格式化页面ID
function formatPageId(pageId: string): string {
  // 使用正则表达式插入破折号
  return pageId.replace(
    /^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/,
    "$1-$2-$3-$4-$5"
  )
}
