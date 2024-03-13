import { ReloadIcon } from "@radix-ui/react-icons"
import { useLocalStorageState, useMount, useUpdate } from "ahooks"
import React, { useEffect, useMemo, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { cn } from "~lib/utils"
import TEMPLATE from "~template"
import {
  BOX_ID,
  LAYOUT_ID,
  MARKDOWN_THEME_ID,
  SHADOW_HOST_ID,
  STYLE,
  TEMPLATE_NUM,
  TEMPLATE_OPTIONS
} from "~utils/constant"
import {
  copyTextToClipboard,
  parseLinkToFoot,
  solveHtml,
  solveWeChatMath
} from "~utils/converter"
import { parserMarkdown, replaceStyle } from "~utils/helper"
import { exportBlock, getUserInfo, HTMLToMD } from "~utils/notion"

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
    getUserInfo().then((user) => {
      setIsPlus(user.metadata?.plan_type === "plus")
    })
  }, [open])

  const setStyle = (style: string) => {
    window.localStorage.setItem(STYLE, style)
    replaceStyle(MARKDOWN_THEME_ID, style)
  }
  const regenerate = async () => {
    setLoading(true)

    try {
      const { exportURL, pageId } = await exportBlock({
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

      const md = await HTMLToMD(resp.html)

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
  // 旧版本的生成功能
  // const onClick = async () => {
  //   setLoading(true)
  //   try {
  //     const { exportURL, pageId } = await exportBlock({
  //       exportType: "markdown"
  //     })
  //     const resp = await sendToBackground({
  //       name: "converter",
  //       body: { exportURL, pageId }
  //     })
  //     setLoading(false)
  //     if (!resp.ok) {
  //       console.error("exportBlock", resp.error)
  //       toast({ variant: "destructive", description: resp.error })
  //       return
  //     }
  //     const md = resp.md.replace(/\!\[Untitled\]\(/g, "![](")

  //     setUrl(resp.url)
  //     setContent(md)
  //     setFootContent(parseLinkToFoot(md))
  //   } catch (error) {
  //     setLoading(false)
  //     toast({ variant: "destructive", description: error.message })
  //   }
  // }

  const copyWechat = async () => {
    setCopying(true)
    const shadowRoot = document.getElementById(SHADOW_HOST_ID)?.shadowRoot
    if (!shadowRoot) {
      setCopying(false)
      return
    }
    const layout = shadowRoot.getElementById(LAYOUT_ID) // 保护现场
    if (!layout) {
      setCopying(false)
      return
    }
    const html = layout.innerHTML
    solveWeChatMath()
    const cpoyHtml = solveHtml()
    console.log("cpoyHtml", cpoyHtml)
    try {
      await copyTextToClipboard(cpoyHtml)
      toast({ description: "已复制，请到微信公众平台粘贴" })
    } catch (error) {
      toast({ variant: "destructive", description: "复制失败" })
    } finally {
      layout.innerHTML = html // 恢复现场

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
  const createBilling = async () => {
    const user = await getUserInfo()

    const ret = await sendToBackground({
      name: "billing",
      body: { userId: user.userId }
    })
    if (!ret.ok) {
      throw Error(ret.error.message)
    }
    window.location.href = ret.url
  }

  return (
    <div
      ref={containerRef}
      className="nf-flex nf-relative nf-flex-col nf-gap-2 w-full nf-h-full nf-overflow-hidden">
      {loading && (
        <div className="nf-absolute nf-inset-0 nf-bg-black/20 nf-flex nf-justify-center">
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
            {/* <MenubarCheckboxItem checked={showMd} onCheckedChange={setShowMd}>
              查看MD内容
            </MenubarCheckboxItem> */}
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
            <MenubarItem onClick={createBilling}>管理我的订阅</MenubarItem>
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

      {parseHtml && (
        <div
          id={BOX_ID}
          ref={previewContainerRef}
          className="nf-w-full nf-px-2 nf-flex-1 nf-overflow-y-auto">
          <section
            id={LAYOUT_ID}
            ref={previewWrapRef}
            className="nf-w-full nf-h-full"
            data-tool="NotionFlink Preview"
            data-website="https://notion.flink.top"
            dangerouslySetInnerHTML={{ __html: parseHtml }}
          />
        </div>
      )}

      <Upgrade
        open={open}
        onOpenChange={setOpen}
        portalProps={{ container: containerRef.current }}
      />
    </div>
  )
}
