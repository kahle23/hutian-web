import { http } from "@/utils/http";

/** 后端菜单树节点（hutian MenuTreeResult，http 层已解包 Result.data） */
export type MenuTreeResult = {
  id: number;
  parentId: number;
  name: string;
  /** 1=目录 2=菜单 3=按钮 */
  type: number;
  permission: string;
  /** 路由段（相对父级，如目录 system、菜单 user） */
  route: string;
  /** 图标短名（setting/user/peoples/tree，前端映射为 iconify 本地图标） */
  icon: string;
  /** 组件路径（仅菜单类型，如 system/user/index，需后端 MenuSmpResult 下发） */
  component?: string;
  sort: number;
  enabled: number;
  showFlag: number;
  children?: Array<MenuTreeResult>;
};

/** 获取当前登录用户的菜单树：GET /system/current/menu-tree */
export const getAsyncRoutes = () => {
  return http.request<Array<MenuTreeResult>>(
    "get",
    "/system/current/menu-tree"
  );
};
