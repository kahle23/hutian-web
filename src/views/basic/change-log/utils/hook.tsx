import detailComp from "../detail.vue";
import { message } from "@/utils/message";
import {
  getChangeLogPage,
  deleteChangeLogs,
  type ChangeLogItem
} from "@/api/basic";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h } from "vue";

export function useChangeLog() {
  const form = reactive({
    userDisplayName: "",
    orgName: "",
    message: ""
  });
  const dataList = ref<Array<ChangeLogItem>>([]);
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
      label: "机构名称",
      prop: "orgName",
      minWidth: 120
    },
    {
      label: "业务ID",
      prop: "businessId",
      minWidth: 120
    },
    {
      label: "消息",
      prop: "message",
      minWidth: 160
    },
    {
      label: "服务器应用名称",
      prop: "serverAppName",
      minWidth: 140
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      slot: "operation"
    }
  ];

  /** 详情：addDialog 只读展示 */
  function openDetail(row: ChangeLogItem) {
    addDialog({
      title: `变动日志详情（#${row.id}）`,
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

  function handleDelete(row: ChangeLogItem) {
    deleteChangeLogs([row.id]).then(() => {
      message(`已删除变动日志 #${row.id}`, { type: "success" });
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
      const data = await getChangeLogPage({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        userDisplayNameLike: form.userDisplayName || undefined,
        orgNameLike: form.orgName || undefined,
        messageLike: form.message || undefined
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
