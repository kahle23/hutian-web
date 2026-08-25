# 壶天 hutian-web

> 壶天前端（Vue3 + TypeScript + Vite + Element Plus + Pinia），后端为同级仓库 `hutian`。

## 开发

```bash
npm install
npm run dev      # http://localhost:3000，直连后端 http://localhost:1210（后端已放开 CORS）
```

## 构建与发布

```bash
npm run build    # 产出 dist/
```

后端 `hutian-boot` 打包时会自动检测本仓库的 `dist/`（maven profile `frontend`），
存在则复制进 fat jar 的 `static/`，实现一个 jar 装下前后端。

## 结构约定

| 目录 | 说明 |
|---|---|
| src/api | 按业务域分文件的接口层（`xxxApi` 命名，返回 `Result<T>`） |
| src/utils/request.ts | axios 封装：`VITE_API_URL`、Authorization 头、Result 解包 |
| src/router | hash 路由 + 登录守卫（动态菜单路由预留） |
| src/store | pinia（token/用户态走 localStorage 缓存 `dtToken`/`dtUser`） |
| src/layout | 侧边菜单 + 顶栏 + 主区 |
| src/views | 页面（login / dashboard / 404） |
