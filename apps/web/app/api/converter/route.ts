import { promises as fs } from "fs"
import path from "path"
import { NextResponse, type NextRequest } from "next/server"

import { saveFilesFromZip } from "./saveFilesFromZip" // 确保这个路径指向您的fetchAndUnzip函数

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as unknown as File | null
    if (!file) {
      return NextResponse.json({ msg: "file 不存在" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const zipData = new Uint8Array(arrayBuffer)

    const outputPath = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(outputPath, { recursive: true })

    const mdFilePath = await saveFilesFromZip(zipData, outputPath)

    const mdFileUrl = mdFilePath.replace(process.cwd(), "")

    return NextResponse.json({ url: mdFileUrl })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
