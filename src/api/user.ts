import { http } from "@/utils/http";

export type LoginData = {
  account: string;
  password: string;
};

export type RoleInfo = {
  id: string | number;
  name: string;
  code: string;
  enabled: boolean;
};

export type CurrentUserInfo = {
  id: string | number;
  account: string;
  name: string;
  avatar: string;
  roles: Array<RoleInfo>;
};

/** 登录：POST /system/login，返回 JWT 裸 token（http 层已解包 Result.data） */
export const loginApi = (data: LoginData) => {
  return http.request<{ token: string }>("post", "/system/login", { data });
};

/** 登出：POST /system/logout */
export const logoutApi = () => {
  return http.request<void>("post", "/system/logout");
};

/** 当前登录用户信息：GET /system/current/info */
export const getCurrentInfoApi = () => {
  return http.request<CurrentUserInfo>("get", "/system/current/info");
};

/** 当前登录用户按钮权限集合：GET /system/current/permissions */
export const getCurrentPermsApi = () => {
  return http.request<Array<string>>("get", "/system/current/permissions");
};
