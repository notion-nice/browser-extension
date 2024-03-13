import { useMount } from "ahooks"
import React, { useState } from "react"

import { generatePaymentUrl, getComboPrice, getUserInfo } from "~utils/notion"

import { Button, type ButtonProps } from "./ui/button"
import { Dialog, DialogContent, type DialogContentProps } from "./ui/dialog"
import { useToast } from "./ui/use-toast"

export const PlusSvg: JSX.Element = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="icon-md nf-text-green-600">
    <path
      d="M8.78158 8.60266L9.8188 5.49098C10.037 4.83634 10.963 4.83634 11.1812 5.49098L12.2184 8.60266C12.7187 10.1035 13.8965 11.2813 15.3973 11.7816L18.509 12.8188C19.1637 13.037 19.1637 13.963 18.509 14.1812L15.3973 15.2184C13.8965 15.7187 12.7187 16.8965 12.2184 18.3973L11.1812 21.509C10.963 22.1637 10.037 22.1637 9.8188 21.509L8.78158 18.3973C8.28128 16.8965 7.10354 15.7187 5.60266 15.2184L2.49098 14.1812C1.83634 13.963 1.83634 13.037 2.49098 12.8188L5.60266 11.7816C7.10354 11.2813 8.28128 10.1035 8.78158 8.60266Z"
      fill="currentColor"></path>
    <path
      d="M17.1913 3.69537L17.6794 2.23105C17.7821 1.92298 18.2179 1.92298 18.3206 2.23105L18.8087 3.69537C19.0441 4.40167 19.5983 4.9559 20.3046 5.19133L21.769 5.67944C22.077 5.78213 22.077 6.21787 21.769 6.32056L20.3046 6.80867C19.5983 7.0441 19.0441 7.59833 18.8087 8.30463L18.3206 9.76895C18.2179 10.077 17.7821 10.077 17.6794 9.76895L17.1913 8.30463C16.9559 7.59833 16.4017 7.0441 15.6954 6.80867L14.231 6.32056C13.923 6.21787 13.923 5.78213 14.231 5.67944L15.6954 5.19133C16.4017 4.9559 16.9559 4.40167 17.1913 3.69537Z"
      fill="currentColor"></path>
  </svg>
)

const AISvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    className="icon-md nf-text-blue-600"
    width="16"
    height="16">
    <path
      d="M12.784 1.442a.8.8 0 0 0-1.569 0l-.191.953a.8.8 0 0 1-.628.628l-.953.19a.8.8 0 0 0 0 1.57l.953.19a.8.8 0 0 1 .628.629l.19.953a.8.8 0 0 0 1.57 0l.19-.953a.8.8 0 0 1 .629-.628l.953-.19a.8.8 0 0 0 0-1.57l-.953-.19a.8.8 0 0 1-.628-.629l-.19-.953h-.002ZM5.559 4.546a.8.8 0 0 0-1.519 0l-.546 1.64a.8.8 0 0 1-.507.507l-1.64.546a.8.8 0 0 0 0 1.519l1.64.547a.8.8 0 0 1 .507.505l.546 1.641a.8.8 0 0 0 1.519 0l.546-1.64a.8.8 0 0 1 .506-.507l1.641-.546a.8.8 0 0 0 0-1.519l-1.64-.546a.8.8 0 0 1-.507-.506L5.56 4.546Zm5.6 6.4a.8.8 0 0 0-1.519 0l-.147.44a.8.8 0 0 1-.505.507l-.441.146a.8.8 0 0 0 0 1.519l.44.146a.8.8 0 0 1 .507.506l.146.441a.8.8 0 0 0 1.519 0l.147-.44a.8.8 0 0 1 .506-.507l.44-.146a.8.8 0 0 0 0-1.519l-.44-.147a.8.8 0 0 1-.507-.505l-.146-.441Z"
      fill="currentColor"></path>
  </svg>
)

interface ComboInfo {
  icon?: JSX.Element
  label: string
  price: number
  btnProps: ButtonProps
  description: string
  btnText: string
  featureList: string[]
  hint?: Array<{ href: string; label: string }>
}
const freeInfo: ComboInfo = {
  label: "免费套餐",
  price: 0,
  btnProps: { variant: "outline", disabled: true },
  btnText: "您当前的免费计划",
  description: " 适用于刚开始使用Notion Nice的人",
  featureList: [
    "嵌入在文章的TOC功能",
    "无图片文章的排版生成",
    "复制生成排版到公号"
  ]
}
const defaultPlusInfo: ComboInfo = {
  icon: PlusSvg,
  label: "NotionNice Plus",
  price: 0,
  btnText: "升级至Plus",
  btnProps: { variant: "default", disabled: false },
  description: "免费版的所有内容，再加上：",
  featureList: ["无图片限制的文章排版生成", "访问额外的实验性功能"]
}
const defaultAIInfo: ComboInfo = {
  icon: AISvg,
  label: "NotionNice AI",
  price: 0,
  btnText: "功能开发中",
  btnProps: { variant: "default", disabled: true },
  description: "包含 Plus 中的所有内容，以及：",
  featureList: ["使用 Harvest 快速收藏并分析文章", "访问额外的AI实验性功能"]
}
type UpgradeProps = Pick<DialogContentProps, "portalProps"> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const Upgrade = ({ open, portalProps, onOpenChange }: UpgradeProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [comboList, setComboList] = useState<ComboInfo[]>([
    freeInfo,
    defaultPlusInfo
  ])

  const generateComboList = async () => {
    const user = await getUserInfo()
    const plusInfo: ComboInfo = { ...defaultPlusInfo }
    const isPlus = user.metadata?.plan_type === "plus"
    plusInfo.price = await getComboPrice()
    plusInfo.btnProps.onClick = () => {
      setLoading(true)
      generatePaymentUrl()
        .then((paymentUrl) => {
          window.location.href = paymentUrl
        })
        .catch((error) => {
          generateComboList()
          toast({ variant: "destructive", description: error.message })
        })
        .finally(() => {
          setLoading(false)
        })
    }

    if (isPlus) {
      plusInfo.btnText = "你当前的套餐"
      plusInfo.btnProps = {
        variant: "default",
        disabled: true
      }

      setComboList([plusInfo, defaultAIInfo])
      return
    }
    setComboList([freeInfo, plusInfo])
  }

  useMount(generateComboList)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!nf-w-[640px] !nf-p-0 !nf-gap-0"
        portalProps={portalProps}>
        <div className="nf-flex nf-w-full nf-flex-row nf-items-center nf-justify-between nf-border-b nf-px-8 nf-py-6 ">
          <span className="nf-text-xl nf-font-medium">您的套餐</span>
        </div>
        <div className="nf-flex nf-flex-col md:nf-flex-row">
          {comboList.map((combo, inx) => (
            <div
              key={inx}
              className="nf-text-sm nf-relative nf-flex-1 nf-flex nf-gap-5 nf-flex-col nf-border-t nf-py-4 nf-px-6 md:nf-border-r last:nf-border-r-0 md:nf-border-t-0 md:nf-max-w-xs">
              <div className="nf-relative nf-flex nf-flex-col">
                <div className="nf-flex nf-flex-col nf-gap-1">
                  <p className="nf-flex nf-items-center nf-gap-2 nf-text-xl nf-font-medium">
                    {combo.icon}
                    {combo.label}
                  </p>
                  <div className="nf-flex nf-items-baseline nf-gap-[6px]">
                    <p className="nf-text-base nf-font-light nf-text-foreground">
                      每年 HK${combo.price}
                    </p>
                  </div>
                </div>
              </div>
              <div className="nf-relative nf-flex nf-flex-col">
                <Button {...combo.btnProps} loading={loading}>
                  {combo.btnText}
                </Button>
              </div>
              <div className="nf-flex nf-flex-col nf-flex-grow nf-gap-2">
                <div className="nf-relative nf-flex nf-flex-col">
                  <p className="nf-font-medium">{combo.description}</p>
                </div>
                {combo.featureList.map((feature) => (
                  <div key={feature} className="nf-relative">
                    <div className="nf-flex nf-justify-start nf-gap-2">
                      <div className="nf-w-8 nf-flex-shrink-0">
                        <svg
                          stroke="currentColor"
                          fill="none"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="nf-mr-2 nf-mt-1 nf-h-4 nf-w-4"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative flex flex-col nf-bg-primary text-xs text-token-text-secondary">
                {!!combo.hint?.length &&
                  combo.hint.map((hint, key) => (
                    <div key={key}>
                      <a
                        target="_blank"
                        className="font-medium underline"
                        href={hint.href}>
                        {hint.label}
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
