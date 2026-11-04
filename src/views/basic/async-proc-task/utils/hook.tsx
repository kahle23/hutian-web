import detailComp from "../detail.vue";
import { getAsyncProcTaskPage, type AsyncProcTaskItem } from "@/api/basic";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h } from "vue";
import { TASK_TYPE_MAP, TASK_STATUS_MAP } from "./types";

export function useAsyncProcTask() {
  const form = reactive({
    taskType: undefined as number | undefined,
    status: undefined as number | undefined,
    originalFilename: "",
    executorName: ""
  });
  const dataList = ref<Array<AsyncProcTaskItem>>([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "编号",
      prop: "id",
      minWidth: 70
    },
    {
      label: "任务类型",
      cellRenderer: scope => {
        const conf = TASK_TYPE_MAP[scope.row.taskType];
        return conf ? (
          <el-tag size="default" type={conf.tag} effect="plain">
            {conf.text}
          </el-tag>
        ) : (
          <span>-</span>
        );
      },
      minWidth: 90
    },
    {
      label: "原文件名称",
      prop: "originalFilename",
      minWidth: 160
    },
    {
      label: "状态",
      cellRenderer: scope => {
        const conf = TASK_STATUS_MAP[scope.row.status];
        return conf ? (
          <el-tag size="default" type={conf.tag} effect="plain">
            {conf.text}
          </el-tag>
        ) : (
          <span>-</span>
        );
      },
      minWidth: 100
    },
    {
      label: "成功条数",
      prop: "successCount",
      minWidth: 90
    },
    {
      label: "失败条数",
      prop: "failureCount",
      minWidth: 90
    },
    {
      label: "总条数",
      prop: "totalCount",
      minWidth: 80
    },
    {
      label: "执行者",
      prop: "executorName",
      minWidth: 120
    },
    {
      label: "开始时间",
      prop: "beginTime",
      minWidth: 160
    },
    {
      label: "结束时间",
      prop: "endTime",
      minWidth: 160
    },
    {
      label: "操作",
      fixed: "right",
      width: 100,
      slot: "operation"
    }
  ];

  /** 详情：addDialog 只读展示 */
  function openDetail(row: AsyncProcTaskItem) {
    addDialog({
      title: `异步任务详情（#${row.id}）`,
      props: {
        row
      },
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      closeOnClickModal: false,
      contentRenderer: () => h(detailComp, { row })
    });
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const data = await getAsyncProcTaskPage({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        taskType: form.taskType,
        statusList: form.status ? [form.status] : undefined,
        originalFilenameLike: form.originalFilename || undefined,
        executorNameLike: form.executorName || undefined
      });
      dataList.value = data?.data ?? [];
      pagination.total = data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(() => {
    onSearch();
  });

  return {
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
  };
}
