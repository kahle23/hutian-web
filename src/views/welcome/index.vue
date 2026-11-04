<script setup lang="ts">
import { onMounted, ref } from "vue";
import { pingApi, type PingResult } from "@/api/base";

defineOptions({
  name: "Welcome"
});

const loading = ref(true);
const ping = ref<PingResult>({ name: "", desc: "", profile: [], time: "" });

onMounted(async () => {
  try {
    ping.value = await pingApi();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>后端链路（GET /base/ping）</template>
          <el-skeleton :rows="3" :loading="loading" animated>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="服务名">
                {{ ping.name }}
              </el-descriptions-item>
              <el-descriptions-item label="描述">
                {{ ping.desc }}
              </el-descriptions-item>
              <el-descriptions-item label="激活环境">
                <el-tag
                  v-for="p in ping.profile"
                  :key="p"
                  size="small"
                  class="tag"
                >
                  {{ p }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="服务时间">
                {{ ping.time }}
              </el-descriptions-item>
            </el-descriptions>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.tag {
  margin-right: 6px;
}
</style>
