import axios, { type AxiosInstance } from "axios"
import Cookies from "js-cookie"

import { createCustomer, getBaseInfo } from "./stripe"

type MapInfo = [AxiosInstance, string, string]
type UserInfo = {
  userId: string
  customerId: string
  email: string
  name: string
  metadata: any
}

const userMap = new Map<string, UserInfo>()
const pageMap = new Map<string, MapInfo>()

export const getAxiosNotion = async () => {
  const [axiosNotion, userId, notionClientVersion] =
    await getAxiosNotionByUser()

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

export const getUserInfo = async () => {
  const [axiosNotion, userId] = await getAxiosNotionByUser()

  if (userMap.has(userId)) {
    return userMap.get(userId)
  }

  const user = await axiosNotion
    .post("/syncRecordValues", {
      requests: [
        {
          pointer: {
            table: "notion_user",
            id: userId
          },
          version: -1
        },
        {
          pointer: {
            table: "user_settings",
            id: userId
          },
          version: -1
        },
        {
          pointer: {
            table: "user_root",
            id: userId
          },
          version: -1
        }
      ]
    })
    .then((r) => r.data?.recordMap?.notion_user?.[userId]?.value?.value)

  const ret = await createCustomer({
    userId: user.id,
    email: user.email,
    name: user.name
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

const getAxiosNotionByUser = async () => {
  const ret = await getBaseInfo()
  const userId: string = Cookies.get("notion_user_id")

  const axiosNotion = axios.create({
    baseURL: "https://www.notion.so/api/v3",
    headers: {
      "Notion-Audit-Log-Platform": "web",
      "Notion-Client-Version": ret.notionClientVersion,
      "X-Notion-Active-User-Header": userId
    }
  })

  return [axiosNotion, userId, ret.notionClientVersion] as const
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
