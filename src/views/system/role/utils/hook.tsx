import editForm from "../form.vue";
import { message } from "@/utils/message";
import { usePublicHooks } from "../../hooks";
import {
  getRolePage,
  getRoleDetail,
  addRole,
  editRole,
  deleteRoles,
  getOwnMenuIds,
  grantRoleMenus,
  getMenuTree
} from "@/api/system";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { type Ref, reactive, ref, onMounted, h, watch } from "vue";

export function useRole(treeRef: Ref) {
  const form = reactive({
    name: "",
    code: "",
    enabled: undefined as number | undefined
  });
  const curRow = ref<RoleItemShape>();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref<number[]>([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(true);
  const treeSearchValue = ref();
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { tagStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "name",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  type RoleItemShape = {
    id: number;
    name: string;
    code: string;
    description?: string;
    enabled: number;
  };

  const columns: TableColumnList = [
    {
      label: "角色编号",
      prop: "id"
    },
    {
      label: "角色名称",
      prop: "name"
    },
    {
      label: "角色标识",
      prop: "code"
    },
    {
      label: "描述",
      prop: "description",
      minWidth: 160
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-tag
          size={scope.props.size === "small" ? "small" : "default"}
          type={scope.row.enabled === 1 ? "success" : "danger"}
          effect="plain"
          style={tagStyle.value(scope.row.enabled)}
        >
          {scope.row.enabled === 1 ? "已启用" : "已停用"}
        </el-tag>
      ),
      minWidth: 90
    },
    {
      label: "操作",
      fixed: "right",
      width: 230,
      slot: "operation"
    }
  ];

  function handleDelete(row: RoleItemShape) {
    deleteRoles([row.id]).then(() => {
      message(`已删除角色「${row.name}」`, { type: "success" });
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
      const data = await getRolePage({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        nameLike: form.name || undefined,
        codeLike: form.code || undefined,
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

  async function openDialog(title = "新增", row?: RoleItemShape) {
    // 编辑态先拉详情回显（详情接口权威数据；拉取失败退回行数据，不阻塞弹窗）
    const detail =
      title === "修改" && row
        ? await getRoleDetail(row.id).catch(() => null)
        : null;
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          name: detail?.name ?? row?.name ?? "",
          code: detail?.code ?? row?.code ?? "",
          description: detail?.description ?? row?.description ?? "",
          enabled: detail?.enabled ?? row?.enabled ?? 1
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        FormRef.validate(async valid => {
          if (!valid) return;
          if (title === "新增") {
            await addRole({ ...curData });
            message(`已新增角色「${curData.name}」`, { type: "success" });
          } else {
            await editRole({ id: row.id, ...curData });
            message(`已修改角色「${curData.name}」`, { type: "success" });
          }
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        });
      }
    });
  }

  /** 收集树中所有叶子节点 id：回显勾选时只 set 叶子，父级由联动自动推导，避免半选父被置为全选 */
  function collectLeafIds(nodes: any[], acc: number[] = []) {
    for (const node of nodes ?? []) {
      if (node.children && node.children.length > 0) {
        collectLeafIds(node.children, acc);
      } else {
        acc.push(node.id);
      }
    }
    return acc;
  }

  /** 菜单权限：打开右侧权限面板并回显已授菜单 */
  async function handleMenu(row?: RoleItemShape) {
    if (row?.id) {
      curRow.value = row;
      isShow.value = true;
      if (treeData.value.length === 0) {
        const data = await getMenuTree();
        treeData.value = data ?? [];
        treeIds.value = collectLeafIds(treeData.value);
      }
      const ownIds = (await getOwnMenuIds(row.id)) ?? [];
      const ownSet = new Set(ownIds);
      // 只勾选已授的叶子节点，父级由父子联动自动置半选/全选
      treeRef.value?.setCheckedKeys(treeIds.value.filter(id => ownSet.has(id)));
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存：勾选 + 半选并集提交（父链完整，后端覆盖式保存） */
  async function handleSave() {
    const { id, name } = curRow.value;
    const menuIds = [
      ...(treeRef.value?.getCheckedKeys() ?? []),
      ...(treeRef.value?.getHalfCheckedKeys() ?? [])
    ];
    await grantRoleMenus({ roleId: id, menuIds });
    message(`角色「${name}」的菜单权限已保存`, { type: "success" });
  }

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return node.name!.includes(query);
  };

  onMounted(async () => {
    onSearch();
    const data = await getMenuTree();
    treeData.value = data ?? [];
    treeIds.value = collectLeafIds(treeData.value);
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleSave,
    handleDelete,
    filterMethod,
    onQueryChanged,
    handleSizeChange,
    handleCurrentChange
  };
}
