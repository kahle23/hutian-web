const Layout = () => import("@/layout/index.vue");

export default {
  path: "/task",
  name: "Task",
  component: Layout,
  redirect: "/basic/async-proc-task",
  meta: {
    icon: "ep/timer",
    title: "任务管理",
    // 现有菜单：首页 rank=0、动态菜单（系统管理）自动补 rank=2、异常页面 rank=9、日志管理 rank=10
    rank: 11
  },
  children: [
    {
      path: "/basic/async-proc-task",
      name: "BasicAsyncProcTask",
      component: () => import("@/views/basic/async-proc-task/index.vue"),
      meta: {
        title: "异步任务",
        // 单子路由目录默认被侧栏拍平为单项（同首页）；showParent 强制渲染「任务管理」目录
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;
