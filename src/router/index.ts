import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/cache'

export const Layout = () => import('@/layout/index.vue')

/**
 * 常量路由（hash 模式：fat jar 静态托管零配置）。
 * TODO 后端菜单驱动的动态路由（登录后拉菜单 → import.meta.glob 映射 views → addRoute）。
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
})

// 登录守卫：无 token 一律回登录页
router.beforeEach((to, _from, next) => {
  const token = getToken()
  document.title = to.meta.title ? `${to.meta.title} · 壶天` : '壶天'
  if (to.path === '/login') {
    next()
  } else if (!token) {
    next('/login')
  } else {
    next()
  }
})

export default router
