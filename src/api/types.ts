/** 后端统一返回体（kunlun.common.Result） */
export interface Result<T = unknown> {
  success: boolean
  code: number
  message: string
  data: T
}
