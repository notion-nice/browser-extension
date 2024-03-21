import { ReloadIcon } from "@radix-ui/react-icons"
import { useLocalStorageState, useMount, useUpdate } from "ahooks"
import React, { useEffect, useMemo, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { cn } from "~lib/utils"
import TEMPLATE from "~template"
import { sleep } from "~utility"
import {
  BOX_ID,
  LAYOUT_ID,
  MARKDOWN_THEME_ID,
  SHADOW_HOST_ID,
  STYLE,
  TEMPLATE_NUM,
  TEMPLATE_OPTIONS,
  upgradeImgPath
} from "~utils/constant"
import { parseLinkToFoot } from "~utils/converter"
import { parserMarkdown, replaceStyle } from "~utils/helper"
import {
  copyToWechat,
  exportBlock,
  getUserInfo,
  HTMLToMD,
  syncRecordValuesByPage
} from "~utils/notion"

import { Button } from "./ui/button"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
} from "./ui/menubar"
import { useToast } from "./ui/use-toast"
import { PlusSvg, Upgrade } from "./Upgrade"

export const Converter = () => {
  const { toast } = useToast()
  const update = useUpdate()
  const containerRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const previewWrapRef = useRef<HTMLDivElement>(null)
  const [isPlus, setIsPlus] = useState<boolean>(null)
  const [isDev, setIsDev] = useState<boolean>(null)
  const [open, setOpen] = useState(false)
  const [lookCss, setLookCss] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState(false)
  const [linkToFoot, setLinkToFoot] = useState(true)
  const [mdContent, setContent] = useState("")
  const [mdFootContent, setFootContent] = useState("")
  const [mdUrl, setUrl] = useState("")
  const [templateNum, setTemplateNum] = useLocalStorageState<number>(
    TEMPLATE_NUM,
    {
      defaultValue: 0,
      serializer: (v) => String(v) ?? "0",
      deserializer: (v) => parseInt(v, 10)
    }
  )

  const parseHtml = useMemo(() => {
    if (linkToFoot) {
      if (!mdFootContent) return ""
      return parserMarkdown(mdFootContent, mdUrl)
    }
    if (!mdContent) return ""
    return parserMarkdown(mdContent, mdUrl)
  }, [mdContent, mdFootContent, linkToFoot])

  useMount(() => {
    let timer = window.setInterval(() => {
      if (containerRef.current && timer) {
        update()
        window.clearInterval(timer)
        timer = null
      }
    }, 300)
  })

  useEffect(() => {
    const el = previewContainerRef.current
    if (el) {
      const onImgClick = (e: MouseEvent) => {
        const target: Element = e.target as any
        // 检查目标元素是否为图片元素
        if (target.tagName.toLowerCase() === "img") {
          const src = target.getAttribute("src")
          if (src === upgradeImgPath) {
            setOpen(true)
          }
        }
      }
      el.addEventListener("click", onImgClick)

      return () => {
        el?.removeEventListener("click", onImgClick)
      }
    }
  }, [])

  useEffect(() => {
    getUserInfo().then((user) => {
      setIsPlus(user.metadata?.plan_type === "plus")
      setIsDev(["mitnickseng@gmail.com"].includes(user.email))
    })
  }, [open])

  const setStyle = (style: string) => {
    window.localStorage.setItem(STYLE, style)
    replaceStyle(MARKDOWN_THEME_ID, style)
  }
  const regenerate = async () => {
    setLoading(true)

    try {
      const { exportURL, pageId, taskId } = await exportBlock({
        exportType: "html",
        includeContents: "no_files"
      })
      const resp = await sendToBackground({
        name: "html",
        body: { exportURL, pageId }
      })

      if (!resp.ok) {
        setLoading(false)
        console.error("exportBlock", resp.error)
        toast({ variant: "destructive", description: resp.error })
        return
      }

      const md = await HTMLToMD(taskId, resp.html)

      setUrl(resp.url)
      setContent(md)
      setFootContent(parseLinkToFoot(md))
      setLoading(false)
    } catch (error) {
      toast({ variant: "destructive", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const copyWechat = async () => {
    setCopying(true)
    try {
      await copyToWechat()
      await sleep(2 * 1000)
      toast({ description: "已复制，请到微信公众平台粘贴" })
    } catch (error) {
      toast({ variant: "destructive", description: "复制失败" })
    } finally {
      setCopying(false)
    }
  }
  const lookCssTheme = async (checked: boolean) => {
    setLookCss(checked)
    if (checked) {
      toast({ description: "功能开发中，敬请期待~" })
    }
  }
  const switchTheme = async (value: string) => {
    const index = parseInt(value, 10)
    const option = TEMPLATE_OPTIONS[index]
    if (!option.id) return
    if (option.id === "custom") {
      // 切换自定义自动打开css编辑
      // setStyleEditorOpen(true)
      toast({ description: "功能开发中，敬请期待~" })
    } else {
      setTemplateNum(index)
      setStyle(TEMPLATE.style[option.id])
    }
  }
  const onBilling = async () => {
    toast({ description: "功能开发中，敬请期待~" })
  }

  return (
    <div
      ref={containerRef}
      className="nf-flex nf-relative nf-flex-col nf-gap-2 w-full nf-h-full nf-overflow-hidden">
      {(loading || copying) && (
        <div className="nf-absolute nf-inset-0 nf-z-50 nf-bg-black/20 nf-flex nf-justify-center">
          <ReloadIcon className="nf-mt-11 nf-h-4 nf-w-4 nf-animate-spin" />
        </div>
      )}

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>文件</MenubarTrigger>
          <MenubarContent portalProps={{ container: containerRef.current }}>
            <MenubarItem onClick={regenerate} disabled={loading}>
              <ReloadIcon
                className={cn(
                  "nf-mr-2 nf-h-4 nf-w-4",
                  loading && "nf-animate-spin"
                )}
              />
              重新生成
            </MenubarItem>

            <MenubarSeparator />
            {isDev && (
              <MenubarSub>
                <MenubarSubTrigger>实验室</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem
                    onClick={() => {
                      console.log(mdContent)
                    }}>
                    查看MD内容
                  </MenubarItem>
                  <MenubarItem onClick={syncRecordValuesByPage}>
                    新版生成
                  </MenubarItem>
                  <MenubarItem onClick={syncRecordValuesByPage}>
                    微信支付
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            )}

            <MenubarCheckboxItem
              checked={linkToFoot}
              onCheckedChange={setLinkToFoot}>
              微信外链转脚注
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>主题</MenubarTrigger>
          <MenubarContent portalProps={{ container: containerRef.current }}>
            <MenubarRadioGroup
              value={String(templateNum)}
              onValueChange={switchTheme}>
              {TEMPLATE_OPTIONS.map((option, index) => (
                <MenubarRadioItem key={index} value={String(index)}>
                  {option.name}
                </MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={lookCss}
              onCheckedChange={lookCssTheme}>
              查看主题CSS
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>内容分发</MenubarTrigger>
          <MenubarContent portalProps={{ container: containerRef.current }}>
            <MenubarItem disabled={copying} onClick={copyWechat}>
              微信公众号
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>账户</MenubarTrigger>
          <MenubarContent portalProps={{ container: containerRef.current }}>
            <MenubarItem onClick={() => setOpen(true)}>查看套餐</MenubarItem>
            <MenubarItem onClick={onBilling}>管理我的订阅</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <div className="nf-flex-1"></div>
        {isPlus !== null && !isPlus && (
          <Button variant="marked" onClick={() => setOpen(true)}>
            {PlusSvg}
            <span className="nf-ml-1">升级到Plus</span>
          </Button>
        )}
      </Menubar>

      <div
        id={BOX_ID}
        ref={previewContainerRef}
        className="nf-w-full nf-relative nf-px-2 nf-flex-1 nf-overflow-y-auto">
        {parseHtml ? (
          <section
            id={LAYOUT_ID}
            ref={previewWrapRef}
            className="nf-w-full nf-h-full"
            data-tool="NotionFlink Preview"
            data-website="https://notion.flink.top"
            dangerouslySetInnerHTML={{ __html: parseHtml }}
          />
        ) : (
          !loading && (
            <div className="nf-absolute nf-inset-0 nf-mt-6 nf-flex nf-justify-center">
              <Button onClick={regenerate}>立刻生成</Button>
            </div>
          )
        )}
      </div>

      <Upgrade
        open={open}
        onOpenChange={setOpen}
        portalProps={{ container: containerRef.current }}
      />
    </div>
  )
}
