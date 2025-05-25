import type { ReadStream } from "node:fs"

declare global {
  // data 类型依赖于 @midway/upload 组件配置
  // mode 为 file 时为服务器临时文件地址
  type TempFile<T extends string | ReadStream = string> = {
    fieldname: string
    filename: string
    mimeType: string
    data: T
  }

  type FileInfo = {
    name: string
    url: string
  }
}

export {}
