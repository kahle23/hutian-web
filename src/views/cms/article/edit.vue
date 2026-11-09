<script setup lang="ts">
import dayjs from "dayjs";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "@/utils/message";
import {
  addArticle,
  editArticle,
  publishArticles,
  getArticleDetail,
  getCategoryList,
  type ArticleSaveParam,
  type CategorySmpItem
} from "@/api/cms";
import RichEditor from "../components/rich-editor.vue";
import FileListEditor from "../components/file-list-editor.vue";
import {
  CMS_TYPE_OPTIONS,
  CMS_CONTENT_TYPE_OPTIONS,
  cmsStatusLabel,
  cmsStatusTagType
} from "../constants";
import type { ArticleEditForm } from "./utils/types";

defineOptions({
  name: "CmsArticleEdit"
});

const route = useRoute();
const router = useRouter();

const formRef = ref();
const loading = ref(false);
const submitting = ref(false);
const categoryOptions = ref<Array<CategorySmpItem>>([]);
/** 编辑态记录的当前状态（已发布时不再展示发布按钮，避免后端拦截报错） */
const loadedStatus = ref<number | undefined>();
/** 编辑态加载时的封面/附件原值（判断"由有清空"需显式提交 clearFields 用） */
const loadedCovers = ref<Array<{ name: string; addr: string }>>([]);
const loadedAttachments = ref<Array<{ name: string; addr: string }>>([]);

// 编辑态 id（query.id）
const articleId = route.query.id ? Number(route.query.id) : undefined;
const isEdit = computed(
  () => articleId !== undefined && !Number.isNaN(articleId)
);
const showPublish = computed(() => !isEdit.value || loadedStatus.value !== 1);

const form = reactive<ArticleEditForm>({
  title: "",
  type: 1,
  categoryId: undefined,
  top: false,
  topWeight: 1,
  publishTime: undefined,
  expireTime: undefined,
  contentType: 3,
  content: "",
  coverImages: [],
  attachments: [],
  summary: ""
});

const rules = reactive({
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择内容类型", trigger: "change" }]
});

/** 类型切换联动重拉分类（清空不匹配分类） */
function handleTypeChange() {
  form.categoryId = undefined;
  loadCategories(form.type);
}

async function loadCategories(type: number) {
  const data = await getCategoryList({ typeList: [type] });
  categoryOptions.value = data ?? [];
}

/** 编辑态加载详情回显 */
async function loadDetail() {
  if (!isEdit.value) return;
  loading.value = true;
  try {
    const detail = await getArticleDetail(articleId);
    loadedStatus.value = detail.status;
    form.title = detail.title;
    form.type = detail.type;
    await loadCategories(detail.type);
    form.categoryId = detail.categoryId ?? undefined;
    form.top = detail.topWeight > 0;
    form.topWeight = detail.topWeight > 0 ? detail.topWeight : 1;
    // 0 缺省按纯文本口径编辑（展示一致）
    form.contentType = detail.contentType === 0 ? 1 : detail.contentType;
    form.content = detail.content ?? "";
    form.coverImages = (detail.coverImages ?? []).map(it => ({ ...it }));
    form.attachments = (detail.attachments ?? []).map(it => ({ ...it }));
    loadedCovers.value = form.coverImages.map(it => ({ ...it }));
    loadedAttachments.value = form.attachments.map(it => ({ ...it }));
    // 摘要只读展示（提交传空，由后端按正文自动提取）
    form.summary = detail.summary ?? "";
  } finally {
    loading.value = false;
  }
}

/**
 * 保存：targetStatus 0=存草稿/保存，1=发布
 * 新增+定时（发布时间填未来时间）→ add(草稿) 后 publish 登记，到点自动发布；
 * 编辑+发布 → edit 后 publish{ids:[id]}。
 */
async function handleSubmit(targetStatus: 0 | 1) {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const param: ArticleSaveParam = {
      type: form.type,
      categoryId: form.categoryId ?? null,
      title: form.title,
      topWeight: form.top ? form.topWeight : 0,
      contentType: form.contentType,
      content: form.content,
      coverImages: form.coverImages,
      attachments: form.attachments,
      // 摘要一律传空：后端按正文提纯截前 200 字
      summary: "",
      expireTime: form.expireTime || undefined
    };
    if (!isEdit.value) {
      const scheduled =
        targetStatus === 1 &&
        !!form.publishTime &&
        dayjs(form.publishTime).isAfter(dayjs());
      if (scheduled) {
        // 定时发布：先存草稿，再登记未来发布时间（保持草稿）
        const newId = await addArticle({ ...param, status: 0 });
        await publishArticles({
          ids: [newId],
          publishTime: form.publishTime,
          expireTime: form.expireTime || undefined
        });
        message("已登记定时发布（草稿保持，到点自动发布）", {
          type: "success"
        });
      } else {
        await addArticle({ ...param, status: targetStatus });
        message(targetStatus === 1 ? "已发布" : "已存草稿", {
          type: "success"
        });
      }
    } else {
      // 封面/附件"由有清空"：后端 updateById 跳过 null 字段，空数组不会覆盖原值，
      // 须显式提交 clearFields 才能真正清空（与分类编辑清空编码同语义）
      const clearFields: Array<string> = [];
      if (loadedCovers.value.length && !form.coverImages.length) {
        clearFields.push("coverImages");
      }
      if (loadedAttachments.value.length && !form.attachments.length) {
        clearFields.push("attachments");
      }
      await editArticle({
        id: articleId,
        ...param,
        status: 0,
        ...(clearFields.length ? { clearFields } : {})
      });
      if (targetStatus === 1) {
        await publishArticles({
          ids: [articleId],
          expireTime: form.expireTime || undefined
        });
        message("已保存并发布", { type: "success" });
      } else {
        message("已保存", { type: "success" });
      }
    }
    router.back();
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  router.back();
}

onMounted(() => {
  // 编辑态：详情内按文章类型加载分类；新增态：按默认类型加载分类
  if (isEdit.value) {
    loadDetail();
  } else {
    loadCategories(form.type);
  }
});
</script>

<template>
  <div v-loading="loading" class="main">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">{{
            isEdit ? "编辑文章" : "新增内容"
          }}</span>
          <el-tag
            v-if="isEdit"
            size="small"
            :type="cmsStatusTagType(loadedStatus)"
            effect="plain"
          >
            当前状态：{{ cmsStatusLabel(loadedStatus) }}
          </el-tag>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="92px"
        class="cms-edit-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" clearable placeholder="请输入标题" />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="内容类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择内容类型"
                class="w-full!"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="item in CMS_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="分类">
              <el-select
                v-model="form.categoryId"
                placeholder="未分类（可空）"
                clearable
                class="w-full!"
              >
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="置顶">
              <div class="flex w-full items-center">
                <el-checkbox v-model="form.top">置顶显示</el-checkbox>
                <el-input-number
                  v-if="form.top"
                  v-model="form.topWeight"
                  :min="1"
                  :max="999"
                  controls-position="right"
                  class="ml-2"
                />
                <span v-if="form.top" class="ml-2 text-xs text-gray-400">
                  权重越大越靠前
                </span>
              </div>
            </el-form-item>
          </el-col>
          <el-col v-if="!isEdit" :xs="24" :sm="12" :lg="8">
            <el-form-item label="发布时间">
              <el-date-picker
                v-model="form.publishTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="留空=发布时立即"
                class="w-full!"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="下线时间">
              <el-date-picker
                v-model="form.expireTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="留空=长期有效"
                class="w-full!"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="正文格式">
          <el-radio-group v-model="form.contentType" :disabled="isEdit">
            <el-radio
              v-for="item in CMS_CONTENT_TYPE_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
          <span v-if="isEdit" class="ml-2 text-xs text-gray-400">
            编辑已有文章时正文格式不可切换
          </span>
        </el-form-item>

        <el-form-item label="正文">
          <div class="w-full">
            <RichEditor
              v-if="form.contentType === 3"
              v-model="form.content"
              height="420px"
              placeholder="请输入正文（富文本）..."
            />
            <el-input
              v-else
              v-model="form.content"
              type="textarea"
              :rows="16"
              :placeholder="
                form.contentType === 2
                  ? '请输入正文（Markdown 语法，门户如实展示）...'
                  : '请输入正文（纯文本）...'
              "
            />
          </div>
        </el-form-item>

        <el-form-item label="封面图">
          <FileListEditor
            v-model="form.coverImages"
            add-text="添加封面图"
            name-placeholder="图片名称"
            addr-placeholder="图片 URL 地址"
          />
        </el-form-item>

        <el-form-item label="附件">
          <FileListEditor
            v-model="form.attachments"
            add-text="添加附件"
            name-placeholder="附件名称"
            addr-placeholder="附件 URL 地址"
          />
        </el-form-item>

        <el-form-item label="摘要">
          <div class="w-full">
            <el-input
              :model-value="form.summary"
              type="textarea"
              :rows="2"
              readonly
              placeholder="留空则按正文自动提取前 200 字"
            />
            <div class="mt-1 text-xs text-gray-400">
              摘要不可手动编辑：提交时传空，由后端按正文提纯截取前 200 字
            </div>
          </div>
        </el-form-item>

        <div class="flex justify-end gap-2 pt-2">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit(0)"
          >
            {{ isEdit ? "保存" : "存草稿" }}
          </el-button>
          <el-button
            v-if="showPublish"
            type="success"
            :loading="submitting"
            @click="handleSubmit(1)"
          >
            发布
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.cms-edit-form {
  padding-top: 8px;
}
</style>
