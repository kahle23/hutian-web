# 壶天 hutian-web

> 壶天前端（Vue3.5 + Vite7 + TS + Element Plus + Pinia3 + Tailwind4），后端为同级仓库 `hutian`。

## 开发

本仓库强制 pnpm（`preinstall` 校验，版本由 `packageManager` 钉住 pnpm@10.18.1）：

```bash
corepack enable   # 本机无 pnpm 时先启用（Node 自带 corepack）
pnpm install
pnpm dev          # http://localhost:3000，hash 路由，直连后端 http://localhost:1210（后端已放开 CORS）
pnpm typecheck    # tsc + vue-tsc
pnpm build        # 产出 dist/（含 gzip/brotli 压缩产物）
```

环境变量：`.env.development` 的 `VITE_API_URL=http://localhost:1210`；生产留空走同源。

## 构建与发布

后端 `hutian-boot` 打包时会把本仓库的 `dist/` 复制进 fat jar 的 `static/`（maven `frontend` profile 自动检测），一个 jar 装下前后端、同源免 CORS：

```bash
# 前端先出 dist，再打后端（跳过 pom 里的 npm 构建——本仓库已改用 pnpm，且 preinstall 禁 npm）
pnpm build
cd ../hutian
mvn package -DskipFrontendBuild=true -s E:/Repository/Maven/_yunxiao_settings.xml -Dmaven.repo.local=E:/Repository/Maven
```

## 与后端的链路约定

| 事项     | 约定                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| 认证     | JWT 裸 token，请求头 `Authorization: <token>`（无 Bearer 前缀），登录接口 `/system/login` 走白名单           |
| 返回体   | kunlun 统一返回 `{success, code, message, data}`，`code===200` 视为成功，http 层已解包出 `data`              |
| 登录链路 | 登录后并行调 `/system/current/info` + `/system/current/permissions` 填充用户态与按钮权限                     |
| 动态路由 | `/system/current/menu-tree` 返回菜单树（type 1=目录 2=菜单 3=按钮），`src/router/menu.ts` 转换为基座路由结构 |
| 401      | 清凭证回登录页                                                                                               |

## 结构约定

| 目录                                     | 说明                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| src/api                                  | 按业务域分文件的接口层（http 层已解包，类型直接声明 `data` 形状）       |
| src/utils/http                           | axios 封装：baseURL（VITE_API_URL）、Result 解包、非 200 弹错、401 处理 |
| src/utils/auth                           | token 存取（cookie 会话级 + localStorage userKey）、按钮权限 hasPerms   |
| src/router/menu                          | 壶天菜单树 → 基座动态路由转换器（含 icon 短名映射）                     |
| src/views/system                         | 用户 / 角色 / 菜单管理（接壶天 CRUD）                                   |
| src/views/welcome                        | 首页：后端 ping 链路探测 + 规划 timeline                                |
| src/components/ReIcon/src/offlineIcon.ts | 菜单图标的离线注册表（后端短名经映射在这里 addIcon）                    |

## 后端账号

骨架账号 `admin / admin123`（超级管理员，种子见 `hutian/sql/system.sql`）。
