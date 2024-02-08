import axios from "axios"
import React from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { extractNotionPageId } from "~utility"

import { Button } from "./ui/button"

export const Converter = () => {
  const fetchZip = async (exportURL: string) => {
    sendToBackground({ name: "converter", body: { exportURL } })
  }
  const onClick = async () => {
    const pageId = extractNotionPageId(window.location.href)
    const res = await axios.post(
      "https://www.notion.so/api/v3/getBacklinksForBlock",
      { block: { id: pageId } }
    )
    const spaceId = Object.keys(res.data.recordMap.space)[0]
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
        fetchZip(results[0].status.exportURL)

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
  const onTestClick = () =>
    fetchZip(
      "https://file.notion.so/f/t/a6e18ff0-2f42-4edd-b4d0-0eb924acaa91/Export-56da0238-b00c-430d-8153-abe60a8c9772.zip?id=6643411a-e8fe-42a7-8a8e-ddbac57b4b80&table=user_export&spaceId=&expirationTimestamp=1707996772657&signature=4LxnkRx3DpCRMFAV-N-Tl4R81SJZiMMoFAoXJCdlBgw&download=true&downloadName=a6e18ff0-2f42-4edd-b4d0-0eb924acaa91%2FExport-56da0238-b00c-430d-8153-abe60a8c9772.zip"
    )

  return (
    <>
      <Button onClick={onClick}>导出</Button>
      <Button onClick={onTestClick}>測試导出</Button>
    </>
  )
}
