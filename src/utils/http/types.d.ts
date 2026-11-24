import type {
  Method,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig
} from "axios";

export type resultType = {
  accessToken?: string;
};

export type RequestMethods = Extract<
  Method,
  "get" | "post" | "put" | "delete" | "patch" | "option" | "head"
>;

export interface HtHttpError extends AxiosError {
  isCancelRequest?: boolean;
}

export interface HtHttpResponse extends AxiosResponse {
  config: HtHttpRequestConfig;
}

export interface HtHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: HtHttpRequestConfig) => void;
  beforeResponseCallback?: (response: HtHttpResponse) => void;
}

export default class HtHttp {
  request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: HtHttpRequestConfig
  ): Promise<T>;
  post<T, P>(url: string, params?: P, config?: HtHttpRequestConfig): Promise<T>;
  get<T, P>(url: string, params?: P, config?: HtHttpRequestConfig): Promise<T>;
}
