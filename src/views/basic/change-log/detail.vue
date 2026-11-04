<script setup lang="ts">
import type { DetailProps } from "./utils/types";

defineOptions({
  name: "ChangeLogDetail"
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
  <el-descriptions :column="2" border class="change-log-detail">
    <el-descriptions-item label="主键ID" :span="2">
      {{ fmt(props.row.id) }}
    </el-descriptions-item>
    <el-descriptions-item label="时间">
      {{ fmt(props.row.time) }}
    </el-descriptions-item>
    <el-descriptions-item label="业务类型">
      {{ fmt(props.row.businessType) }}
    </el-descriptions-item>
    <el-descriptions-item label="操作人">
      {{ fmt(props.row.userDisplayName) }}
    </el-descriptions-item>
    <el-descriptions-item label="用户ID">
      {{ fmt(props.row.userId) }}
    </el-descriptions-item>
    <el-descriptions-item label="用户类型">
      {{ fmt(props.row.userType) }}
    </el-descriptions-item>
    <el-descriptions-item label="机构ID">
      {{ fmt(props.row.orgId) }}
    </el-descriptions-item>
    <el-descriptions-item label="机构名称">
      {{ fmt(props.row.orgName) }}
    </el-descriptions-item>
    <el-descriptions-item label="业务ID">
      {{ fmt(props.row.businessId) }}
    </el-descriptions-item>
    <el-descriptions-item label="消息" :span="2">
      {{ fmt(props.row.message) }}
    </el-descriptions-item>
    <el-descriptions-item label="平台信息">
      {{ fmt(props.row.platform) }}
    </el-descriptions-item>
    <el-descriptions-item label="租户ID">
      {{ fmt(props.row.tenantId) }}
    </el-descriptions-item>
    <el-descriptions-item label="服务器名称">
      {{ fmt(props.row.serverName) }}
    </el-descriptions-item>
    <el-descriptions-item label="服务器应用名称">
      {{ fmt(props.row.serverAppName) }}
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
.change-log-detail {
  :deep(.el-descriptions__label) {
    width: 130px;
  }
}
</style>
