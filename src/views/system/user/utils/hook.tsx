import editForm from "../form.vue";
import roleForm from "../form/role.vue";
import { message } from "@/utils/message";
import { usePublicHooks } from "../../hooks";
import {
  getUserPage,
  getUserDetail,
  addUser,
  editUser,
  deleteUsers,
  resetUserPwd,
  grantUserRoles,
  getOwnRoleIds,
  getRolePage,
  type RoleItem
} from "@/api/system";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h } from "vue";

export function useUser() {
  const form = reactive({
    account: "",
    name: "",
    enabled: undefined as number | undefined
  });
  const formRef = ref();
  const roleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const roleOptions = ref<Array<RoleItem>>([]);
  const { tagStyle } = usePublicHooks();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  type UserRow = {
    id: number;
    account: string;
    name: string;
    enabled: number;
  };

  const columns: TableColumnList = [
    {
      label: "用户编号",
      prop: "id"
    },
    {
      label: "登录账号",
      prop: "account"
    },
    {
      label: "用户姓名",
      prop: "name"
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
      width: 330,
      slot: "operation"
    }
  ];

  function handleDelete(row: UserRow) {
    deleteUsers([row.id]).then(() => {
      message(`已删除用户「${row.name}」`, { type: "success" });
      onSearch();
    });
  }

  /** 重置密码 */
  function handleResetPwd(row: UserRow) {
    ElMessageBox.prompt(
      `请为用户「${row.name}（${row.account}）」设置新密码`,
      "重置密码",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPlaceholder: "请输入新密码（6-18位）",
        inputPattern: /^.{6,18}$/,
        inputErrorMessage: "密码长度应为6-18位",
        type: "warning",
        draggable: true
      }
    )
      .then(({ value }) => {
        resetUserPwd({ id: row.id, newPassword: value }).then(() => {
          message(`用户「${row.name}」的密码已重置`, { type: "success" });
        });
      })
      .catch(() => {});
  }

  /** 分配角色：回显已有角色后弹窗多选，覆盖式保存 */
  function handleGrantRole(row: UserRow) {
    Promise.all([
      roleOptions.value.length
        ? Promise.resolve()
        : getRolePage({ pageNum: 1, pageSize: 999 }).then(data => {
            roleOptions.value = data?.data ?? [];
          }),
      getOwnRoleIds(row.id)
    ]).then(([, ownRoleIds]) => {
      addDialog({
        title: `分配角色（${row.name}）`,
        props: {
          roleOptions: roleOptions.value,
          modelValue: ownRoleIds ?? []
        },
        width: "35%",
        draggable: true,
        fullscreen: deviceDetection(),
        closeOnClickModal: false,
        contentRenderer: () => h(roleForm, { ref: roleFormRef }),
        beforeSure: done => {
          const roleIds = roleFormRef.value.getSelected();
          grantUserRoles({ userId: row.id, roleIds }).then(() => {
            message(`用户「${row.name}」的角色已更新`, { type: "success" });
            done();
          });
        }
      });
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
      const data = await getUserPage({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        accountLike: form.account || undefined,
        nameLike: form.name || undefined,
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

  async function openDialog(title = "新增", row?: UserRow) {
    const isEdit = title === "修改";
    // 编辑态先拉详情回显（详情接口权威数据；拉取失败退回行数据，不阻塞弹窗）
    const detail =
      isEdit && row ? await getUserDetail(row.id).catch(() => null) : null;
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          account: detail?.account ?? row?.account ?? "",
          password: "",
          name: detail?.name ?? row?.name ?? "",
          enabled: detail?.enabled ?? row?.enabled ?? 1
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, { ref: formRef, formInline: null, edit: isEdit }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        FormRef.validate(async valid => {
          if (!valid) return;
          if (isEdit) {
            // 编辑态不改密码（改密走"重置密码"），剔除 password 字段
            const { password: _pwd, ...rest } = curData;
            await editUser({ id: row.id, ...rest });
            message(`已修改用户「${curData.name}」`, { type: "success" });
          } else {
            await addUser({ ...curData });
            message(`已新增用户「${curData.name}」`, { type: "success" });
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
    handleResetPwd,
    handleGrantRole,
    handleSizeChange,
    handleCurrentChange
  };
}
