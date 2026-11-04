import { http } from "@/utils/http";
import type { PageResult, PageQuery } from "@/api/system";

/**
 * basic 域接口（后端 hutian-basic，前缀 /basic）
 * 类型字段来源：hutian-basic/src/main/java/hutian/basic/pojo/{entity,param,query,result}
 * 分页返回 Page<T>（http 层已解包 Result.data，业务代码拿 PageResult）；
 * 时间字段后端序列化为 "yyyy-MM-dd HH:mm:ss" 字符串。
 */

/** kunlun Dict（动态键值对象，Add 入参的 data 字段） */
type DictData = Record<string, unknown>;

// ---------------- 操作日志 /basic/op-log ----------------

/** 操作日志行（OpLogSmpResult，列表与详情 OpLogResult 字段一致，已实测核对） */
export type OpLogItem = {
  id: number;
  /** 事件名称 */
  name: string;
  /** 时间 */
  time: string;
  message?: string;
  userId: string;
  userType: string;
  /** 用户的展示名 */
  userDisplayName: string;
  orgId: string;
  orgName: string;
  platform: string;
  tenantId: string;
  traceId: string;
  /** 请求的URI */
  requestApiUri: string;
  /** 请求的方法 */
  requestMethod: string;
  /** 请求参数（JSON） */
  input?: string;
  /** 返回结果（JSON） */
  output?: string;
  /** 是否执行成功：0 未成功，1 成功 */
  success: number;
  error?: string;
  /** 耗时（单位：毫秒） */
  timeSpent?: number;
  clientAppId: string;
  clientDeviceId: string;
  clientUserAgent: string;
  clientNetAddress: string;
  clientGeoAddress: string;
  clientGeoLocation?: string;
  serverName: string;
  serverAppName: string;
  /** 其他数据的JSON */
  dataJson?: string;
  /** 删除状态：0 未删除，1 已删除 */
  deleteStatus: number;
};

/** 操作日志查询（OpLogQuery 常用项，后端支持模糊搜索） */
export type OpLogQuery = PageQuery & {
  /** 事件名称（模糊） */
  nameLike?: string;
  /** 用户的展示名（模糊） */
  userDisplayNameLike?: string;
  /** 是否执行成功：0 未成功，1 成功 */
  success?: number;
};

/** 操作日志新增（OpLogAddParam；日志由系统自动产生，页面不提供新增） */
export type OpLogAddParam = {
  name: string;
  time?: string;
  message?: string;
  userId?: string;
  userType?: string;
  userDisplayName?: string;
  orgId?: string;
  orgName?: string;
  platform?: string;
  tenantId?: string;
  traceId?: string;
  requestApiUri?: string;
  requestMethod?: string;
  input?: string;
  output?: string;
  success?: number;
  error?: string;
  timeSpent?: number;
  clientAppId?: string;
  clientDeviceId?: string;
  clientUserAgent?: string;
  clientNetAddress?: string;
  clientGeoAddress?: string;
  clientGeoLocation?: string;
  serverName?: string;
  serverAppName?: string;
  data?: DictData;
};

/** 操作日志编辑（OpLogEditParam = Add 字段 + id/dataJson/deleteStatus，data 换为 dataJson） */
export type OpLogEditParam = Omit<OpLogAddParam, "data"> & {
  id: number;
  dataJson?: string;
  deleteStatus?: number;
};

export const addOpLog = (data: OpLogAddParam) => {
  return http.request<number>("post", "/basic/op-log/add", { data });
};

export const editOpLog = (data: OpLogEditParam) => {
  return http.request<void>("post", "/basic/op-log/edit", { data });
};

/** 批量软删 */
export const deleteOpLogs = (ids: Array<number>) => {
  return http.request<void>("post", "/basic/op-log/delete", { data: { ids } });
};

/** 详情 */
export const getOpLogDetail = (recordId: number) => {
  return http.request<OpLogItem>("get", `/basic/op-log/${recordId}`);
};

/** 分页列表 */
export const getOpLogPage = (data: OpLogQuery) => {
  return http.request<PageResult<OpLogItem>>(
    "post",
    "/basic/op-log/query-page",
    {
      data
    }
  );
};

// ---------------- 变动日志 /basic/change-log ----------------

/** 变动日志行（ChangeLogSmpResult，与详情 ChangeLogResult 字段一致） */
export type ChangeLogItem = {
  id: number;
  time: string;
  userId: string;
  userType: string;
  userDisplayName: string;
  orgId: string;
  orgName: string;
  platform: string;
  tenantId: string;
  businessId: string;
  /** 业务类型：0 缺省 */
  businessType?: number;
  message?: string;
  serverName: string;
  serverAppName: string;
  dataJson?: string;
  deleteStatus: number;
};

/** 变动日志查询（ChangeLogQuery 常用项） */
export type ChangeLogQuery = PageQuery & {
  userDisplayNameLike?: string;
  orgNameLike?: string;
  messageLike?: string;
};

/** 变动日志新增（ChangeLogAddParam） */
export type ChangeLogAddParam = {
  time?: string;
  userId?: string;
  userType?: string;
  userDisplayName?: string;
  orgId?: string;
  orgName?: string;
  platform?: string;
  tenantId?: string;
  businessId?: string;
  businessType?: number;
  message?: string;
  serverName?: string;
  serverAppName?: string;
  data?: DictData;
};

/** 变动日志编辑（ChangeLogEditParam） */
export type ChangeLogEditParam = Omit<ChangeLogAddParam, "data"> & {
  id: number;
  dataJson?: string;
  deleteStatus?: number;
};

export const addChangeLog = (data: ChangeLogAddParam) => {
  return http.request<number>("post", "/basic/change-log/add", { data });
};

export const editChangeLog = (data: ChangeLogEditParam) => {
  return http.request<void>("post", "/basic/change-log/edit", { data });
};

export const deleteChangeLogs = (ids: Array<number>) => {
  return http.request<void>("post", "/basic/change-log/delete", {
    data: { ids }
  });
};

export const getChangeLogDetail = (recordId: number) => {
  return http.request<ChangeLogItem>("get", `/basic/change-log/${recordId}`);
};

export const getChangeLogPage = (data: ChangeLogQuery) => {
  return http.request<PageResult<ChangeLogItem>>(
    "post",
    "/basic/change-log/query-page",
    { data }
  );
};

// ---------------- 运行日志 /basic/run-log ----------------

/** 运行日志行（RunLogSmpResult，与详情 RunLogResult 字段一致，已实测核对） */
export type RunLogItem = {
  id: number;
  serverName: string;
  serverAppName: string;
  time: string;
  /** 模块名 */
  module: string;
  message?: string;
  /** 是否执行成功：0 未成功，1 成功 */
  success: number;
  error?: string;
  dataJson?: string;
  deleteStatus: number;
};

/** 运行日志查询（RunLogQuery 常用项） */
export type RunLogQuery = PageQuery & {
  /** 服务器的名称（模糊） */
  serverNameLike?: string;
  /** 服务器的应用名称（模糊） */
  serverAppNameLike?: string;
  /** 模块名（模糊） */
  moduleLike?: string;
  /** 消息（模糊） */
  messageLike?: string;
  /** 是否执行成功：0 未成功，1 成功 */
  success?: number;
};

/** 运行日志新增（RunLogAddParam） */
export type RunLogAddParam = {
  serverName?: string;
  serverAppName?: string;
  time?: string;
  module?: string;
  message?: string;
  success?: number;
  error?: string;
  data?: DictData;
};

/** 运行日志编辑（RunLogEditParam） */
export type RunLogEditParam = Omit<RunLogAddParam, "data"> & {
  id: number;
  dataJson?: string;
  deleteStatus?: number;
};

export const addRunLog = (data: RunLogAddParam) => {
  return http.request<number>("post", "/basic/run-log/add", { data });
};

export const editRunLog = (data: RunLogEditParam) => {
  return http.request<void>("post", "/basic/run-log/edit", { data });
};

export const deleteRunLogs = (ids: Array<number>) => {
  return http.request<void>("post", "/basic/run-log/delete", { data: { ids } });
};

export const getRunLogDetail = (recordId: number) => {
  return http.request<RunLogItem>("get", `/basic/run-log/${recordId}`);
};

export const getRunLogPage = (data: RunLogQuery) => {
  return http.request<PageResult<RunLogItem>>(
    "post",
    "/basic/run-log/query-page",
    {
      data
    }
  );
};

// ---------------- 异步处理任务 /basic/async-proc-task（仅只读接口） ----------------

/** 异步任务行（AsyncProcTaskSmpResult；详情 AsyncProcTaskResult 无 serialNumber） */
export type AsyncProcTaskItem = {
  /** 序号（仅分页列表返回） */
  serialNumber?: number;
  id: number;
  /** 业务类型：0 缺省 */
  businessType?: number;
  businessId?: number;
  /** 任务类型：0 缺省，1 导出，2 导入 */
  taskType?: number;
  /** 任务参数（JSON对象字符串） */
  taskParameters?: string;
  beginTime?: string;
  endTime?: string;
  /** 原始文件（JSON对象数组） */
  originalFiles?: string;
  originalFilename?: string;
  /** 状态：0 缺省，1 待导入|导出，2 前置处理，3 导入|导出中，4 超时，5 失败，6 成功 */
  status?: number;
  executorName?: string;
  execFailureCount?: number;
  successCount?: number;
  failureCount?: number;
  totalCount?: number;
  /** 结果文件信息 */
  resultFile?: string;
  /** 错误信息（失败信息） */
  errorMessage?: string;
  platform?: string;
  tenantId?: string;
  ownerId?: number;
  ownOrgId?: number;
  createUser?: number;
  createTime?: string;
  modifyUser?: number;
  modifyTime?: string;
  deleteStatus: number;
};

/** 异步任务查询（AsyncProcTaskQuery 常用项） */
export type AsyncProcTaskQuery = PageQuery & {
  /** 任务类型：1 导出，2 导入 */
  taskType?: number;
  /** 状态：0 缺省，1 待导入|导出，2 前置处理，3 导入|导出中，4 超时，5 失败，6 成功 */
  statusList?: Array<number>;
  originalFilenameLike?: string;
  executorNameLike?: string;
};

export const getAsyncProcTaskDetail = (recordId: number) => {
  return http.request<AsyncProcTaskItem>(
    "get",
    `/basic/async-proc-task/${recordId}`
  );
};

export const getAsyncProcTaskPage = (data: AsyncProcTaskQuery) => {
  return http.request<PageResult<AsyncProcTaskItem>>(
    "post",
    "/basic/async-proc-task/query-page",
    { data }
  );
};
