import service from '@/utils/request'
import type { Result } from './types'

export interface PingResult {
  name: string
  desc: string
  profile: string[]
  time: string
}

/** 健康检查（GET /base/ping） */
export function pingApi(): Promise<Result<PingResult>> {
  return service.get('/base/ping') as unknown as Promise<Result<PingResult>>
}
