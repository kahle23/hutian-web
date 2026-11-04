<script setup lang="ts">
import { ref } from "vue";
import { useAsyncProcTask } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import View from "~icons/ep/view";
import Refresh from "~icons/ep/refresh";

defineOptions({
  name: "BasicAsyncProcTask"
});

const formRef = ref();
const tableRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDetail,
  handleSizeChange,
  handleCurrentChange
} = useAsyncProcTask();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-3 overflow-auto"
    >
      <el-form-item label="任务类型：" prop="taskType">
        <el-select
          v-model="form.taskType"
          placeholder="全部"
          clearable
          class="w-30!"
        >
          <el-option label="导出" :value="1" />
          <el-option label="导入" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="全部"
          clearable
          class="w-30!"
        >
          <el-option label="待导入/导出" :value="1" />
          <el-option label="前置处理" :value="2" />
          <el-option label="导入/导出中" :value="3" />
          <el-option label="超时" :value="4" />
          <el-option label="失败" :value="5" />
          <el-option label="成功" :value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="原文件名称：" prop="originalFilename">
        <el-input
          v-model="form.originalFilename"
          placeholder="请输入原文件名称"
          clearable
          class="w-45!"
        />
      </el-form-item>
      <el-form-item label="执行者：" prop="executorName">
        <el-input
          v-model="form.executorName"
          placeholder="请输入执行者"
          clearable
          class="w-45!"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri/search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="异步任务" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          align-whole="center"
          row-key="id"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="openDetail(row)"
            >
              详情
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
