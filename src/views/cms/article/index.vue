<script setup lang="ts">
import { ref } from "vue";
import { useArticle } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import AddFill from "~icons/ri/add-circle-line";
import UploadFill from "~icons/ep/upload";
import Delete from "~icons/ep/delete";
import ArrowDown from "~icons/ep/arrow-down";

defineOptions({
  name: "CmsArticle"
});

const formRef = ref();
const tableRef = ref();
const {
  form,
  typeTab,
  CMS_TYPE_TABS,
  categoryOptions,
  loading,
  columns,
  dataList,
  selectedRows,
  pagination,
  onSearch,
  resetForm,
  openCreate,
  openEdit,
  openDetail,
  handleRowCommand,
  handlePublish,
  handleOffline,
  handleBatchPublish,
  handleBatchDelete,
  handleSelectionChange,
  handleTypeChange,
  handleSizeChange,
  handleCurrentChange
} = useArticle();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-3 overflow-auto"
    >
      <el-form-item label="标题：" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入标题"
          clearable
          class="w-45!"
        />
      </el-form-item>
      <el-form-item label="分类：" prop="categoryId">
        <el-select
          v-model="form.categoryId"
          placeholder="全部"
          clearable
          class="w-30!"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="全部"
          clearable
          class="w-30!"
        >
          <el-option label="草稿" :value="0" />
          <el-option label="已发布" :value="1" />
          <el-option label="已下线" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间：" prop="publishTimeRange">
        <el-date-picker
          v-model="form.publishTimeRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="[
            new Date(2000, 0, 1, 0, 0, 0),
            new Date(2000, 0, 1, 23, 59, 59)
          ]"
          class="w-64!"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
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

    <PureTableBar title="文章管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openCreate()"
        >
          新增内容
        </el-button>
        <el-button
          type="success"
          :icon="useRenderIcon(UploadFill)"
          :disabled="!selectedRows.length"
          @click="handleBatchPublish"
        >
          批量发布
        </el-button>
        <el-button
          type="danger"
          :icon="useRenderIcon(Delete)"
          :disabled="!selectedRows.length"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <el-radio-group
          v-model="typeTab"
          class="mb-2"
          @change="handleTypeChange"
        >
          <el-radio-button
            v-for="item in CMS_TYPE_TABS"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 148 }"
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
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row, size }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDetail(row)"
            >
              详情
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 0 || row.status === 2"
              class="reset-margin"
              link
              type="success"
              :size="size"
              @click="handlePublish(row)"
            >
              {{ row.status === 0 ? "发布" : "重新发布" }}
            </el-button>
            <el-button
              v-else-if="row.status === 1"
              class="reset-margin"
              link
              type="warning"
              :size="size"
              @click="handleOffline(row)"
            >
              下线
            </el-button>
            <el-dropdown
              trigger="click"
              @command="command => handleRowCommand(String(command), row)"
            >
              <el-button class="reset-margin" link type="primary" :size="size">
                更多
                <el-icon class="el-icon--right">
                  <IconifyIconOffline :icon="ArrowDown" />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="top">
                    {{ row.topWeight > 0 ? "取消置顶" : "置顶" }}
                  </el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

// 标题单元格：置顶 tag + 类型 tag + 可点击标题
:deep(.cms-article-title) {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}
</style>
