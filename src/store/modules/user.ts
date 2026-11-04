import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import {
  type LoginData,
  loginApi,
  logoutApi,
  getCurrentInfoApi,
  getCurrentPermsApi
} from "@/api/user";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /**
     * 登入：先拿 JWT 裸 token 落盘（cookie authorized-token），
     * 再并行拉取用户信息与按钮权限（此时请求才能带上 Authorization），
     * 映射为基座 DataInfo 后二次落盘（accessToken←token，username←account，nickname←name，roles←roles[].code）
     */
    async loginByUsername(data: LoginData) {
      const { token } = await loginApi(data);
      setToken({ accessToken: token });
      const [info, permissions] = await Promise.all([
        getCurrentInfoApi(),
        getCurrentPermsApi()
      ]);
      setToken({
        accessToken: token,
        avatar: info.avatar ?? "",
        username: info.account,
        nickname: info.name,
        roles: (info.roles ?? []).map(role => role.code),
        permissions: permissions ?? []
      });
      return { info, permissions };
    },
    /** 登出：先调后端登出接口（token 已失效时接口会 401，失败不阻断本地清理），再清本地凭证 */
    async logOut() {
      try {
        await logoutApi();
      } catch {
        // 忽略后端登出异常
      }
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
