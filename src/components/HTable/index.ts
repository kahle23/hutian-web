import htTable from "./src/index";
import { withInstall } from "@/utils/ht-utils";

/** 壶天自研表格组件，围绕 `el-table` 的薄封装（替代原表格组件依赖） */
export const HTable = withInstall(htTable);

export default HTable;

export * from "./types";
