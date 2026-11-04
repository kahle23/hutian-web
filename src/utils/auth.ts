import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isString, isIncludeAllChildren } from "@pureadmin/utils";

export interface DataInfo<T> {
  /** 后端 JWT 裸 token（Authorization 头直传，无 Bearer 前缀） */
  accessToken: string;
  /** 头像 */
  avatar?: string;
  /** 用户名（登录账号） */
  username?: string;
  /** 昵称 */
  nickname?: string;
  /** 当前登录用户的角色（角色 code 集合） */
  roles?: Array<string>;
  /** 当前登录用户的按钮级别权限 */
  permissions?: Array<string>;
  /** 泛型占位：基座多处以 DataInfo<number> 引用，保留签名兼容（后端不返回过期时间，token 有效性由 401 判定） */
  expires?: T;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";
/**
 * 通过`multiple-tabs`是否在`cookie`中，判断用户是否已经登录系统，
 * 从而支持多标签页打开已经登录的系统后无需再登录。
 * 浏览器完全关闭后`multiple-tabs`将自动从`cookie`中销毁，
 * 再次打开浏览器需要重新登录系统
 * */
export const multipleTabsKey = "multiple-tabs";

/** 获取`token` */
export function getToken(): DataInfo<number> {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey) as string)
    : storageLocal().getItem<DataInfo<number>>(userKey);
}

/**
 * @description 设置`token`以及用户信息
 * 壶天后端仅返回 JWT 裸 token（无 refreshToken/expires 概念，过期由后端 401 判定），
 * 因此不再做前端无感刷新；cookie 不设过期时间为会话级，勾选"记住我"时按天数保留
 */
export function setToken(data: DataInfo<number>) {
  const { isRemembered, loginDay } = useUserStoreHook();
  const cookieOption = isRemembered ? { expires: loginDay } : {};
  Cookies.set(
    TokenKey,
    JSON.stringify({ accessToken: data.accessToken }),
    cookieOption
  );
  Cookies.set(multipleTabsKey, "true", cookieOption);

  const { avatar, username, nickname, roles, permissions } = data;
  useUserStoreHook().SET_AVATAR(avatar ?? "");
  useUserStoreHook().SET_USERNAME(username ?? "");
  useUserStoreHook().SET_NICKNAME(nickname ?? "");
  useUserStoreHook().SET_ROLES(roles ?? []);
  useUserStoreHook().SET_PERMS(permissions ?? []);
  storageLocal().setItem(userKey, {
    accessToken: data.accessToken,
    avatar: avatar ?? "",
    username: username ?? "",
    nickname: nickname ?? "",
    roles: roles ?? [],
    permissions: permissions ?? []
  });
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

/** 是否有按钮级别的权限（根据登录接口返回的`permissions`字段进行判断）*/
export const hasPerms = (value: string | Array<string>): boolean => {
  if (!value) return false;
  const allPerms = "*:*:*";
  const { permissions } = useUserStoreHook();
  if (!permissions) return false;
  if (permissions.length === 1 && permissions[0] === allPerms) return true;
  const isAuths = isString(value)
    ? permissions.includes(value)
    : isIncludeAllChildren(value, permissions);
  return isAuths ? true : false;
};
