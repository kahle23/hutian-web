import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from './cache'
import type { Result } from '@/api/types'

/**
 * axios 封装：
 * - baseURL 取 VITE_API_URL（开发态直连后端，生产态同源留空）
 * - 请求头携带 Authorization（裸 token）
 * - 响应拦截解包 Result：code===200 返回整个 Result 体（调用方拿到的是 {success,code,message,data}）
 */
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
})

service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const res = response.data
    if (res.code === 200) {
      return res as never
    }
    ElMessage.error(res.message || '系统异常')
    return Promise.reject(new Error(res.message || '系统异常'))
  },
  (error) => {
    ElMessage.error(error.message || '网络异常')
    return Promise.reject(error)
  },
)

export default service
