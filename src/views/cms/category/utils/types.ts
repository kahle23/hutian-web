/** 分类新增/编辑表单（ReDialog form.vue 入参） */
export interface CategoryFormItem {
  /** 分类名称（必填） */
  name: string;
  /** 分类编码（选填，清空时提交 clearFields: ["code"]） */
  code?: string;
  /** 内容类型（必填） */
  type: number;
  /** 图标 */
  icon?: string;
  /** 排序（升序） */
  sort: number;
  /** 是否启用：0 禁用/1 启用 */
  enabled: number;
  /** 描述 */
  description?: string;
}

/** 分类表单弹窗 props */
export interface FormProps {
  formInline: CategoryFormItem;
}

/** 分类管理搜索表单 */
export interface CategorySearchForm {
  /** 分类名称（模糊） */
  name: string;
  /** 分类编码（精确） */
  code: string;
  /** 内容类型（空=全部） */
  type?: number;
  /** 是否启用（空=全部） */
  enabled?: number;
}
