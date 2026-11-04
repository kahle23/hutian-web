import type { AsyncProcTaskItem } from "@/api/basic";

/** 详情弹窗入参（只读展示，无表单） */
export interface DetailProps {
  /** 当前查看的任务行 */
  row: AsyncProcTaskItem;
}

type TagType = "primary" | "success" | "info" | "warning" | "danger";

/** 任务类型：0 缺省，1 导出，2 导入 */
export const TASK_TYPE_MAP: Record<number, { text: string; tag: TagType }> = {
  0: { text: "缺省", tag: "info" },
  1: { text: "导出", tag: "primary" },
  2: { text: "导入", tag: "success" }
};

/** 状态：0 缺省，1 待导入|导出，2 前置处理，3 导入|导出中，4 超时，5 失败，6 成功 */
export const TASK_STATUS_MAP: Record<number, { text: string; tag: TagType }> = {
  0: { text: "缺省", tag: "info" },
  1: { text: "待导入/导出", tag: "primary" },
  2: { text: "前置处理", tag: "primary" },
  3: { text: "导入/导出中", tag: "warning" },
  4: { text: "超时", tag: "warning" },
  5: { text: "失败", tag: "danger" },
  6: { text: "成功", tag: "success" }
};
