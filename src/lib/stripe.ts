import axios from "axios"

import { PlusIcon, ProIcon } from "~components/icon"
import type { ButtonProps } from "~components/ui/button"

export interface ComboInfo {
  icon?: JSX.Element
  label: string
  price: number
  btnProps: ButtonProps
  description: string
  btnText: string
  featureList: string[]
  hint?: Array<{ href: string; label: string }>
}

let notionClientVersion = "23.13.0.146"
let comboMap: Record<"free" | "plus" | "pro", ComboInfo> | null = null

const axiosNotion = axios.create({
  baseURL: `${process.env.PLASMO_PUBLIC_STRIPE_HOST}/api/stripe`,
  headers: {
    "Content-Type": "application/json"
  }
})

export const createCustomer = (data: any) =>
  axiosNotion.post(`/customer`, data).then((r) => r.data)

export const getPayment = (userId: string) =>
  axiosNotion.post(`/payment/${userId}`).then((r) => r.data)

export const prices = () => axiosNotion.post(`/prices`).then((r) => r.data)

export const getBaseInfo = async () => {
  if (comboMap && notionClientVersion) return { comboMap, notionClientVersion }
  const ret = await axiosNotion.post(`/base`).then((r) => r.data)
  notionClientVersion = ret.notionClientVersion
  comboMap = {
    free: {
      label: "免费套餐",
      price: 0,
      btnProps: { variant: "outline", disabled: true },
      btnText: "您当前的免费计划",
      description: " 适用于刚开始使用Notion Nice的人",
      featureList: ret.comboList.free
    },
    plus: {
      icon: PlusIcon,
      label: "NotionNice Plus",
      price: 0,
      btnText: "升级至Plus",
      btnProps: { variant: "default", disabled: false },
      description: "免费版的所有内容，再加上：",
      featureList: ret.comboList.plus
    },
    pro: {
      icon: ProIcon,
      label: "NotionNice AI",
      price: 0,
      btnText: "功能开发中",
      btnProps: { variant: "default", disabled: true },
      description: "包含 Plus 中的所有内容，以及：",
      featureList: ret.comboList.pro
    }
  }
  return { comboMap, notionClientVersion }
}
