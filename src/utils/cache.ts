const TOKEN_KEY = 'dtToken'
const USER_KEY = 'dtUser'

export interface CacheUser {
  username: string
  nickname: string
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getCacheUser(): CacheUser {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as CacheUser) : { username: '', nickname: '' }
}

export function setCacheUser(user: CacheUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}
