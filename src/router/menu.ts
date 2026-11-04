import type { MenuTreeResult } from "@/api/routes";

/** 基座动态路由节点（component 为字符串路径，由 addAsyncRoutes 经 import.meta.glob 映射为组件） */
export type PureRoute = {
  path: string;
  name?: string;
  component?: string;
  meta: {
    title: string;
    icon?: string;
    rank?: number;
    showLink?: boolean;
  };
  children?: Array<PureRoute>;
};

/**
 * 后端 icon 短名 → iconify 本地图标名（斜杠格式）。
 * 需在 @/components/ReIcon/src/offlineIcon.ts 同步 addIcon 注册才能离线渲染；
 * 查不到时回退 ep/menu
 */
const ICON_MAP: Record<string, string> = {
  setting: "ri/settings-3-line",
  user: "ri/admin-line",
  peoples: "ri/admin-fill",
  tree: "ep/menu"
};

/** 后端 icon 短名 → 已注册的 iconify 本地名（菜单列表/表单渲染同用） */
export function mapIcon(icon?: string): string {
  return (icon && ICON_MAP[icon]) || "ep/menu";
}

/** 路由 name 由完整路径派生，保证稳定唯一：/system/user -> SystemUser */
function toRouteName(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join("");
}

/** 递归转换：目录（type 1）拼层级，菜单（type 2）挂组件，按钮（type 3）不进路由 */
function convertMenu(
  menu: MenuTreeResult,
  parentPath: string,
  rank?: number
): PureRoute {
  const path = `${parentPath}/${menu.route.replace(/^\/+/, "")}`;
  const route: PureRoute = {
    path,
    name: toRouteName(path),
    meta: {
      title: menu.name,
      icon: mapIcon(menu.icon),
      showLink: menu.showFlag === 1
    }
  };
  if (rank !== undefined) route.meta.rank = rank;

  if (menu.type === 1) {
    route.children = (menu.children ?? [])
      .filter(child => child.enabled === 1 && child.type !== 3)
      .map(child => convertMenu(child, path));
  } else {
    // 菜单：component 保留后端字符串（如 system/user/index）
    route.component = menu.component;
  }
  return route;
}

/**
 * 壶天菜单树 → 基座动态路由树
 * - 禁用/隐藏节点由 meta 控制显示，按钮节点直接丢弃（按钮权限走 /system/current/permissions 单独下发）
 * - 空目录（无子节点）过滤，避免侧栏出现空壳
 */
export function toPureRoutes(menus: Array<MenuTreeResult>): Array<PureRoute> {
  return menus
    .filter(menu => menu.enabled === 1 && menu.type !== 3)
    .map(menu => convertMenu(menu, "", menu.sort))
    .filter(
      route => route.component || (route.children && route.children.length > 0)
    );
}
