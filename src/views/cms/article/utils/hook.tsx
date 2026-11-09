import { message } from "@/utils/message";
import {
  getArticlePage,
  getCategoryList,
  deleteArticles,
  publishArticles,
  offlineArticles,
  topArticle,
  copyArticle,
  type ArticleSmpItem,
  type CategorySmpItem
} from "@/api/cms";
import {
  CMS_TYPE_TABS,
  cmsTypeLabel,
  cmsStatusLabel,
  cmsStatusTagType
} from "../../constants";
import type { ArticleSearchForm, ArticleSelection } from "./types";
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import type { PaginationProps } from "@pureadmin/table";

export function useArticle() {
  const router = useRouter();

  const form = reactive<ArticleSearchForm>({
    title: "",
    categoryId: undefined,
    status: undefined,
    publishTimeRange: undefined
  });
  /** 类型页签（0=全部） */
  const typeTab = ref(1);
  const categoryOptions = ref<Array<CategorySmpItem>>([]);
  const dataList = ref<Array<ArticleSmpItem>>([]);
  const selectedRows = ref<ArticleSelection>([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      type: "selection",
      align: "center",
      width: 48
    },
    {
      label: "标题",
      prop: "title",
      minWidth: 240,
      cellRenderer: ({ row }) => (
        <div class="cms-article-title">
          {row.topWeight > 0 ? (
            <el-tag size="small" type="danger" effect="dark">
              置顶
            </el-tag>
          ) : null}
          <el-tag size="small" type="primary" effect="plain">
            {cmsTypeLabel(row.type)}
          </el-tag>
          <el-link
            type="primary"
            underline={false}
            onClick={() => openDetail(row as ArticleSmpItem)}
          >
            {(row as ArticleSmpItem).title}
          </el-link>
        </div>
      )
    },
    {
      label: "分类",
      prop: "categoryName",
      minWidth: 100,
      formatter: row => (row.categoryName ? row.categoryName : "未分类")
    },
    {
      label: "状态",
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag size="small" type={cmsStatusTagType(row.status)} effect="plain">
          {cmsStatusLabel(row.status)}
        </el-tag>
      )
    },
    {
      label: "发布人",
      prop: "publishUserName",
      minWidth: 90,
      formatter: row => (row.publishUserName ? row.publishUserName : "-")
    },
    {
      label: "发布时间",
      prop: "publishTime",
      minWidth: 150,
      formatter: row => (row.publishTime ? row.publishTime : "-")
    },
    {
      label: "到期时间",
      prop: "expireTime",
      minWidth: 150,
      formatter: row => (row.expireTime ? row.expireTime : "长期有效")
    },
    {
      label: "浏览数",
      prop: "viewCount",
      minWidth: 80
    },
    {
      label: "操作",
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ];

  /** 行内更多下拉命令分发 */
  function handleRowCommand(command: string, row: ArticleSmpItem) {
    if (command === "top") handleTop(row);
    else if (command === "copy") handleCopy(row);
    else if (command === "delete") handleDelete(row);
  }

  /** 发布（草稿）/重新发布（已下线），ElMessageBox 确认 */
  function handlePublish(row: ArticleSmpItem) {
    const tip = row.status === 2 ? "重新发布" : "发布";
    ElMessageBox.confirm(`是否确认${tip}文章「${row.title}」？`, `${tip}确认`, {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true
    })
      .then(() => publishArticles({ ids: [row.id] }))
      .then(() => {
        message(`已${tip}文章「${row.title}」`, { type: "success" });
        onSearch();
      })
      .catch(() => {});
  }

  /** 下线（仅已发布），ElMessageBox 确认 */
  function handleOffline(row: ArticleSmpItem) {
    ElMessageBox.confirm(
      `是否确认下线文章「${row.title}」？下线后门户不可见`,
      "下线确认",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        draggable: true
      }
    )
      .then(() => offlineArticles([row.id]))
      .then(() => {
        message(`已下线文章「${row.title}」`, { type: "success" });
        onSearch();
      })
      .catch(() => {});
  }

  /** 置顶/取消置顶（topWeight 0↔1） */
  function handleTop(row: ArticleSmpItem) {
    const nextWeight = row.topWeight > 0 ? 0 : 1;
    topArticle({ id: row.id, topWeight: nextWeight }).then(() => {
      message(
        nextWeight > 0
          ? `已置顶文章「${row.title}」`
          : `已取消置顶文章「${row.title}」`,
        { type: "success" }
      );
      onSearch();
    });
  }

  /** 复制为草稿 */
  function handleCopy(row: ArticleSmpItem) {
    copyArticle(row.id).then(newId => {
      message(`已复制为草稿（新文章 #${newId}）`, { type: "success" });
      onSearch();
    });
  }

  /** 删除，ElMessageBox 确认 */
  function handleDelete(row: ArticleSmpItem) {
    ElMessageBox.confirm(`是否确认删除文章「${row.title}」？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true
    })
      .then(() => deleteArticles([row.id]))
      .then(() => {
        message(`已删除文章「${row.title}」`, { type: "success" });
        onSearch();
      })
      .catch(() => {});
  }

  /** 勾选驱动：批量发布（已发布的自动跳过） */
  function handleBatchPublish() {
    const targets = selectedRows.value.filter(it => it.status !== 1);
    if (!targets.length) {
      message("所选内容均已发布，无需发布", { type: "warning" });
      return;
    }
    ElMessageBox.confirm(
      `是否确认发布所选的 ${targets.length} 条内容？`,
      "批量发布确认",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        draggable: true
      }
    )
      .then(() => publishArticles({ ids: targets.map(it => it.id) }))
      .then(() => {
        message("批量发布成功", { type: "success" });
        onSearch();
      })
      .catch(() => {});
  }

  /** 勾选驱动：批量删除 */
  function handleBatchDelete() {
    if (!selectedRows.value.length) {
      message("请先勾选要删除的内容", { type: "warning" });
      return;
    }
    ElMessageBox.confirm(
      `是否确认删除所选的 ${selectedRows.value.length} 条内容？`,
      "批量删除确认",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        draggable: true
      }
    )
      .then(() => deleteArticles(selectedRows.value.map(it => it.id)))
      .then(() => {
        message("批量删除成功", { type: "success" });
        selectedRows.value = [];
        onSearch();
      })
      .catch(() => {});
  }

  /** 新增内容 → 编辑路由页 */
  function openCreate() {
    router.push("/cms/article/edit");
  }

  /** 编辑 → 编辑路由页（query.id） */
  function openEdit(row: ArticleSmpItem) {
    router.push({ path: "/cms/article/edit", query: { id: String(row.id) } });
  }

  /** 详情 → 详情路由页（query.id） */
  function openDetail(row: ArticleSmpItem) {
    router.push({ path: "/cms/article/detail", query: { id: String(row.id) } });
  }

  function handleSelectionChange(rows: ArticleSelection) {
    selectedRows.value = rows;
  }

  /** 类型页签切换：回到第 1 页再查询 */
  function handleTypeChange() {
    pagination.currentPage = 1;
    onSearch();
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
      const data = await getArticlePage({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        titleLike: form.title || undefined,
        categoryIdList: form.categoryId ? [form.categoryId] : undefined,
        typeList: typeTab.value ? [typeTab.value] : undefined,
        statusList:
          form.status === 0 || form.status ? [form.status] : undefined,
        publishTimeBegin: form.publishTimeRange?.[0] || undefined,
        publishTimeEnd: form.publishTimeRange?.[1] || undefined
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

  async function loadCategoryOptions() {
    const data = await getCategoryList({});
    categoryOptions.value = data ?? [];
  }

  onMounted(() => {
    loadCategoryOptions();
    onSearch();
  });

  return {
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
  };
}
