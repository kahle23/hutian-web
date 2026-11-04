// 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
import { getSvgInfo } from "@pureadmin/utils";
import { addIcon } from "@iconify/vue/dist/offline";

// https://icon-sets.iconify.design/ep/?keyword=ep
import EpHomeFilled from "~icons/ep/home-filled?raw";
import EpMenu from "~icons/ep/menu?raw";

// https://icon-sets.iconify.design/ri/?keyword=ri
import RiSearchLine from "~icons/ri/search-line?raw";
import RiInformationLine from "~icons/ri/information-line?raw";
import RiSettings3Line from "~icons/ri/settings-3-line?raw";
import RiAdminLine from "~icons/ri/admin-line?raw";
import RiAdminFill from "~icons/ri/admin-fill?raw";

const icons = [
  // Element Plus Icon: https://github.com/element-plus/element-plus-icons
  ["ep/home-filled", EpHomeFilled],
  ["ep/menu", EpMenu],
  // Remix Icon: https://github.com/Remix-Design/RemixIcon
  ["ri/search-line", RiSearchLine],
  ["ri/information-line", RiInformationLine],
  // 壶天菜单图标（后端短名经 src/router/menu.ts 的 ICON_MAP 映射到这里注册的本地图标）
  ["ri/settings-3-line", RiSettings3Line],
  ["ri/admin-line", RiAdminLine],
  ["ri/admin-fill", RiAdminFill]
];

// 本地菜单图标，后端在路由的 icon 中返回对应的图标字符串并且前端在此处使用 addIcon 添加即可渲染菜单图标
icons.forEach(([name, icon]) => {
  addIcon(name as string, getSvgInfo(icon as string));
});
