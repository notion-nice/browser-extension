import axios, { type AxiosInstance } from "axios"
import Cookies from "js-cookie"
import { v4 as uuid } from "uuid"

import { getAxiosNotion, getUserInfo } from "~lib/notion"
import { getPayment, prices } from "~lib/stripe"

import { LAYOUT_ID, SHADOW_HOST_ID, upgradeImgPath } from "./constant"
import { copyTextToClipboard, solveHtml, solveWeChatMath } from "./converter"
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

const pageMap = new Map<string, MapInfo>()
const userMap = new Map<string, UserInfo>()

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

export const HTMLToMD = async (taskId: string, input: string) => {
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
    const map = await syncRecordValues(taskId, imgIds)
    map.forEach(({ blockId, content, url }) => {
      const imgEl = doc.getElementById(blockId)
      imgEl.innerHTML = `<img src="${url}" alt="${content}">`
    })
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
    const map = await syncRecordValues(taskId, equationIds)
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
    const map = await syncRecordValues(taskId, textEquationIds)
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

export const copyToWechat = async () => {
  const shadowRoot = document.getElementById(SHADOW_HOST_ID)?.shadowRoot
  if (!shadowRoot) {
    console.error("shadowRoot 不存在")
    throw Error("复制失败")
  }
  const layout = shadowRoot.getElementById(LAYOUT_ID) // 保护现场
  if (!layout) {
    console.error("layout 不存在")
    throw Error("复制失败")
  }
  const html = layout.innerHTML
  solveWeChatMath()
  const cpoyHtml = await solveHtml()
  try {
    await copyTextToClipboard(cpoyHtml)
  } catch (error) {
    throw Error("复制失败")
  } finally {
    layout.innerHTML = html // 恢复现场
  }
}

export const getComboPrice = async () => {
  const ret = await prices()
  if (ret.ok) {
    return ret.price.unit_amount / 100
  }
  return 0
}

export const generatePaymentUrl = async () => {
  const user = await getUserInfo()

  const ret = await getPayment(user.customerId)
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

export const syncRecordValuesByPage = async () => {
  const info = await getAxiosNotion()
  if (!info) {
    throw Error("The pageId does not exist in the current path")
  }
  const [axiosNotion, spaceId, pageId] = info
  const ret = await axiosNotion
    .post("/syncRecordValues", {
      requests: [
        {
          pointer: { table: "block", id: pageId, spaceId },
          version: -1
        }
      ]
    })
    .then((r) => r.data)
  console.log("syncRecordValuesByPage", ret)
}

const syncRecordValues = async (taskId: string, blockIds: string[]) => {
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
          const url = `https://www.notion.so/image/${encodeURIComponent(source)}?table=block&id=${key}&spaceId=${spaceId}&width=480&userId=${userId}&taskId=${taskId}`
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
