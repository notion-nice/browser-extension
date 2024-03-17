import COS from "cos-js-sdk-v5"

const cos = new COS({
  SecretId: process.env.PLASMO_PUBLIC_COS_SECRETID,
  SecretKey: process.env.PLASMO_PUBLIC_COS_SECRETKEY
})
const Region = process.env.PLASMO_PUBLIC_COS_REGION!
// 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
const Bucket = process.env.PLASMO_PUBLIC_COS_BUCKET!
// 存储桶Region可以在COS控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/
// 关于地域的详情见 https://cloud.tencent.com/document/product/436/6224
const COS_URL = process.env.PLASMO_PUBLIC_COS_HOST

interface FileInfo {
  blockId: string
  extname: string
  url: string
}
interface UploadFilesInfo {
  blockId: string
  file: File
}

export const uploadFile = async (taskId: string, oFile: FileInfo) => {
  const { blockId, extname, url } = oFile
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Failed to download file")
    }
    const blob = await response.blob()
    const file = new File([blob], blockId)
    const Key = `tmp/${taskId}/${blockId}.${extname}`
    await cos.putObject({
      Bucket: Bucket,
      Region: Region,
      Key,
      Body: file
    })
    return { blockId, url: `${COS_URL}/${Key}` } as FileInfo
  } catch (error) {
    console.error(error)
    return oFile
  }
}

export const uploadFiles = async (pageId: string, files: FileInfo[]) => {
  try {
    const uploadFiles: UploadFilesInfo[] = []

    for (const { blockId, url } of files) {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to download file")
      }
      const blob = await response.blob()
      const file = new File([blob], blockId)
      uploadFiles.push({ blockId, file })
    }
    const retFiles = await Promise.all(
      uploadFiles.map(async ({ blockId, file }) => {
        const Key = `tmp/${pageId}/${blockId}`
        await cos.putObject({
          Bucket: Bucket,
          Region: Region,
          Key,
          Body: file
        })
        return { blockId, url: `${COS_URL}/${Key}` } as FileInfo
      })
    )
    return { ok: true, files: retFiles }
  } catch (error) {
    return { ok: false, error }
  }
}
