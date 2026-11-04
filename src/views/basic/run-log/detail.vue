<script setup lang="ts">
import type { DetailProps } from "./utils/types";

defineOptions({
  name: "RunLogDetail"
});

const props = defineProps<DetailProps>();

/** 空值占位 */
function fmt(value: unknown) {
  return value === null || value === undefined || value === ""
    ? "-"
    : String(value);
}
</script>

<template>
  <el-descriptions :column="2" border class="run-log-detail">
    <el-descriptions-item label="主键ID" :span="2">
      {{ fmt(props.row.id) }}
    </el-descriptions-item>
    <el-descriptions-item label="时间">
      {{ fmt(props.row.time) }}
    </el-descriptions-item>
    <el-descriptions-item label="是否成功">
      <el-tag
        size="small"
        :type="props.row.success === 1 ? 'success' : 'danger'"
        effect="plain"
      >
        {{ props.row.success === 1 ? "成功" : "失败" }}
      </el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="模块名">
      {{ fmt(props.row.module) }}
    </el-descriptions-item>
    <el-descriptions-item label="服务器名称">
      {{ fmt(props.row.serverName) }}
    </el-descriptions-item>
    <el-descriptions-item label="服务器应用名称">
      {{ fmt(props.row.serverAppName) }}
    </el-descriptions-item>
    <el-descriptions-item label="消息" :span="2">
      {{ fmt(props.row.message) }}
    </el-descriptions-item>
    <el-descriptions-item label="错误消息" :span="2">
      {{ fmt(props.row.error) }}
    </el-descriptions-item>
    <el-descriptions-item label="其他数据的JSON" :span="2">
      {{ fmt(props.row.dataJson) }}
    </el-descriptions-item>
    <el-descriptions-item label="删除状态">
      {{ props.row.deleteStatus === 1 ? "已删除" : "未删除" }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<style lang="scss" scoped>
.run-log-detail {
  :deep(.el-descriptions__label) {
    width: 130px;
  }
}
</style>
