import service from '@/utils/request'
import type { Result } from './types'

export interface LoginForm {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  username: string
  nickname: string
}

/** 登录（POST /base/login） */
export function loginApi(data: LoginForm): Promise<Result<LoginResult>> {
  return service.post('/base/login', data) as unknown as Promise<Result<LoginResult>>
}
