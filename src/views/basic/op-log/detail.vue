<script setup lang="ts">
import type { DetailProps } from "./utils/types";

defineOptions({
  name: "OpLogDetail"
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
  <el-descriptions :column="2" border class="op-log-detail">
    <el-descriptions-item label="主键ID" :span="2">
      {{ fmt(props.row.id) }}
    </el-descriptions-item>
    <el-descriptions-item label="事件名称">
      {{ fmt(props.row.name) }}
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
    <el-descriptions-item label="耗时（毫秒）">
      {{ fmt(props.row.timeSpent) }}
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
    <el-descriptions-item label="消息" :span="2">
      {{ fmt(props.row.message) }}
    </el-descriptions-item>
    <el-descriptions-item label="请求的URI" :span="2">
      {{ fmt(props.row.requestApiUri) }}
    </el-descriptions-item>
    <el-descriptions-item label="请求的方法">
      {{ fmt(props.row.requestMethod) }}
    </el-descriptions-item>
    <el-descriptions-item label="跟踪ID">
      {{ fmt(props.row.traceId) }}
    </el-descriptions-item>
    <el-descriptions-item label="请求参数（JSON）" :span="2">
      {{ fmt(props.row.input) }}
    </el-descriptions-item>
    <el-descriptions-item label="返回结果（JSON）" :span="2">
      {{ fmt(props.row.output) }}
    </el-descriptions-item>
    <el-descriptions-item label="错误消息" :span="2">
      {{ fmt(props.row.error) }}
    </el-descriptions-item>
    <el-descriptions-item label="平台信息">
      {{ fmt(props.row.platform) }}
    </el-descriptions-item>
    <el-descriptions-item label="租户ID">
      {{ fmt(props.row.tenantId) }}
    </el-descriptions-item>
    <el-descriptions-item label="客户端应用ID">
      {{ fmt(props.row.clientAppId) }}
    </el-descriptions-item>
    <el-descriptions-item label="客户端设备ID">
      {{ fmt(props.row.clientDeviceId) }}
    </el-descriptions-item>
    <el-descriptions-item label="客户端用户代理" :span="2">
      {{ fmt(props.row.clientUserAgent) }}
    </el-descriptions-item>
    <el-descriptions-item label="客户端网络地址">
      {{ fmt(props.row.clientNetAddress) }}
    </el-descriptions-item>
    <el-descriptions-item label="客户端地理地址">
      {{ fmt(props.row.clientGeoAddress) }}
    </el-descriptions-item>
    <el-descriptions-item label="客户端地理位置" :span="2">
      {{ fmt(props.row.clientGeoLocation) }}
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
.op-log-detail {
  :deep(.el-descriptions__label) {
    width: 130px;
  }
}
</style>
