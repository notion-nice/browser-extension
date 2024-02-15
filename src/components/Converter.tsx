import { useLocalStorageState } from "ahooks"
import axios from "axios"
import React, { useMemo, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import TEMPLATE from "~template"
import { extractNotionPageId } from "~utility"
import {
  BOX_ID,
  LAYOUT_ID,
  MARKDOWN_THEME_ID,
  STYLE,
  TEMPLATE_NUM,
  TEMPLATE_OPTIONS
} from "~utils/constant"
import { parserMarkdownByWechat, replaceStyle } from "~utils/helper"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"

export const Converter = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const previewWrapRef = useRef<HTMLDivElement>(null)
  const [lookCss, setLookCss] = useState(false)
  const [loading, setLoading] = useState(false)
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

  return (
    <div
      ref={containerRef}
      className="nf-flex nf-flex-col nf-gap-2 nf-pt-2 w-full nf-h-full nf-overflow-hidden">
      <div className="nf-flex nf-items-center nf-space-x-2">
        <Button loading={loading} onClick={onClick}>
          预览
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">主题</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            portalProps={{ container: containerRef.current }}>
            {TEMPLATE_OPTIONS.map((option, index) => (
              <DropdownMenuCheckboxItem
                key={index}
                checked={templateNum === index}
                onCheckedChange={(checked) => {
                  if (!checked) return
                  setTemplateNum(index)
                  if (option.id === "custom") {
                    // 切换自定义自动打开css编辑
                    // setStyleEditorOpen(true)
                  } else {
                    setStyle(TEMPLATE.style[option.id])
                  }
                }}>
                {option.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={lookCss}
              onCheckedChange={setLookCss}>
              查看主题CSS
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="nf-flex nf-items-center nf-space-x-2">
          <Switch
            id="airplane-mode"
            checked={showMd}
            onCheckedChange={setShowMd}
          />
          <Label htmlFor="airplane-mode">查看MD内容</Label>
        </div>
      </div>
      {showMd ? (
        <pre className="nf-flex-1 nf-overflow-auto">{mdContent}</pre>
      ) : (
        parseHtml && (
          <div
            id={BOX_ID}
            ref={previewContainerRef}
            className="nf-w-full nf-flex-1 nf-overflow-y-auto">
            <section
              id={LAYOUT_ID}
              ref={previewWrapRef}
              className="nf-w-full nf-h-full"
              data-tool="NotionNice Preview"
              data-website="https://www.mdnice.com"
              dangerouslySetInnerHTML={{ __html: parseHtml }}
            />
          </div>
        )
      )}
    </div>
  )
}
