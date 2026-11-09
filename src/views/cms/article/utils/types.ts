import type { ArticleSmpItem, CmsFileItem } from "@/api/cms";

/** 文章管理搜索表单 */
export interface ArticleSearchForm {
  /** 标题（模糊） */
  title: string;
  /** 分类 id（空=全部） */
  categoryId?: number;
  /** 状态：0 草稿/1 已发布/2 已下线（空=全部） */
  status?: number;
  /** 发布时间范围 [begin, end]，yyyy-MM-dd HH:mm:ss */
  publishTimeRange?: Array<string>;
}

/** 列表勾选集合 */
export type ArticleSelection = Array<ArticleSmpItem>;

/** 文章编辑页表单 */
export interface ArticleEditForm {
  /** 标题（必填） */
  title: string;
  /** 内容类型（必填；切换联动重拉分类） */
  type: number;
  /** 分类 id（undefined=未分类） */
  categoryId?: number;
  /** 是否置顶 */
  top: boolean;
  /** 置顶权重（top 为 true 时生效） */
  topWeight: number;
  /** 发布时间（仅新增态；填未来时间=定时发布） */
  publishTime?: string;
  /** 下线时间（空=长期有效） */
  expireTime?: string;
  /** 正文格式：1 纯文本/2 Markdown/3 Html（编辑已有文章时锁定） */
  contentType: number;
  /** 正文 */
  content: string;
  /** 封面图（手工登记） */
  coverImages: Array<CmsFileItem>;
  /** 附件（手工登记） */
  attachments: Array<CmsFileItem>;
  /** 摘要（只读展示；提交传空由后端自动提取） */
  summary?: string;
}
