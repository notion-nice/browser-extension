import { unzipSync } from "fflate"

import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const response = await fetch(req.body.exportURL)
  if (!response.ok) {
    res.send({ ok: false, error: "Failed to download file" })
    return
  }

  // 获取ZIP文件的二进制数据
  const arrayBuffer = await response.arrayBuffer()
  const zipped = new Uint8Array(arrayBuffer)
  const decoder = new TextDecoder("utf-8")

  try {
    const unzipped = unzipSync(zipped)

    let htmlFileContent = ""

    for (let filename in unzipped) {
      const fileContent = unzipped[filename]

      if (filename.endsWith(".html")) {
        htmlFileContent = decoder.decode(fileContent)
      }
    }

    res.send({ ok: true, html: htmlFileContent })
  } catch (error: any) {
    console.error("Error unzip file:", error)
    res.send({ ok: false, error: error.message || "Failed to unzip file" })
  }
}

export default handler
