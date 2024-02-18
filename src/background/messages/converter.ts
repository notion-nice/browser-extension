import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const response = await fetch(req.body.exportURL)
  if (!response.ok) {
    throw new Error("Failed to download file")
  }

  // 获取ZIP文件的二进制数据
  const arrayBuffer = await response.arrayBuffer()
  const zipData = new Uint8Array(arrayBuffer)
  const file = new Blob([zipData], { type: "application/octet-stream" })

  const formData = new FormData()
  formData.append("file", file)
  formData.append("filename", req.body.pageId)

  fetch(`${process.env.PLASMO_PUBLIC_WEB_HOST}/api/converter`, {
    method: "POST",
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      // 请求成功，处理响应数据
      if (data.url) {
        let mdUrl = `/${data.url}`
        const lastSlashIndex = mdUrl.lastIndexOf("/")
        const directoryPath = mdUrl.slice(0, lastSlashIndex + 1)
        mdUrl = `${process.env.PLASMO_PUBLIC_COS_HOST}${directoryPath}`

        fetch(`${process.env.PLASMO_PUBLIC_COS_HOST}/${data.url}`)
          .then((response) => response.text())
          .then((data) => {
            res.send({ ok: true, md: data, url: mdUrl })
          })
      }
    })
    .catch((error) => {
      // 请求失败，处理错误
      console.error("Error uploading file:", error)
      res.send({ ok: false, error: error.message || "Failed to upload file" })
    })
}

export default handler
