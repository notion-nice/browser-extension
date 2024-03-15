import COS from "cos-js-sdk-v5"

import type { PlasmoMessaging } from "@plasmohq/messaging"

const cos = new COS({
  SecretId: process.env.COS_SECRETID,
  SecretKey: process.env.COS_SECRETKEY
})
const Region = process.env.COS_REGION
// 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
const Bucket = process.env.COS_BUCKET
// 存储桶Region可以在COS控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/
// 关于地域的详情见 https://cloud.tencent.com/document/product/436/6224
const COS_URL = process.env.PLASMO_PUBLIC_COS_URL

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const pageId = req.body.pageId as string
  const files = req.body.files as Array<{
    blockId: string
    url: string
    content: string
  }>
  const uploadFiles = [] as Array<{
    blockId: string
    content: string
    file: File
  }>
  for (const { blockId, content, url } of files) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Failed to download file")
    }
    const blob = await response.blob()
    const file = new File([blob], blockId)
    uploadFiles.push({ blockId, content, file })
  }
  const retFiles = await Promise.all(
    uploadFiles.map(async ({ blockId, content, file }) => {
      const Key = `tmp/${pageId}/${blockId}`
      await cos.putObject({
        Bucket: Bucket,
        Region: Region,
        Key,
        Body: file
      })
      return { blockId, content, url: `${COS_URL}/${Key}` }
    })
  )
  res.send({ ok: true, files: retFiles })
}

export default handler
