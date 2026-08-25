<template>
  <div class="not-found">
    <h1>404</h1>
    <p>此路不通，壶天之外别无天地</p>
    <el-button type="primary" @click="router.push('/')">回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;

  h1 {
    font-size: 72px;
    color: #909399;
  }

  p {
    color: #909399;
  }
}
</style>
