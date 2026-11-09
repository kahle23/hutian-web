const Layout = () => import("@/layout/index.vue");

export default {
  path: "/cms",
  name: "Cms",
  component: Layout,
  redirect: "/cms/article",
  meta: {
    icon: "ep/notebook",
    title: "内容管理",
    // 现有菜单：首页 rank=0、动态菜单（系统管理）自动补 rank=2、异常页面 rank=9、
    // 日志管理 rank=10、任务管理 rank=11，本域排在其后
    rank: 12
  },
  children: [
    {
      path: "/cms/article",
      name: "CmsArticle",
      component: () => import("@/views/cms/article/index.vue"),
      meta: {
        title: "文章管理"
      }
    },
    {
      path: "/cms/category",
      name: "CmsCategory",
      component: () => import("@/views/cms/category/index.vue"),
      meta: {
        title: "分类管理"
      }
    },
    {
      path: "/cms/notice",
      name: "CmsNotice",
      component: () => import("@/views/cms/notice/index.vue"),
      meta: {
        title: "公告中心"
      }
    },
    {
      path: "/cms/article/edit",
      name: "CmsArticleEdit",
      component: () => import("@/views/cms/article/edit.vue"),
      meta: {
        title: "编辑文章",
        showLink: false,
        keepAlive: false
      }
    },
    {
      path: "/cms/article/detail",
      name: "CmsArticleDetail",
      component: () => import("@/views/cms/article/detail.vue"),
      meta: {
        title: "文章详情",
        showLink: false,
        keepAlive: false
      }
    },
    {
      path: "/cms/notice/detail",
      name: "CmsNoticeDetail",
      component: () => import("@/views/cms/notice/detail.vue"),
      meta: {
        title: "公告详情",
        showLink: false,
        keepAlive: false
      }
    }
  ]
} satisfies RouteConfigsTable;
