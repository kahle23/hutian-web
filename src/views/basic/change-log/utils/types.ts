import type { ChangeLogItem } from "@/api/basic";

/** 详情弹窗入参（只读展示，无表单） */
export interface DetailProps {
  /** 当前查看的日志行 */
  row: ChangeLogItem;
}
