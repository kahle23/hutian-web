/**
 * CMS 枚举选项与码值 label（码值来源：docs/cms-design.md §2）
 * 列表页签/下拉/表格 tag/详情渲染共用。
 */

/** 通用下拉选项 */
export type CmsOption = {
  value: number;
  label: string;
};

/** el-tag type 取值（EP 联合类型，供状态 tag 等使用） */
export type CmsTagType = "primary" | "success" | "warning" | "danger" | "info";

/** 内容类型（编辑页/搜索下拉用；0 缺省不外露，label 函数兜底展示） */
export const CMS_TYPE_OPTIONS: Array<CmsOption> = [
  { value: 1, label: "文章" },
  { value: 12, label: "公告" },
  { value: 11, label: "版本" },
  { value: 13, label: "帮助" },
  { value: 14, label: "提示" }
];

/** 文章列表类型页签（0=全部哨兵，typeList 不传） */
export const CMS_TYPE_TABS: Array<CmsOption> = [
  { value: 0, label: "全部" },
  ...CMS_TYPE_OPTIONS
];

/** 内容状态 */
export const CMS_STATUS_OPTIONS: Array<CmsOption> = [
  { value: 0, label: "草稿" },
  { value: 1, label: "已发布" },
  { value: 2, label: "已下线" }
];

/** 正文格式（编辑页 radio 用；0 缺省不外露） */
export const CMS_CONTENT_TYPE_OPTIONS: Array<CmsOption> = [
  { value: 3, label: "富文本" },
  { value: 2, label: "Markdown" },
  { value: 1, label: "纯文本" }
];

/** 留痕动作（详情时间线） */
export const CMS_LOG_ACTION_OPTIONS: Array<CmsOption> = [
  { value: 1, label: "创建" },
  { value: 2, label: "发布" },
  { value: 3, label: "下线" },
  { value: 4, label: "置顶" },
  { value: 5, label: "取消置顶" },
  { value: 6, label: "编辑" },
  { value: 7, label: "复制" }
];

/** 内容状态对应的 el-tag type */
export const CMS_STATUS_TAG_TYPES: Record<number, CmsTagType> = {
  0: "warning",
  1: "success",
  2: "info"
};

/** 通用 label 查找 */
function optionLabel(options: Array<CmsOption>, value?: number): string {
  const hit = options.find(it => it.value === value);
  return hit?.label ?? "缺省";
}

/** 内容类型 label */
export function cmsTypeLabel(value?: number): string {
  return optionLabel(CMS_TYPE_OPTIONS, value);
}

/** 内容状态 label */
export function cmsStatusLabel(value?: number): string {
  return optionLabel(CMS_STATUS_OPTIONS, value);
}

/** 正文格式 label */
export function cmsContentTypeLabel(value?: number): string {
  return optionLabel(CMS_CONTENT_TYPE_OPTIONS, value);
}

/** 留痕动作 label */
export function cmsLogActionLabel(value?: number): string {
  return optionLabel(CMS_LOG_ACTION_OPTIONS, value);
}

/** 内容状态对应的 el-tag type（warning/success/info） */
export function cmsStatusTagType(value?: number): CmsTagType {
  return CMS_STATUS_TAG_TYPES[value ?? -1] ?? "info";
}
