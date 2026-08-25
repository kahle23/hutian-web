<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="14">
        <el-card>
          <template #header>后端链路（GET /base/ping）</template>
          <el-skeleton :rows="3" :loading="loading" animated>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="服务名">{{ ping.name }}</el-descriptions-item>
              <el-descriptions-item label="描述">{{ ping.desc }}</el-descriptions-item>
              <el-descriptions-item label="激活环境">
                <el-tag v-for="p in ping.profile" :key="p" size="small" class="tag">{{ p }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="服务时间">{{ ping.time }}</el-descriptions-item>
            </el-descriptions>
          </el-skeleton>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card>
          <template #header>壶天 · 规划</template>
          <el-timeline>
            <el-timeline-item type="success" timestamp="已完成">前后端骨架 &amp; 登录链路</el-timeline-item>
            <el-timeline-item timestamp="待开发">健康档案 / 体检记录</el-timeline-item>
            <el-timeline-item timestamp="待开发">个人账务管理</el-timeline-item>
            <el-timeline-item timestamp="待开发">博客 / 知识库 / 图库</el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { pingApi, type PingResult } from '@/api/base'

const loading = ref(true)
const ping = ref<PingResult>({ name: '', desc: '', profile: [], time: '' })

onMounted(async () => {
  try {
    const res = await pingApi()
    ping.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.tag {
  margin-right: 6px;
}
</style>
