const Layout = () => import("@/layout/index.vue");

export default {
  path: "/basic",
  name: "Basic",
  component: Layout,
  redirect: "/basic/op-log",
  meta: {
    icon: "ep/document",
    title: "日志管理",
    // 现有菜单：首页 rank=0、动态菜单（系统管理）自动补 rank=2、异常页面 rank=9，
    // 本域排在其后
    rank: 10
  },
  children: [
    {
      path: "/basic/op-log",
      name: "BasicOpLog",
      component: () => import("@/views/basic/op-log/index.vue"),
      meta: {
        title: "操作日志"
      }
    },
    {
      path: "/basic/change-log",
      name: "BasicChangeLog",
      component: () => import("@/views/basic/change-log/index.vue"),
      meta: {
        title: "变动日志"
      }
    },
    {
      path: "/basic/run-log",
      name: "BasicRunLog",
      component: () => import("@/views/basic/run-log/index.vue"),
      meta: {
        title: "运行日志"
      }
    }
  ]
} satisfies RouteConfigsTable;
