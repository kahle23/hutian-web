import { message } from "@/utils/message";
import {
  getCategoryPage,
  getCategoryDetail,
  addCategory,
  editCategory,
  deleteCategories,
  enableCategories,
  type CategorySmpItem
} from "@/api/cms";
import { cmsTypeLabel } from "../../constants";
import type { CategoryFormItem, CategorySearchForm } from "./types";
import editForm from "../form.vue";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";

export function useCategory() {
  const form = reactive<CategorySearchForm>({
    name: "",
    code: "",
    type: undefined,
    enabled: undefined
  });
  const formRef = ref();
  const dataList = ref<Array<CategorySmpItem>>([]);
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
      label: "编码",
      prop: "code",
      minWidth: 110,
      cellRenderer: ({ row }) =>
        row.code ? (
          <el-tag size="small" effect="plain">
            {row.code}
          </el-tag>
        ) : (
          "-"
        )
    },
    {
      label: "名称",
      prop: "name",
      minWidth: 140
    },
    {
      label: "内容类型",
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag size="small" type="primary" effect="plain">
          {cmsTypeLabel(row.type)}
        </el-tag>
      )
    },
    {
      label: "排序",
      prop: "sort",
      minWidth: 70
    },
    {
      label: "文章数",
      prop: "articleCount",
      minWidth: 80
    },
    {
      label: "启用",
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-switch
          modelValue={row.enabled}
          activeValue={1}
          inactiveValue={0}
          activeText="启用"
          inactiveText="禁用"
          inlinePrompt
          onChange={(val: number) => handleEnable(row as CategorySmpItem, val)}
        />
      )
    },
    {
      label: "描述",
      prop: "description",
      minWidth: 140
    },
    {
      label: "操作",
      fixed: "right",
      width: 140,
      slot: "operation"
    }
  ];

  /** 行内启用开关：接口成功后刷新（失败由 http 层提示，行数据不变） */
  function handleEnable(row: CategorySmpItem, val: number) {
    enableCategories({ ids: [row.id], enabled: val }).then(() => {
      message(`分类「${row.name}」已${val === 1 ? "启用" : "禁用"}`, {
        type: "success"
      });
      onSearch();
    });
  }

  function handleDelete(row: CategorySmpItem) {
    deleteCategories([row.id]).then(() => {
      message(`已删除分类「${row.name}」`, { type: "success" });
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
      const data = await getCategoryPage({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        nameLike: form.name || undefined,
        code: form.code || undefined,
        typeList: form.type ? [form.type] : undefined,
        enabled: form.enabled
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

  /** 新增/编辑弹窗（ReDialog + form.vue；编辑清空 code 时提交 clearFields） */
  async function openDialog(title = "新增", row?: CategorySmpItem) {
    const isEdit = title === "修改";
    // 编辑态先拉详情回显（拉取失败退回行数据，不阻塞弹窗）
    const detail =
      isEdit && row ? await getCategoryDetail(row.id).catch(() => null) : null;
    addDialog({
      title: `${title}分类`,
      props: {
        formInline: {
          name: detail?.name ?? row?.name ?? "",
          code: detail?.code ?? row?.code ?? "",
          type: detail?.type ?? row?.type ?? 1,
          icon: detail?.icon ?? row?.icon ?? "",
          sort: detail?.sort ?? row?.sort ?? 0,
          enabled: detail?.enabled ?? row?.enabled ?? 1,
          description: detail?.description ?? row?.description ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as CategoryFormItem;
        FormRef.validate(async valid => {
          if (!valid) return;
          if (isEdit) {
            // 编码由有值被清空 → 显式置空（clearFields 语义）
            const clearFields: Array<string> = [];
            if (row?.code && !curData.code) clearFields.push("code");
            await editCategory({
              id: row!.id,
              name: curData.name,
              code: curData.code || undefined,
              type: curData.type,
              icon: curData.icon || undefined,
              sort: curData.sort,
              enabled: curData.enabled,
              description: curData.description || undefined,
              ...(clearFields.length ? { clearFields } : {})
            });
            message(`已修改分类「${curData.name}」`, { type: "success" });
          } else {
            await addCategory({
              name: curData.name,
              code: curData.code || undefined,
              type: curData.type,
              icon: curData.icon || undefined,
              sort: curData.sort,
              enabled: curData.enabled,
              description: curData.description || undefined
            });
            message(`已新增分类「${curData.name}」`, { type: "success" });
          }
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        });
      }
    });
  }

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
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}
