import axios, { type AxiosInstance } from "axios"
import Cookies from "js-cookie"

type MapInfo = [AxiosInstance, string, string]
type UserInfo = {}
type ExportBlockRet = { exportURL: string; taskId: string; pageId: string }
type ExportOptions = {
  exportType: "markdown" | "html"
  includeContents?: "no_files"
}

const notionClientVersion = "23.13.0.109"
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
