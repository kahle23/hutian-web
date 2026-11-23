/**
 * HTable（壶天自研表格组件）
 *
 * 围绕 `el-table` 的薄封装，替代原表格组件依赖（编译产物约 16K）。
 * 组件签名与行为对齐原包 PureTable：
 * - `columns` 支持 `hide` / `slot` / `headerSlot` / `children` / `cellRenderer` /
 *   `headerRenderer` / `filterIconSlot` / `expandSlot` 拓展属性；
 * - `pagination` 传入即渲染分页，并回写 `pageSize` / `currentPage`（与原包一致），
 *   同时对外抛出 `page-size-change` / `page-current-change`；
 * - `adaptive` + `adaptiveConfig` 自适应视口高度（`setAdaptive` 同步计算）；
 * - `loading` / `loadingConfig` 走全局 `v-loading` 指令；
 * - 未声明的属性与事件经 `$attrs` 透传给 `el-table`；
 * - 暴露 `getTableRef` / `getTableDoms` / `setAdaptive` / `setHeaderSticky` 方法。
 * 原包类型声明已存档于 docs/vendor-ref/table-types/。
 */
import {
  type PropType,
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  resolveDirective,
  unref,
  withDirectives
} from "vue";
import { ElPagination, ElTable, ElTableColumn } from "element-plus";
import { debounce, useDark } from "@/utils/ht-utils";
import type {
  AdaptiveConfig,
  Align,
  LoadingConfig,
  PaginationProps,
  Size,
  TableColumns
} from "../types";

const props = {
  /** 显示的数据 */
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  /** 表格的尺寸 */
  size: {
    type: String as PropType<Size>,
    default: undefined
  },
  /** 列配置 */
  columns: {
    type: Array as PropType<TableColumns[]>,
    default: () => []
  },
  /** 是否显示加载动画 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 加载动画相关配置 */
  loadingConfig: {
    type: Object as PropType<LoadingConfig>,
    default: undefined
  },
  /** 整个表格所有列的对齐方式 */
  alignWhole: {
    type: String as PropType<Align>,
    default: undefined
  },
  /** 整个表格所有表头的对齐方式 */
  headerAlign: {
    type: String as PropType<Align>,
    default: undefined
  },
  /** 表格行鼠标悬浮时的背景色 */
  rowHoverBgColor: {
    type: String,
    default: undefined
  },
  /** 分页配置，传入即渲染分页 */
  pagination: {
    type: Object as PropType<PaginationProps>,
    default: undefined
  },
  /** 撑满内容区自适应高度 */
  adaptive: {
    type: Boolean,
    default: false
  },
  /** 自适应高度相关配置 */
  adaptiveConfig: {
    type: Object as PropType<AdaptiveConfig>,
    default: undefined
  },
  /** 列内容过长被隐藏时显示 `tooltip` 的默认值 */
  showOverflowTooltip: {
    type: [Boolean, Object] as PropType<boolean | Record<string, any>>,
    default: false
  }
};

export default defineComponent({
  // 模板中 `<ht-table` 经 camelize+capitalize 解析为 "HtTable"，名称必须一致才能命中全局注册
  name: "HtTable",
  props,
  emits: ["page-size-change", "page-current-change"],
  setup(props, { attrs, emit, slots, expose }) {
    const tableRef = ref();
    const { isDark } = useDark();

    /** el-table 的 ref，功能同 element-plus 的 Table 实例 */
    const getTableRef = () => unref(tableRef);

    /** 获取 el-table 内部的 dom 引用，如 `tableWrapper` */
    const getTableDoms = () => {
      const elTable = getTableRef() as any;
      const doms = elTable?.$refs ?? {};
      if (!doms.tableWrapper && elTable?.$el) {
        doms.tableWrapper = elTable.$el;
      }
      return doms;
    };

    /** 自适应视口高度：height = 视口高 - 表格距顶部距离 - offsetBottom */
    const setAdaptive = async () => {
      await nextTick();
      if (!props.adaptive) return;
      const tableWrapper = getTableDoms()?.tableWrapper as HTMLElement;
      if (!tableWrapper) return;
      const offsetBottom = props.adaptiveConfig?.offsetBottom ?? 96;
      tableWrapper.style.height = `${
        window.innerHeight -
        tableWrapper.getBoundingClientRect().top -
        offsetBottom
      }px`;
    };

    /** 表头吸顶（fixHeader !== false 时生效，行为对齐原包） */
    const setHeaderSticky = async (zIndex = 3) => {
      await nextTick();
      const headerDom =
        getTableDoms()?.tableHeaderRef?.$el ??
        (getTableDoms()?.tableWrapper as HTMLElement)?.querySelector(
          ".el-table__header-wrapper"
        );
      if (!headerDom) return;
      headerDom.style.position = "sticky";
      headerDom.style.top = "0";
      headerDom.style.zIndex = String(zIndex);
    };

    /** 加载动画背景色：优先取 loadingConfig.background，否则按深浅色主题取半透明底 */
    const loadingBackground = computed(() => {
      if (!props.loading) return {};
      return {
        "element-loading-background": props.loadingConfig?.background
          ? props.loadingConfig.background
          : isDark.value
            ? "rgba(0, 0, 0, 0.45)"
            : "rgba(255, 255, 255, 0.45)"
      };
    });

    /** 加载动画文案、图标等属性 */
    const loadingAttrs = computed(() => {
      const { text, spinner, svg, svgViewBox } = props.loadingConfig ?? {};
      return {
        "element-loading-text": text,
        "element-loading-spinner": spinner,
        "element-loading-svg": svg,
        "element-loading-svg-view-box": svgViewBox
      };
    });

    /** 分页容器样式（行为对齐原包：宽度 100%、上下 16px、按 align 对齐） */
    const paginationStyle = computed(() => {
      const { align, style } = props.pagination ?? {};
      return Object.assign(
        {
          width: "100%",
          margin: "16px 0",
          display: "flex",
          flexWrap: "wrap",
          justifyContent:
            align === "left"
              ? "flex-start"
              : align === "center"
                ? "center"
                : "flex-end"
        },
        style ?? {}
      );
    });

    /** 列渲染：拆掉拓展属性后透传给 el-table-column */
    const renderColumn = (column: TableColumns, index: number) => {
      const {
        cellRenderer,
        slot,
        headerRenderer,
        headerSlot,
        filterIconSlot,
        expandSlot,
        hide,
        children,
        prop,
        ...restColumn
      } = column;

      if (typeof hide === "function" && hide(props)) return null;
      if (typeof hide === "boolean" && hide) return null;

      /** 单元格/表头渲染器的公共入参，与原包 TableColumnRenderer 对齐 */
      const withScope = (scope: any) => ({
        ...scope,
        index: scope.$index,
        props,
        attrs
      });

      const columnSlots: Record<string, any> = {
        default: scope => {
          if (cellRenderer) return cellRenderer(withScope(scope));
          if (slot) return slots[slot]?.(withScope(scope));
          return undefined;
        }
      };

      if (headerRenderer) {
        columnSlots.header = scope => headerRenderer(withScope(scope));
      } else if (headerSlot && slots[headerSlot]) {
        columnSlots.header = scope => slots[headerSlot]?.(withScope(scope));
      }
      if (filterIconSlot && slots[filterIconSlot]) {
        columnSlots["filter-icon"] = scope =>
          slots[filterIconSlot]?.(withScope(scope));
      }
      if (expandSlot && slots[expandSlot]) {
        columnSlots.expand = scope => slots[expandSlot]?.(withScope(scope));
      }
      if (children?.length > 0) {
        columnSlots.default = () => children.map(renderColumn);
      }

      return h(
        ElTableColumn,
        Object.assign({}, restColumn, {
          key: index,
          prop: typeof prop === "function" && prop(index) ? prop(index) : prop,
          align: column.align ? column.align : props.alignWhole,
          headerAlign: column.headerAlign
            ? column.headerAlign
            : props.headerAlign,
          showOverflowTooltip: column.showOverflowTooltip
            ? column.showOverflowTooltip
            : props.showOverflowTooltip
        }) as any,
        columnSlots
      );
    };

    const render = () => {
      const loading = resolveDirective("loading");
      const tableNode = h(
        ElTable,
        Object.assign({}, props, attrs, { ref: tableRef }),
        {
          default: () => props.columns.map(renderColumn),
          append: () => slots.append?.(),
          empty: () => slots.empty?.()
        }
      );
      const paginationNode = props.pagination
        ? h(
            ElPagination,
            Object.assign({}, attrs, props.pagination, {
              class: "ht-pagination",
              style: paginationStyle.value,
              layout:
                props.pagination.layout ??
                "total, sizes, prev, pager, next, jumper",
              pageSizes: props.pagination.pageSizes ?? [5, 10, 15, 20],
              onSizeChange: (val: number) => {
                props.pagination.pageSize = val;
                emit("page-size-change", val);
              },
              onCurrentChange: (val: number) => {
                props.pagination.currentPage = val;
                emit("page-current-change", val);
              }
            })
          )
        : null;

      const contentNode = h(
        "div",
        Object.assign(
          { class: "ht-table", style: "width:100%" },
          loadingBackground.value,
          loadingAttrs.value
        ),
        [tableNode, paginationNode]
      );

      return loading
        ? withDirectives(contentNode, [[loading, props.loading]])
        : contentNode;
    };

    /** 行悬浮背景色与自适应高度的挂载逻辑（行为对齐原包） */
    const resizeHandler = debounce(
      setAdaptive,
      props.adaptiveConfig?.timeout ?? 60
    );

    onMounted(() => {
      nextTick(() => {
        if (props.rowHoverBgColor) {
          getTableDoms()?.tableWrapper?.style.setProperty(
            "--el-table-row-hover-bg-color",
            props.rowHoverBgColor,
            "important"
          );
        }
        if (props.adaptive) {
          setAdaptive();
          window.addEventListener("resize", resizeHandler);
          if (
            Reflect.has(props.adaptiveConfig ?? {}, "fixHeader") &&
            !(props.adaptiveConfig ?? {}).fixHeader
          ) {
            return;
          }
          setHeaderSticky(props.adaptiveConfig?.zIndex ?? 3);
        }
      });
    });

    onBeforeUnmount(() => {
      if (props.adaptive) {
        window.removeEventListener("resize", resizeHandler);
      }
    });

    /**
     * 显式暴露实例方法（行为对齐原包）。setup 仅返回 render 函数时若不调用
     * expose，模板 ref 拿到的实例上没有这些方法，`tableRef?.getTableRef()`
     * 这类模板表达式会在渲染期抛错并中断整个 flush 队列。
     */
    expose({
      getTableRef,
      getTableDoms,
      setAdaptive,
      setHeaderSticky
    });

    return render;
  }
});
