/**
 * HTable 类型声明（壶天自研表格组件）
 *
 * 类型签名对齐原表格组件依赖（原包类型存档见
 * docs/vendor-ref/table-types/），仅保留 el-table 薄封装所需的面。
 */
import type { CSSProperties, VNode } from "vue";
import type {
  TableColumnCtx,
  SummaryMethod,
  ColumnStyle,
  ColumnCls,
  CellStyle,
  TreeNode,
  CellCls,
  Sort
} from "element-plus";
import type { TableOverflowTooltipOptions } from "element-plus/es/components/table/src/util";

export type Size = "large" | "default" | "small";
export type Align = "left" | "center" | "right";
export type Effect = "dark" | "light";
export type Layout = "fixed" | "auto";

export type TableColumnSortOrders = "ascending" | "descending" | null;
export type TableColumnType = "selection" | "index" | "expand";
export type TableColumnSortable = false | true | "custom";
export type TableColumnFixed = true | "left" | "right";
export type TableColumnFilterPlacement =
  | "top-start"
  | "top-end"
  | "top"
  | "bottom-start"
  | "bottom-end"
  | "bottom"
  | "left-start"
  | "left-end"
  | "left"
  | "right-start"
  | "right-end"
  | "right";

type FilterMethods = (
  value: any,
  row: any,
  column: TableColumnCtx<any>
) => void;
type RH = {
  column: TableColumnCtx<any>;
  $index: number;
};

/** 列插槽/渲染器的入参 */
export interface TableColumnScope {
  row?: any;
  column: TableColumn;
  $index: number;
}

/** cellRenderer/headerRenderer 的入参，`props`/`attrs` 为组件实例的属性 */
export interface TableColumnRenderer extends TableColumnScope {
  index: number;
  props: HTableProps;
  attrs: any;
}

/** 对齐 element-plus 的 `Table-column` 属性（未拓展部分） */
export type TableColumn = {
  /** 显示的标题 */
  label?: string;
  /** 字段名称，对应列内容的字段名，也可以使用 `property` 属性 */
  prop?: string | ((index: number) => string);
  /** 对应列的类型：`selection` 多选框、`index` 索引、`expand` 可展开按钮 */
  type?: TableColumnType;
  /** 如果设置了 `type=index`，可以通过传递 `index` 属性来自定义索引 */
  index?: number | ((index: number) => number);
  /** `column` 的 `key`，如果需要使用 `filter-change` 事件，则需要此属性标识 */
  columnKey?: string;
  /** 对应列的宽度 */
  width?: string | number;
  /** 对应列的最小宽度，剩余宽度按比例分配给设置了 `min-width` 的列 */
  minWidth?: string | number;
  /** 列是否固定在左侧或者右侧。`true` 表示固定在左侧 */
  fixed?: TableColumnFixed;
  /** 列标题 `Label` 区域渲染使用的 `Function` */
  renderHeader?: (data: RH) => VNode | string;
  /** 对应列是否可以排序，`'custom'` 代表远程排序，需监听 `sort-change` 事件 */
  sortable?: TableColumnSortable;
  /** 指定数据按照哪个属性进行排序，仅当 `sortable` 设置为 `true` 时有效 */
  sortMethod?: (a: any, b: any) => number;
  /** 指定数据按照哪个属性进行排序，支持多属性排序 */
  sortBy?: string | ((row: any, index: number) => string) | string[];
  /** 数据在排序时所使用排序策略的轮转顺序，仅当 `sortable` 为 `true` 时有效 */
  sortOrders?: Array<TableColumnSortOrders>;
  /** 对应列是否可以通过拖动改变宽度（需要在 `el-table` 上设置 `border`），默认 `true` */
  resizable?: boolean;
  /** 用来格式化内容 */
  formatter?: (
    row: any,
    column: TableColumnCtx<any>,
    cellValue: any,
    index: number
  ) => VNode | string;
  /** 当内容过长被隐藏时显示 `tooltip`，默认值为 `false` */
  showOverflowTooltip?: boolean;
  /** 对齐方式，默认值为 `left` */
  align?: Align;
  /** 表头对齐方式，若不设置该项，则使用表格的对齐方式 */
  headerAlign?: Align;
  /** 列的 `className` */
  className?: string;
  /** 当前列标题的自定义类名 */
  labelClassName?: string;
  /** 仅对 `type=selection` 的列有效，返回值决定这一行的 `CheckBox` 是否可勾选 */
  selectable?: (row: any, index: number) => boolean;
  /** 仅对 `type=selection` 的列有效，需指定 `row-key` 来让这个功能生效 */
  reserveSelection?: boolean;
  /** 数据过滤的选项，数组中的元素需要有 `text` 和 `value` 属性 */
  filters?: Array<{ text: string; value: string }>;
  /** 过滤弹出框的定位 */
  filterPlacement?: TableColumnFilterPlacement;
  /** 过滤弹出框的 `className` */
  filterClassName?: string;
  /** 数据过滤的选项是否多选，默认值为 `true` */
  filterMultiple?: boolean;
  /** 数据过滤使用的方法 */
  filterMethod?: FilterMethods;
  /** 选中的数据过滤项 */
  filteredValue?: Array<any>;
  /** 使用 `show-overflow-tooltip` 时自定义 `tooltip` 内容 */
  tooltipFormatter?: (data: {
    row: any;
    column: any;
    cellValue: any;
  }) => VNode | string;
};

/** 在 `TableColumn` 基础上拓展：`hide`、`slot`、`headerSlot`、`children`、`cellRenderer`、`headerRenderer` */
export interface TableColumns extends TableColumn {
  /** 是否隐藏 */
  hide?: boolean | CallableFunction;
  /** 自定义列的内容插槽 */
  slot?: string;
  /** 自定义表头的内容插槽 */
  headerSlot?: string;
  /** 自定义 `filter` 图标插槽 */
  filterIconSlot?: string;
  /** 展开列的自定义内容插槽 */
  expandSlot?: string;
  /** 多级表头，内部实现原理：嵌套 `el-table-column` */
  children?: Array<TableColumns>;
  /** 自定义单元格渲染器（`jsx`语法） */
  cellRenderer?: (data: TableColumnRenderer) => VNode | string;
  /** 自定义头部渲染器（`jsx`语法） */
  headerRenderer?: (data: TableColumnRenderer) => VNode | string;
}

/** 撑满内容区自适应高度相关配置 */
export type AdaptiveConfig = {
  /** 表格距离页面底部的偏移量，默认值为 `96` */
  offsetBottom?: number;
  /** 是否固定表头，默认值为 `true` */
  fixHeader?: boolean;
  /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
  timeout?: number;
  /** 表头的 `z-index`，默认值为 `3` */
  zIndex?: number;
};

/** 分页相关配置，对齐 element-plus 的 `Pagination` 属性 */
export type PaginationProps = {
  /** 分页大小，默认值：`default` */
  size?: Size;
  /** 是否为分页按钮添加背景色，默认值：`false` */
  background?: boolean;
  /** 每页显示条目个数 */
  pageSize: number;
  /** 每页显示条目数的初始值 */
  defaultPageSize?: number;
  /** 总条目数，默认值 `0` */
  total: number;
  /** 总页数，与 `total` 二选一 */
  pageCount?: number;
  /** 设置最大页码按钮数 */
  pagerCount?: number;
  /** 当前页数 */
  currentPage: number;
  /** 当前页数的初始值 */
  defaultCurrentPage?: number;
  /** 组件布局，默认值 `"total, sizes, prev, pager, next, jumper"` */
  layout?: string;
  /** 每页显示个数选择器的选项设置，默认值 `[5, 10, 15, 20]` */
  pageSizes?: number[];
  /** 每页显示个数选择器的下拉框类名 */
  popperClass?: string;
  /** 替代图标显示的上一页文字 */
  prevText?: string;
  /** 替代图标显示的下一页文字 */
  nextText?: string;
  /** 是否禁用分页，默认值：`false` */
  disabled?: boolean;
  /** 只有一页时是否隐藏 */
  hideOnSinglePage?: boolean;
  /** 分页的对齐方式，默认值：`right` */
  align?: Align;
  /** 自定义分页样式 */
  style?: CSSProperties;
  /** 自定义类名 */
  class?: string;
};

/** 加载动画相关配置 */
export type LoadingConfig = {
  /** 加载文案，默认值 `加载中...` */
  text?: string;
  /** 动画图标 */
  spinner?: string;
  /** 自定义动画 */
  svg?: string | VNode;
  /** `svg` 的 `viewBox` */
  svgViewBox?: string;
  /** 背景色，默认值 `rgba(255, 255, 255, .9)` */
  background?: string;
};

/** HTable 组件的属性声明 */
export interface HTableProps {
  /** 显示的数据 */
  data: Array<any>;
  /** 表格的尺寸 */
  size?: Size;
  /** 列配置，支持 `hide`、`slot`、`cellRenderer` 等拓展属性 */
  columns: Array<TableColumns>;
  /** 是否显示加载动画 */
  loading?: boolean;
  /** 加载动画相关配置 */
  loadingConfig?: LoadingConfig;
  /** 整个表格所有列的对齐方式 */
  alignWhole?: Align;
  /** 整个表格所有表头的对齐方式 */
  headerAlign?: Align;
  /** 表格行鼠标悬浮时的背景色 */
  rowHoverBgColor?: string;
  /** 分页配置，传入即渲染分页 */
  pagination?: PaginationProps;
  /** 撑满内容区自适应高度 */
  adaptive?: boolean;
  /** 自适应高度相关配置 */
  adaptiveConfig?: AdaptiveConfig;
}

/** el-table 原生属性中本组件显式声明以外的部分（经 `$attrs` 透传） */
export type TableProps = {
  height?: string | number;
  maxHeight?: string | number;
  stripe?: boolean;
  border?: boolean;
  fit?: boolean;
  showHeader?: boolean;
  highlightCurrentRow?: boolean;
  currentRowKey?: string | number;
  rowClassName?: ColumnCls<any>;
  rowStyle?: ColumnStyle<any>;
  cellClassName?: CellCls<any>;
  cellStyle?: CellStyle<any>;
  headerRowClassName?: ColumnCls<any>;
  headerRowStyle?: ColumnStyle<any>;
  headerCellClassName?: CellCls<any>;
  headerCellStyle?: CellStyle<any>;
  rowKey?: string | ((row: any) => string);
  emptyText?: string;
  defaultExpandAll?: boolean;
  expandRowKeys?: any[];
  defaultSort?: Sort;
  tooltipEffect?: Effect;
  tooltipOptions?: TableOverflowTooltipOptions;
  showSummary?: boolean;
  sumText?: string;
  summaryMethod?: SummaryMethod<any>;
  spanMethod?: (data: {
    row: any;
    rowIndex: number;
    column: TableColumnCtx<any>;
    columnIndex: number;
  }) => number[] | { rowspan: number; colspan: number } | undefined;
  selectOnIndeterminate?: boolean;
  indent?: number;
  lazy?: boolean;
  load?: (row: any, treeNode: TreeNode, resolve: (data: any[]) => void) => void;
  treeProps?: {
    hasChildren?: string;
    children?: string;
    checkStrictly?: boolean;
  };
  tableLayout?: Layout;
  scrollbarAlwaysOn?: boolean;
  flexible?: boolean;
  showOverflowTooltip?: boolean;
};
