import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import { getToken, removeToken } from "@/utils/auth";
import { message } from "@/utils/message";

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 后端地址：开发态直连（后端已放开 CORS），生产态留空走同源（fat jar 静态托管）
  baseURL: import.meta.env.VITE_API_URL as string,
  // 请求超时时间
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

/** 登录失效：清凭证并回登录页（动态引入 router，避免与路由模块形成循环依赖） */
async function handleUnauthorized() {
  removeToken();
  message("登录已失效，请重新登录", { type: "error", grouping: true });
  const { router } = await import("@/router");
  if (router.currentRoute.value.path !== "/login") {
    await router.push("/login");
  }
}

/** kunlun 统一返回体解包：code===200 返回 data，否则提示并拒绝 */
function handleResult(response: PureHttpResponse) {
  const res = response?.data;
  // 非统一返回体（如二进制流）原样放行
  if (res === null || res === undefined || res.code === undefined) return res;
  if (res.code === 200) return res.data;
  message(res.message || "请求失败", { type: "error", grouping: true });
  return Promise.reject(new Error(res.message || "请求失败"));
}

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      (config: PureHttpRequestConfig): any => {
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        /** 请求白名单，放置一些不需要`token`的接口 */
        const whiteList = ["/system/login"];
        if (whiteList.some(url => config.url?.endsWith(url))) return config;
        // JWT 裸 token，直接放 Authorization 头（后端无 Bearer 前缀约定）
        const token = getToken()?.accessToken;
        if (token) config.headers["Authorization"] = token;
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return handleResult(response);
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // HTTP 层异常：401 登录失效踢回登录，其余统一提示（取消的请求不打扰）
        if (error.response?.status === 401) {
          handleUnauthorized();
        } else if (!Axios.isCancel($error)) {
          const serverMessage = (error.response?.data as any)?.message;
          message(serverMessage || error.message || "网络异常", {
            type: "error",
            grouping: true
          });
        }
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();
