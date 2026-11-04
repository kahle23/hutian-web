import { http } from "@/utils/http";
import type { MenuTreeResult } from "@/api/routes";

/** kunlun 分页返回体（http 层已解包 Result.data） */
export type PageResult<T> = {
  data: Array<T>;
  total: number;
};

/** kunlun 分页查询入参基类（Page.Query：pageNum/pageSize/isPaged） */
export type PageQuery = {
  pageNum?: number;
  pageSize?: number;
  isPaged?: boolean;
};

/** 菜单详情（MenuResult：含 description 等全字段，用于编辑回显） */
export type MenuDetail = MenuTreeResult & {
  description?: string;
};

// ---------------- 用户管理 ----------------

export type UserItem = {
  id: number;
  account: string;
  name: string;
  enabled: number;
};

export type UserQuery = PageQuery & {
  accountLike?: string;
  nameLike?: string;
  enabled?: number;
};

export const getUserPage = (data: UserQuery) => {
  return http.request<PageResult<UserItem>>("post", "/system/user/query-page", {
    data
  });
};

export const addUser = (data: {
  account: string;
  password: string;
  name: string;
  enabled: number;
}) => {
  return http.request<number>("post", "/system/user/add", { data });
};

export const editUser = (data: {
  id: number;
  account: string;
  name: string;
  enabled: number;
}) => {
  return http.request<void>("post", "/system/user/edit", { data });
};

export const deleteUsers = (ids: Array<number>) => {
  return http.request<void>("post", "/system/user/delete", { data: { ids } });
};

export const resetUserPwd = (data: { id: number; newPassword: string }) => {
  return http.request<void>("post", "/system/user/reset-pwd", { data });
};

/** 给用户分配角色：覆盖式保存 */
export const grantUserRoles = (data: {
  userId: number;
  roleIds: Array<number>;
}) => {
  return http.request<void>("post", "/system/user/grant-role", { data });
};

export const getOwnRoleIds = (userId: number) => {
  return http.request<Array<number>>("get", "/system/user/own-role-ids", {
    params: { userId }
  });
};

/** 用户详情（UserResult：不含密码字段，编辑回显用） */
export type UserDetail = UserItem & {
  avatar?: string;
  platform?: string;
  tenantId?: string;
  createUser?: string;
  createTime?: string;
  modifyUser?: string;
  modifyTime?: string;
};

export const getUserDetail = (recordId: number) => {
  return http.request<UserDetail>("get", `/system/user/${recordId}`);
};

/** 本人修改密码（成功后前端登出回登录页） */
export const updateUserPwd = (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  return http.request<void>("post", "/system/user/update-pwd", { data });
};

// ---------------- 角色管理 ----------------

export type RoleItem = {
  id: number;
  name: string;
  code: string;
  description?: string;
  enabled: number;
};

export type RoleQuery = PageQuery & {
  nameLike?: string;
  codeLike?: string;
  enabled?: number;
};

export const getRolePage = (data: RoleQuery) => {
  return http.request<PageResult<RoleItem>>("post", "/system/role/query-page", {
    data
  });
};

export const addRole = (data: {
  name: string;
  code: string;
  description: string;
  enabled: number;
}) => {
  return http.request<number>("post", "/system/role/add", { data });
};

export const editRole = (data: {
  id: number;
  name: string;
  code: string;
  description: string;
  enabled: number;
}) => {
  return http.request<void>("post", "/system/role/edit", { data });
};

export const deleteRoles = (ids: Array<number>) => {
  return http.request<void>("post", "/system/role/delete", { data: { ids } });
};

/** 角色详情（RoleResult：编辑回显用） */
export type RoleDetail = RoleItem & {
  platform?: string;
  tenantId?: string;
  createUser?: string;
  createTime?: string;
  modifyUser?: string;
  modifyTime?: string;
};

export const getRoleDetail = (recordId: number) => {
  return http.request<RoleDetail>("get", `/system/role/${recordId}`);
};

/** 角色已授菜单 id 集合 */
export const getOwnMenuIds = (roleId: number) => {
  return http.request<Array<number>>("get", "/system/role/own-menu-ids", {
    params: { roleId }
  });
};

/** 给角色授权菜单：覆盖式保存 */
export const grantRoleMenus = (data: {
  roleId: number;
  menuIds: Array<number>;
}) => {
  return http.request<void>("post", "/system/role/grant-menu", { data });
};

// ---------------- 菜单管理 ----------------

export type MenuQuery = {
  nameLike?: string;
  type?: number;
  enabled?: number;
};

export const getMenuTree = (data: MenuQuery = {}) => {
  return http.request<Array<MenuTreeResult>>(
    "post",
    "/system/menu/query-tree",
    {
      data
    }
  );
};

/** 菜单分页行（MenuSmpResult：扁平结构） */
export type MenuSmpItem = {
  id: number;
  parentId: number;
  name: string;
  /** 菜单类型：1 目录，2 菜单，3 按钮 */
  type: number;
  permission?: string;
  route?: string;
  component?: string;
  icon?: string;
  sort?: number;
  enabled: number;
  showFlag?: number;
};

/** 菜单分页查询（MenuQuery + BaseQuery 分页字段） */
export type MenuPageQuery = PageQuery & {
  nameLike?: string;
  descriptionLike?: string;
  permissionLike?: string;
  routeLike?: string;
  componentLike?: string;
  type?: number;
  enabled?: number;
  showFlag?: number;
};

/** 菜单扁平分页（菜单页列表走 query-tree，本接口留作扁平检索用） */
export const getMenuPage = (data: MenuPageQuery) => {
  return http.request<PageResult<MenuSmpItem>>(
    "post",
    "/system/menu/query-page",
    { data }
  );
};

export const getMenuDetail = (recordId: number) => {
  return http.request<MenuDetail>("get", `/system/menu/${recordId}`);
};

export const addMenu = (data: {
  parentId: number;
  name: string;
  type: number;
  description: string;
  icon: string;
  route: string;
  component: string;
  permission: string;
  sort: number;
  enabled: number;
  showFlag: number;
}) => {
  return http.request<number>("post", "/system/menu/add", { data });
};

export const editMenu = (data: {
  id: number;
  parentId: number;
  name: string;
  type: number;
  description: string;
  icon: string;
  route: string;
  component: string;
  permission: string;
  sort: number;
  enabled: number;
  showFlag: number;
}) => {
  return http.request<void>("post", "/system/menu/edit", { data });
};

export const deleteMenus = (ids: Array<number>) => {
  return http.request<void>("post", "/system/menu/delete", { data: { ids } });
};
