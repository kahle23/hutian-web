import { http } from "@/utils/http";
import type { PageResult, PageQuery } from "@/api/system";

/**
 * cms 域接口（后端 hutian-cms，前缀 /cms）
 * 契约来源：docs/cms-design.md §2（枚举）/ §3（接口签名）。
 * 分页返回 Page<T>（http 层已解包 Result.data，业务代码拿 PageResult）；
 * 时间字段后端序列化为 "yyyy-MM-dd HH:mm:ss" 字符串；
 * 封面图/附件为手工登记的 {name,addr} 数组（库存 JSON）。
 */

/** 封面图/附件条目（手工登记，无 OSS 上传） */
export type CmsFileItem = {
  /** 文件名称 */
  name: string;
  /** 文件地址（完整 URL） */
  addr: string;
};

// ---------------- 内容分类 /cms/category ----------------

/** 分类行（CategoryResult/CategorySmpResult 公共字段） */
export type CategoryItem = {
  id: number;
  /** 分类名称 */
  name: string;
  /** 分类编码（代码层唯一校验，软删行不占位） */
  code?: string;
  /** 内容类型：0 缺省/1 文章/11 版本/12 公告/13 帮助/14 提示 */
  type: number;
  /** 图标（iconify 名称） */
  icon?: string;
  /** 排序（升序，越小越前） */
  sort: number;
  /** 是否启用：0 禁用/1 启用 */
  enabled: number;
  /** 描述 */
  description?: string;
  createTime?: string;
  modifyTime?: string;
};

/** 分类列表行（CategorySmpResult = CategoryItem + 未删文章数） */
export type CategorySmpItem = CategoryItem & {
  /** 该分类下未删文章数 */
  articleCount: number;
};

/** 分类查询（CategoryQuery） */
export type CategoryQuery = PageQuery & {
  /** 分类名称（模糊） */
  nameLike?: string;
  /** 分类编码（精确） */
  code?: string;
  /** 内容类型集合 */
  typeList?: Array<number>;
  /** 是否启用：0 禁用/1 启用 */
  enabled?: number;
};

/** 分类保存入参（CategoryAddParam） */
export type CategorySaveParam = {
  /** 分类名称（必填） */
  name: string;
  /** 分类编码（选填；非空时代码层唯一校验） */
  code?: string;
  /** 内容类型（必填） */
  type: number;
  /** 图标 */
  icon?: string;
  /** 排序（升序） */
  sort?: number;
  /** 是否启用：0 禁用/1 启用 */
  enabled?: number;
  /** 描述 */
  description?: string;
};

export type CategoryAddParam = CategorySaveParam;

/** 分类编辑入参（CategoryEditParam = 保存入参 + id + clearFields） */
export type CategoryEditParam = Partial<CategorySaveParam> & {
  id: number;
  /** 需要置空的字段名（如清空编码：["code"]） */
  clearFields?: Array<string>;
};

// ---------------- 内容文章 /cms/article ----------------

/** 文章行（ArticleItem 公共字段；不含正文与留痕） */
export type ArticleItem = {
  id: number;
  /** 内容类型：0 缺省/1 文章/11 版本/12 公告/13 帮助/14 提示 */
  type: number;
  /** 分类 id（NULL=未分类） */
  categoryId?: number;
  /** 分类名称（后端回填） */
  categoryName?: string;
  /** 标题 */
  title: string;
  /** 封面图 [{name,addr}] */
  coverImages?: Array<CmsFileItem>;
  /** 摘要（空则按正文提纯截前 200 字） */
  summary?: string;
  /** 置顶权重：0 不置顶，大于 0 越大越前 */
  topWeight: number;
  /** 正文格式：0 缺省/1 纯文本/2 Markdown/3 Html */
  contentType: number;
  /** 附件 [{name,addr}] */
  attachments?: Array<CmsFileItem>;
  /** 状态：0 草稿/1 已发布/2 已下线 */
  status: number;
  /** 发布时间（未来时间=定时发布） */
  publishTime?: string;
  /** 发布人 id */
  publishUser?: number;
  /** 发布人姓名（后端回填） */
  publishUserName?: string;
  /** 下线时间（NULL=长期有效） */
  expireTime?: string;
  /** 浏览数 */
  viewCount: number;
  createTime?: string;
  modifyTime?: string;
};

/** 文章列表行（ArticleSmpResult：同 ArticleItem 字段口径） */
export type ArticleSmpItem = ArticleItem;

/** 文章全量详情（ArticleResult = 列表字段 + 正文 + 生命周期留痕） */
export type ArticleResult = ArticleItem & {
  /** 正文 */
  content?: string;
  /** 留痕列表（actionTime 倒序，operatorName 已填；NULL=定时任务） */
  logs?: Array<ArticleLogItem>;
};

/** 文章查询（ArticleQuery） */
export type ArticleQuery = PageQuery & {
  /** 标题（模糊） */
  titleLike?: string;
  /** 分类 id 集合 */
  categoryIdList?: Array<number>;
  /** 内容类型集合 */
  typeList?: Array<number>;
  /** 状态集合：0 草稿/1 已发布/2 已下线 */
  statusList?: Array<number>;
  /** 发布时间起（yyyy-MM-dd HH:mm:ss） */
  publishTimeBegin?: string;
  /** 发布时间止（yyyy-MM-dd HH:mm:ss） */
  publishTimeEnd?: string;
};

/** 文章保存入参（ArticleAddParam；status=1 直接发布） */
export type ArticleSaveParam = {
  /** 内容类型（空则后端回落 1 文章） */
  type?: number;
  /** 分类 id（null=未分类） */
  categoryId?: number | null;
  /** 标题（必填） */
  title: string;
  /** 封面图 [{name,addr}] */
  coverImages?: Array<CmsFileItem>;
  /** 摘要（传空则后端按正文提纯截前 200 字） */
  summary?: string;
  /** 置顶权重：0 不置顶，大于 0 置顶 */
  topWeight?: number;
  /** 正文格式：1 纯文本/2 Markdown/3 Html（非法后端回落 2） */
  contentType?: number;
  /** 正文 */
  content?: string;
  /** 附件 [{name,addr}] */
  attachments?: Array<CmsFileItem>;
  /** 保存状态：0 草稿/1 直接发布 */
  status?: number;
  /** 发布时间（仅 status=1 直接发布场景；其余走 /publish） */
  publishTime?: string;
  /** 下线时间（NULL=长期有效） */
  expireTime?: string;
};

export type ArticleAddParam = ArticleSaveParam;

/** 文章编辑入参（ArticleEditParam = 保存入参 + id + clearFields；不含 status/publishTime，发布走 /publish） */
export type ArticleEditParam = Partial<ArticleSaveParam> & {
  id: number;
  /** 需要置空的字段名 */
  clearFields?: Array<string>;
};

/** 发布入参（三合一：立即/定时/批量） */
export type ArticlePublishParam = {
  ids: Array<number>;
  /** 发布时间（未来时间=定时发布，保持草稿仅登记） */
  publishTime?: string;
  /** 下线时间（NULL=长期有效） */
  expireTime?: string;
};

/** 生命周期留痕行（ArticleLogResult） */
export type ArticleLogItem = {
  id: number;
  /** 文章 id */
  articleId: number;
  /** 动作：1 创建/2 发布/3 下线/4 置顶/5 取消置顶/6 编辑/7 复制 */
  actionType: number;
  /** 操作人 id（NULL=定时任务） */
  operatorId?: number;
  /** 操作人姓名（后端回填；NULL=定时任务） */
  operatorName?: string;
  /** 动作时间 */
  actionTime: string;
  /** 详情文案 */
  detail?: string;
};

/** 留痕查询（ArticleLogQuery） */
export type ArticleLogQuery = PageQuery & {
  /** 文章 id（必填） */
  articleId: number;
  /** 动作集合 */
  actionTypeList?: Array<number>;
};

// ---------------- 触达统计 ----------------

/** 触达统计（ReadStatResult） */
export type ReadStat = {
  /** 目标人数（启用用户数） */
  targetCount: number;
  /** 已读人数 */
  readCount: number;
  /** 未读人数 */
  unreadCount: number;
  /** 触达率（1 位小数，如 85.5） */
  reachRate: number;
};

/** 已读/未读名单行（ReadUserResult） */
export type ReadUserRow = {
  /** 用户 id */
  userId: number;
  /** 用户姓名 */
  userName: string;
  /** 首次阅读时间 */
  readTime: string;
};

/** 名单分页查询（ArticleReadQuery，仅分页参数） */
export type ArticleReadQuery = PageQuery;

// ---------------- 门户 /cms/article/portal ----------------

/** 门户行（PortalResult） */
export type PortalItem = {
  id: number;
  /** 内容类型：0 缺省/1 文章/11 版本/12 公告/13 帮助/14 提示 */
  type: number;
  /** 分类 id（NULL=未分类） */
  categoryId?: number;
  /** 分类名称（后端回填） */
  categoryName?: string;
  /** 标题 */
  title: string;
  /** 封面图 [{name,addr}] */
  coverImages?: Array<CmsFileItem>;
  /** 摘要 */
  summary?: string;
  /** 置顶权重：0 不置顶，大于 0 越大越前 */
  topWeight: number;
  /** 正文格式：0 缺省/1 纯文本/2 Markdown/3 Html */
  contentType: number;
  /** 正文（详情返回） */
  content?: string;
  /** 附件 [{name,addr}] */
  attachments?: Array<CmsFileItem>;
  /** 发布时间 */
  publishTime?: string;
  /** 发布人姓名（后端回填） */
  publishUserName?: string;
  /** 浏览数 */
  viewCount: number;
  /** 是否已读：0 未读/1 已读（当前用户口径，列表返回） */
  isRead?: number;
  /** 全文搜索命中片段（radius 60） */
  snippet?: string;
};

/** 门户查询（PortalQuery；categoryId=0 哨兵=未分类） */
export type PortalQuery = PageQuery & {
  /** 分类 id：0=未分类（isNull） */
  categoryId?: number;
  /** 内容类型集合（公告中心固定 [12]） */
  typeList?: Array<number>;
  /** 关键字 */
  keyword?: string;
  /** 全文搜索（keyword LIKE 标题/摘要/正文） */
  fullText?: boolean;
};

/** 门户分类计数行 */
export type CategoryPortalRow = {
  id: number;
  name: string;
  /** 该分类可见公告数 */
  articleCount: number;
};

/** 门户分类计数返回（CategoryPortalListResult） */
export type CategoryPortalList = {
  /** 全部可见公告数 */
  totalCount: number;
  /** 未分类公告数 */
  uncategorizedCount: number;
  /** 启用分类及计数 */
  categoryList: Array<CategoryPortalRow>;
};

// ---------------- 文章接口函数 ----------------

/** 新增文章：status=1 直接发布（补发布时间/发布人），status=0 存草稿 */
export const addArticle = (data: ArticleAddParam) => {
  return http.request<number>("post", "/cms/article/add", { data });
};

/** 编辑文章（不含 status/publishTime，发布走 /publish；留痕 EDIT） */
export const editArticle = (data: ArticleEditParam) => {
  return http.request<void>("post", "/cms/article/edit", { data });
};

/** 批量逻辑删 */
export const deleteArticles = (ids: Array<number>) => {
  return http.request<void>("post", "/cms/article/delete", { data: { ids } });
};

/** 文章详情：全字段 + coverImages/attachments + categoryName/publishUserName + logs 留痕 */
export const getArticleDetail = (recordId: number) => {
  return http.request<ArticleResult>("get", `/cms/article/${recordId}`);
};

/** 文章分页列表（默认排序 topWeight DESC, publishTime DESC, id DESC） */
export const getArticlePage = (data: ArticleQuery) => {
  return http.request<PageResult<ArticleSmpItem>>(
    "post",
    "/cms/article/query-page",
    { data }
  );
};

/** 文章不分页列表 */
export const getArticleList = (data: ArticleQuery) => {
  return http.request<Array<ArticleSmpItem>>(
    "post",
    "/cms/article/query-list",
    {
      data
    }
  );
};

/** 发布三合一：立即发布/定时发布（publishTime>now 保持草稿）/批量发布 */
export const publishArticles = (data: ArticlePublishParam) => {
  return http.request<void>("post", "/cms/article/publish", { data });
};

/** 批量下线（仅已发布可下线；置 status=2） */
export const offlineArticles = (ids: Array<number>) => {
  return http.request<void>("post", "/cms/article/offline", { data: { ids } });
};

/** 置顶/取消置顶：topWeight 0=取消置顶，>0 置顶 */
export const topArticle = (data: { id: number; topWeight: number }) => {
  return http.request<void>("post", "/cms/article/top", { data });
};

/** 复制为草稿：标题+"（副本）"，清空置顶/发布/浏览信息；返回新文章 id */
export const copyArticle = (recordId: number) => {
  return http.request<number>("post", `/cms/article/copy/${recordId}`);
};

/** 触达统计：目标/已读/未读人数与触达率 */
export const getArticleReadStat = (recordId: number) => {
  return http.request<ReadStat>("get", `/cms/article/${recordId}/read-stat`);
};

/** 已读名单分页 */
export const getArticleReadUsers = (
  recordId: number,
  data: ArticleReadQuery
) => {
  return http.request<PageResult<ReadUserRow>>(
    "post",
    `/cms/article/${recordId}/read-users`,
    { data }
  );
};

/** 未读名单分页（启用用户 LEFT JOIN 已读表 IS NULL） */
export const getArticleUnreadUsers = (
  recordId: number,
  data: ArticleReadQuery
) => {
  return http.request<PageResult<ReadUserRow>>(
    "post",
    `/cms/article/${recordId}/unread-users`,
    { data }
  );
};

// ---------------- 分类接口函数 ----------------

/** 新增分类（code 非空时代码层唯一校验） */
export const addCategory = (data: CategoryAddParam) => {
  return http.request<number>("post", "/cms/category/add", { data });
};

/** 编辑分类（清空编码等置空字段走 clearFields） */
export const editCategory = (data: CategoryEditParam) => {
  return http.request<void>("post", "/cms/category/edit", { data });
};

/** 批量逻辑删（分类下有未删文章时后端拦截报错） */
export const deleteCategories = (ids: Array<number>) => {
  return http.request<void>("post", "/cms/category/delete", { data: { ids } });
};

/** 批量启用/禁用 */
export const enableCategories = (data: {
  ids: Array<number>;
  enabled: number;
}) => {
  return http.request<void>("post", "/cms/category/enable", { data });
};

/** 分类详情 */
export const getCategoryDetail = (recordId: number) => {
  return http.request<CategorySmpItem>("get", `/cms/category/${recordId}`);
};

/** 分类分页列表（排序 sort ASC, id DESC；含 articleCount） */
export const getCategoryPage = (data: CategoryQuery) => {
  return http.request<PageResult<CategorySmpItem>>(
    "post",
    "/cms/category/query-page",
    { data }
  );
};

/** 分类不分页列表（下拉全量用） */
export const getCategoryList = (data: CategoryQuery) => {
  return http.request<Array<CategorySmpItem>>(
    "post",
    "/cms/category/query-list",
    {
      data
    }
  );
};

// ---------------- 留痕接口函数（只读） ----------------

/** 留痕分页列表（operatorName 已填，actionTime 倒序） */
export const getArticleLogPage = (data: ArticleLogQuery) => {
  return http.request<PageResult<ArticleLogItem>>(
    "post",
    "/cms/article/log/query-page",
    { data }
  );
};

/** 留痕详情 */
export const getArticleLogDetail = (recordId: number) => {
  return http.request<ArticleLogItem>("get", `/cms/article/log/${recordId}`);
};

// ---------------- 门户接口函数（登录即可） ----------------

/** 门户分页列表：可见性=已发布未到期，行含 isRead/snippet/categoryName/publishUserName */
export const getPortalPage = (data: PortalQuery) => {
  return http.request<PageResult<PortalItem>>(
    "post",
    "/cms/article/portal/query-page",
    { data }
  );
};

/** 门户详情：可见性校验 + 浏览数自增 + 记已读 + 返回全字段 */
export const getPortalDetail = (recordId: number) => {
  return http.request<PortalItem>("get", `/cms/article/portal/${recordId}`);
};

/** 最新公告（type=12，前 limit 条） */
export const getNoticeLatest = (limit = 5) => {
  return http.request<Array<PortalItem>>(
    "get",
    "/cms/article/portal/notice-latest",
    {
      params: { limit }
    }
  );
};

/** 当前用户公告（type=12）未读数 */
export const getPortalUnreadCount = () => {
  return http.request<number>("get", "/cms/article/portal/unread-count");
};

/** 门户分类计数（启用分类 GROUP BY；totalCount/uncategorizedCount） */
export const getPortalCategoryList = (type = 12) => {
  return http.request<CategoryPortalList>(
    "get",
    "/cms/article/portal/category-list",
    { params: { type } }
  );
};

/** 我的已读分页（op_time=首次阅读时间） */
export const getMyReadPage = (data: PortalQuery) => {
  return http.request<PageResult<PortalItem>>(
    "post",
    "/cms/article/portal/my-read",
    { data }
  );
};

/** 我的未读分页 */
export const getMyUnreadPage = (data: PortalQuery) => {
  return http.request<PageResult<PortalItem>>(
    "post",
    "/cms/article/portal/my-unread",
    { data }
  );
};
