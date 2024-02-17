import { ReloadIcon } from "@radix-ui/react-icons"
import { useLocalStorageState, useMount, useUpdate } from "ahooks"
import axios from "axios"
import React, { useMemo, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { cn } from "~lib/utils"
import TEMPLATE from "~template"
import { extractNotionPageId } from "~utility"
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
  solveHtml,
  solveWeChatMath
} from "~utils/converter"
import { parserMarkdownByWechat, replaceStyle } from "~utils/helper"

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

export const Converter = () => {
  const { toast } = useToast()
  const update = useUpdate()
  const containerRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const previewWrapRef = useRef<HTMLDivElement>(null)
  const [lookCss, setLookCss] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState(false)
  const [showMd, setShowMd] = useState(false)
  const [mdContent, setContent] = useState("")
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
    if (!mdContent) return ""
    return parserMarkdownByWechat(mdContent, mdUrl)
  }, [mdContent])

  useMount(() => {
    let timer = window.setInterval(() => {
      if (containerRef.current && timer) {
        update()
        window.clearInterval(timer)
        timer = null
      }
    }, 300)
  })

  const setStyle = (style: string) => {
    window.localStorage.setItem(STYLE, style)
    replaceStyle(MARKDOWN_THEME_ID, style)
  }
  const fetchZip = async (exportURL: string, pageId: string) => {
    const resp = await sendToBackground({
      name: "converter",
      body: { exportURL, pageId }
    })
    console.log("fetchZip", resp)
    setLoading(false)
    setContent(resp.md)
    setUrl(resp.url)
  }
  const onClick = async () => {
    setLoading(true)
    const pageId = extractNotionPageId(window.location.href)
    const res = await axios.post(
      "https://www.notion.so/api/v3/getBacklinksForBlock",
      { block: { id: pageId } }
    )
    let spaceId = ""
    if (!!res.data.recordMap.space) {
      spaceId = Object.keys(res.data.recordMap.space)[0]
    } else {
      // res.data.recordMap.space 不存在的時候需要請求其他API以获取spaceId
      const res = await axios.post(
        "https://www.notion.so/api/v3/getPublicPageData",
        {
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
        }
      )
      spaceId = res.data.spaceId
    }

    const ret = await axios.post("https://www.notion.so/api/v3/enqueueTask", {
      task: {
        eventName: "exportBlock",
        request: {
          block: { id: pageId, spaceId },
          recursive: false,
          exportOptions: {
            exportType: "markdown",
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
      const ret = await axios.post("https://www.notion.so/api/v3/getTasks", {
        taskIds: [taskId]
      })
      const results = ret.data.results
      if (results[0].state === "success") {
        is_task_in_progress = false
        fetchZip(results[0].status.exportURL, pageId)

        // cbs.success && (await cbs.success(results[0]));
      } else if (results[0].state === "failure") {
        is_task_in_progress = false
        console.error("exportBlock", results[0].error)

        // cbs.failure && (await cbs.failure(results[0]));
      } else {
        // cbs.in_progress && (await cbs.in_progress(results[0]));
      }
    }
  }

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
    await copyTextToClipboard(cpoyHtml)
    toast({ description: "已复制，请到微信公众平台粘贴" })

    layout.innerHTML = html // 恢复现场

    setCopying(false)
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
            <MenubarItem onClick={onClick} disabled={loading}>
              <ReloadIcon
                className={cn(
                  "nf-mr-2 nf-h-4 nf-w-4",
                  loading && "nf-animate-spin"
                )}
              />
              重新生成
            </MenubarItem>
            <MenubarSeparator />
            <MenubarCheckboxItem checked={showMd} onCheckedChange={setShowMd}>
              查看MD内容
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
            <MenubarCheckboxItem checked={lookCss} onCheckedChange={lookCssTheme}>
              查看主题CSS
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>内容分发</MenubarTrigger>
          <MenubarContent portalProps={{ container: containerRef.current }}>
            <MenubarItem disabled={copying} onClick={copyWechat}>微信公众号</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {showMd ? (
        <pre className="nf-flex-1 nf-px-2 nf-overflow-auto">{mdContent}</pre>
      ) : (
        parseHtml && (
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
        )
      )}
    </div>
  )
}
