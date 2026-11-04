<script setup lang="ts">
import type { DetailProps } from "./utils/types";
import { TASK_TYPE_MAP, TASK_STATUS_MAP } from "./utils/types";

defineOptions({
  name: "AsyncProcTaskDetail"
});

const props = defineProps<DetailProps>();

/** 空值占位 */
function fmt(value: unknown) {
  return value === null || value === undefined || value === ""
    ? "-"
    : String(value);
}

function taskTypeConf(value: number | undefined) {
  return value === undefined || value === null
    ? undefined
    : TASK_TYPE_MAP[value];
}

function statusConf(value: number | undefined) {
  return value === undefined || value === null
    ? undefined
    : TASK_STATUS_MAP[value];
}
</script>

<template>
  <el-descriptions :column="2" border class="async-task-detail">
    <el-descriptions-item label="主键Id" :span="2">
      {{ fmt(props.row.id) }}
    </el-descriptions-item>
    <el-descriptions-item label="业务类型">
      {{ fmt(props.row.businessType) }}
    </el-descriptions-item>
    <el-descriptions-item label="业务ID">
      {{ fmt(props.row.businessId) }}
    </el-descriptions-item>
    <el-descriptions-item label="任务类型">
      <el-tag
        v-if="taskTypeConf(props.row.taskType)"
        size="small"
        :type="taskTypeConf(props.row.taskType)!.tag"
        effect="plain"
      >
        {{ taskTypeConf(props.row.taskType)!.text }}
      </el-tag>
      <span v-else>-</span>
    </el-descriptions-item>
    <el-descriptions-item label="状态">
      <el-tag
        v-if="statusConf(props.row.status)"
        size="small"
        :type="statusConf(props.row.status)!.tag"
        effect="plain"
      >
        {{ statusConf(props.row.status)!.text }}
      </el-tag>
      <span v-else>-</span>
    </el-descriptions-item>
    <el-descriptions-item label="开始时间">
      {{ fmt(props.row.beginTime) }}
    </el-descriptions-item>
    <el-descriptions-item label="结束时间">
      {{ fmt(props.row.endTime) }}
    </el-descriptions-item>
    <el-descriptions-item label="原文件名称">
      {{ fmt(props.row.originalFilename) }}
    </el-descriptions-item>
    <el-descriptions-item label="执行者名称">
      {{ fmt(props.row.executorName) }}
    </el-descriptions-item>
    <el-descriptions-item label="成功条数">
      {{ fmt(props.row.successCount) }}
    </el-descriptions-item>
    <el-descriptions-item label="失败条数">
      {{ fmt(props.row.failureCount) }}
    </el-descriptions-item>
    <el-descriptions-item label="总条数">
      {{ fmt(props.row.totalCount) }}
    </el-descriptions-item>
    <el-descriptions-item label="执行失败的次数">
      {{ fmt(props.row.execFailureCount) }}
    </el-descriptions-item>
    <el-descriptions-item label="任务参数（JSON）" :span="2">
      {{ fmt(props.row.taskParameters) }}
    </el-descriptions-item>
    <el-descriptions-item label="原始文件（JSON）" :span="2">
      {{ fmt(props.row.originalFiles) }}
    </el-descriptions-item>
    <el-descriptions-item label="结果文件信息" :span="2">
      {{ fmt(props.row.resultFile) }}
    </el-descriptions-item>
    <el-descriptions-item label="错误信息" :span="2">
      {{ fmt(props.row.errorMessage) }}
    </el-descriptions-item>
    <el-descriptions-item label="平台信息">
      {{ fmt(props.row.platform) }}
    </el-descriptions-item>
    <el-descriptions-item label="租户ID">
      {{ fmt(props.row.tenantId) }}
    </el-descriptions-item>
    <el-descriptions-item label="所属人ID">
      {{ fmt(props.row.ownerId) }}
    </el-descriptions-item>
    <el-descriptions-item label="所属机构ID">
      {{ fmt(props.row.ownOrgId) }}
    </el-descriptions-item>
    <el-descriptions-item label="创建者">
      {{ fmt(props.row.createUser) }}
    </el-descriptions-item>
    <el-descriptions-item label="创建时间">
      {{ fmt(props.row.createTime) }}
    </el-descriptions-item>
    <el-descriptions-item label="修改者">
      {{ fmt(props.row.modifyUser) }}
    </el-descriptions-item>
    <el-descriptions-item label="修改时间">
      {{ fmt(props.row.modifyTime) }}
    </el-descriptions-item>
    <el-descriptions-item label="删除状态">
      {{ props.row.deleteStatus === 1 ? "已删除" : "未删除" }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<style lang="scss" scoped>
.async-task-detail {
  :deep(.el-descriptions__label) {
    width: 130px;
  }
}
</style>
