import detailComp from "../detail.vue";
import { message } from "@/utils/message";
import { getOpLogPage, deleteOpLogs, type OpLogItem } from "@/api/basic";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h } from "vue";

export function useOpLog() {
  const form = reactive({
    name: "",
    userDisplayName: "",
    success: undefined as number | undefined
  });
  const dataList = ref<Array<OpLogItem>>([]);
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
      label: "事件名称",
      prop: "name",
      minWidth: 140
    },
    {
      label: "时间",
      prop: "time",
      minWidth: 160
    },
    {
      label: "操作人",
      prop: "userDisplayName",
      minWidth: 100
    },
    {
      label: "消息",
      prop: "message",
      minWidth: 160
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-tag
          size={scope.props.size === "small" ? "small" : "default"}
          type={scope.row.success === 1 ? "success" : "danger"}
          effect="plain"
        >
          {scope.row.success === 1 ? "成功" : "失败"}
        </el-tag>
      ),
      minWidth: 80
    },
    {
      label: "耗时（毫秒）",
      prop: "timeSpent",
      minWidth: 100
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      slot: "operation"
    }
  ];

  /** 详情：addDialog 只读展示 */
  function openDetail(row: OpLogItem) {
    addDialog({
      title: `操作日志详情（#${row.id}）`,
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

  function handleDelete(row: OpLogItem) {
    deleteOpLogs([row.id]).then(() => {
      message(`已删除操作日志「${row.name}」`, { type: "success" });
      onSearch();
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
      const data = await getOpLogPage({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        nameLike: form.name || undefined,
        userDisplayNameLike: form.userDisplayName || undefined,
        success: form.success
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
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}
