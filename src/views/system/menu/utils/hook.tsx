import editForm from "../form.vue";
import { message } from "@/utils/message";
import {
  getMenuTree,
  deleteMenus,
  getMenuDetail,
  addMenu,
  editMenu
} from "@/api/system";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "../utils/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import { mapIcon } from "@/router/menu";

export function useMenu() {
  const form = reactive({
    name: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const getMenuType = (type: number, text = false) => {
    switch (type) {
      case 1:
        return text ? "目录" : "primary";
      case 2:
        return text ? "菜单" : "success";
      case 3:
        return text ? "按钮" : "info";
      default:
        return text ? "未知" : "warning";
    }
  };

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "name",
      align: "left",
      width: 220,
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {row.icon
              ? h(useRenderIcon(mapIcon(row.icon)), {
                  style: { paddingTop: "1px" }
                })
              : null}
          </span>
          <span>{row.name}</span>
        </>
      )
    },
    {
      label: "菜单类型",
      prop: "type",
      width: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={getMenuType(row.type) as any}
          effect="plain"
        >
          {getMenuType(row.type, true)}
        </el-tag>
      )
    },
    {
      label: "路由地址",
      prop: "route"
    },
    {
      label: "组件路径",
      prop: "component",
      formatter: ({ type, route, component }) =>
        type === 3 ? "" : isAllEmpty(component) ? route : component
    },
    {
      label: "权限标识",
      prop: "permission"
    },
    {
      label: "排序",
      prop: "sort",
      width: 70
    },
    {
      label: "显示",
      prop: "showFlag",
      formatter: ({ showFlag }) => (showFlag === 1 ? "是" : "否"),
      width: 70
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  /** 前端按名称过滤菜单树，命中节点的祖先链保留 */
  function filterTreeByName(nodes: any[], keyword: string): any[] {
    const result: any[] = [];
    for (const node of nodes) {
      const children = node.children
        ? filterTreeByName(node.children, keyword)
        : [];
      if (node.name.includes(keyword) || children.length > 0) {
        result.push(
          children.length > 0
            ? { ...node, children }
            : { ...node, children: [] }
        );
      }
    }
    return result;
  }

  async function onSearch() {
    loading.value = true;
    try {
      // 后端已是树结构（MenuTreeResult.children）；名称搜索在前端过滤并保留父链
      const data = await getMenuTree();
      dataList.value = isAllEmpty(form.name)
        ? (data ?? [])
        : filterTreeByName(data ?? [], form.name);
    } finally {
      loading.value = false;
    }
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  /** 新增/修改菜单：修改时先调详情接口回显完整字段（列表节点无 description） */
  function openDialog(title = "新增", row?: any) {
    const isEdit = title === "修改";
    const openDialogWith = (extra: Partial<FormItemProps>) => {
      addDialog({
        title: `${title}菜单`,
        props: {
          formInline: {
            parentId: row?.parentId ?? 0,
            higherMenuOptions: cloneDeep(dataList.value),
            name: row?.name ?? "",
            type: row?.type ?? 1,
            description: "",
            icon: row?.icon ?? "",
            route: row?.route ?? "",
            component: row?.component ?? "",
            permission: row?.permission ?? "",
            sort: row?.sort ?? 1,
            enabled: row?.enabled ?? 1,
            showFlag: row?.showFlag ?? 1,
            ...extra
          }
        },
        width: "45%",
        draggable: true,
        fullscreen: deviceDetection(),
        fullscreenIcon: true,
        closeOnClickModal: false,
        contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
        beforeSure: (done, { options }) => {
          const FormRef = formRef.value.getRef();
          // higherMenuOptions 是上级菜单树选项，仅表单展示用，不提交后端
          const { higherMenuOptions: _opts, ...payload } = options.props
            .formInline as FormItemProps;
          FormRef.validate(async valid => {
            if (!valid) return;
            if (isEdit) {
              await editMenu({ id: row.id, ...payload });
              message(`已修改菜单「${payload.name}」`, { type: "success" });
            } else {
              await addMenu({ ...payload });
              message(`已新增菜单「${payload.name}」`, { type: "success" });
            }
            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          });
        }
      });
    };

    if (isEdit) {
      getMenuDetail(row.id).then(detail => {
        openDialogWith({ description: detail.description ?? "" });
      });
    } else {
      openDialogWith({});
    }
  }

  async function handleDelete(row) {
    await deleteMenus([row.id]);
    message(`已删除菜单「${row.name}」`, { type: "success" });
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    onSearch,
    resetForm,
    openDialog,
    handleDelete
  };
}
