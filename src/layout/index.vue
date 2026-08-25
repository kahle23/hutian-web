<template>
  <el-container class="layout">
    <el-aside width="210px" class="layout-aside">
      <div class="layout-logo">壶天</div>
      <el-menu :default-active="route.path" router background-color="#1f2d3d" text-color="#bfcbd9" active-text-color="#409eff">
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <!-- TODO 业务域菜单：健康档案 / 账务 / 博客 / 知识库 / 图库 -->
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-title">{{ route.meta.title || '壶天' }}</div>
        <el-dropdown @command="handleCommand">
          <span class="header-user">
            <el-icon><UserFilled /></el-icon>
            {{ userStore.nickname || userStore.username }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Odometer, UserFilled, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { clearToken } from '@/utils/cache'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function handleCommand(command: string) {
  if (command === 'logout') {
    clearToken()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.layout {
  height: 100%;
}

.layout-aside {
  background-color: #1f2d3d;

  .layout-logo {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 6px;
    color: #fff;
  }

  .el-menu {
    border-right: none;
  }
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;

  .header-title {
    font-size: 16px;
    font-weight: 600;
  }

  .header-user {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: #606266;
    outline: none;
  }
}

.layout-main {
  background-color: #f0f2f5;
}
</style>
