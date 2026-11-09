<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getArticleDetail,
  getArticleReadStat,
  getArticleReadUsers,
  getArticleUnreadUsers,
  type ArticleResult,
  type ReadStat,
  type ReadUserRow
} from "@/api/cms";
import ContentRender from "../components/content-render.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  cmsStatusLabel,
  cmsStatusTagType,
  cmsTypeLabel,
  cmsLogActionLabel,
  cmsContentTypeLabel
} from "../constants";

import Back from "~icons/ep/back";
import EditPen from "~icons/ep/edit-pen";

defineOptions({
  name: "CmsArticleDetail"
});

const route = useRoute();
const router = useRouter();

const articleId = Number(route.query.id);
const loading = ref(true);
const detail = ref<ArticleResult>();
const readStat = ref<ReadStat>();

/** 已读/未读名单（分页，页签内独立翻页） */
const readUsers = reactive({
  list: [] as Array<ReadUserRow>,
  total: 0,
  pageNum: 1,
  pageSize: 10,
  loading: false
});
const unreadUsers = reactive({
  list: [] as Array<ReadUserRow>,
  total: 0,
  pageNum: 1,
  pageSize: 10,
  loading: false
});
const activeTab = ref("read");

const reachRateText = computed(() =>
  readStat.value ? `${readStat.value.reachRate}%` : "-"
);

function fmt(value: unknown, emptyText = "-") {
  return value === null || value === undefined || value === ""
    ? emptyText
    : String(value);
}

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getArticleDetail(articleId);
    readStat.value = await getArticleReadStat(articleId);
  } finally {
    loading.value = false;
  }
}

async function loadReadUsers() {
  readUsers.loading = true;
  try {
    const data = await getArticleReadUsers(articleId, {
      pageNum: readUsers.pageNum,
      pageSize: readUsers.pageSize
    });
    readUsers.list = data?.data ?? [];
    readUsers.total = data?.total ?? 0;
  } finally {
    readUsers.loading = false;
  }
}

async function loadUnreadUsers() {
  unreadUsers.loading = true;
  try {
    const data = await getArticleUnreadUsers(articleId, {
      pageNum: unreadUsers.pageNum,
      pageSize: unreadUsers.pageSize
    });
    unreadUsers.list = data?.data ?? [];
    unreadUsers.total = data?.total ?? 0;
  } finally {
    unreadUsers.loading = false;
  }
}

function goEdit() {
  router.push({
    path: "/cms/article/edit",
    query: { id: String(articleId) }
  });
}

function goBack() {
  router.back();
}

onMounted(() => {
  loadDetail();
  loadReadUsers();
  loadUnreadUsers();
});
</script>

<template>
  <div v-loading="loading" class="main">
    <el-card shadow="never">
      <div class="mb-2 flex items-center justify-between">
        <span class="font-medium">文章详情（#{{ articleId }}）</span>
        <div>
          <el-button :icon="useRenderIcon(Back)" @click="goBack">
            返回
          </el-button>
          <el-button
            type="primary"
            :icon="useRenderIcon(EditPen)"
            @click="goEdit"
          >
            编辑
          </el-button>
        </div>
      </div>

      <el-row :gutter="16">
        <el-col :xs="24" :lg="16">
          <el-descriptions :column="2" border title="基本信息">
            <el-descriptions-item label="标题" :span="2">
              {{ fmt(detail?.title) }}
            </el-descriptions-item>
            <el-descriptions-item label="内容类型">
              <el-tag size="small" type="primary" effect="plain">
                {{ cmsTypeLabel(detail?.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              {{ fmt(detail?.categoryName, "未分类") }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                size="small"
                :type="cmsStatusTagType(detail?.status)"
                effect="plain"
              >
                {{ cmsStatusLabel(detail?.status) }}
              </el-tag>
              <el-tag
                v-if="detail && detail.topWeight > 0"
                size="small"
                type="danger"
                effect="dark"
                class="ml-1"
              >
                置顶：{{ detail.topWeight }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="正文格式">
              {{ cmsContentTypeLabel(detail?.contentType) }}
            </el-descriptions-item>
            <el-descriptions-item label="发布人">
              {{ fmt(detail?.publishUserName) }}
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">
              {{ fmt(detail?.publishTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="到期时间">
              {{ fmt(detail?.expireTime, "长期有效") }}
            </el-descriptions-item>
            <el-descriptions-item label="浏览数">
              {{ fmt(detail?.viewCount) }}
            </el-descriptions-item>
            <el-descriptions-item label="封面图" :span="2">
              <template v-if="detail?.coverImages?.length">
                <el-image
                  v-for="(img, index) in detail.coverImages"
                  :key="index"
                  :src="img.addr"
                  :preview-src-list="detail.coverImages.map(it => it.addr)"
                  :initial-index="index"
                  preview-teleported
                  fit="cover"
                  class="cms-cover-image"
                />
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="附件" :span="2">
              <template v-if="detail?.attachments?.length">
                <el-link
                  v-for="(file, index) in detail.attachments"
                  :key="index"
                  type="primary"
                  :href="file.addr"
                  target="_blank"
                  class="mr-3"
                >
                  {{ file.name }}
                </el-link>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="摘要" :span="2">
              {{ fmt(detail?.summary) }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="mt-3">
            <div class="mb-1 font-medium">正文</div>
            <ContentRender
              :content-type="detail?.contentType"
              :content="detail?.content"
            />
          </div>
        </el-col>

        <el-col :xs="24" :lg="8">
          <el-card shadow="never" class="mb-3">
            <template #header>
              <span class="font-medium">生命周期留痕</span>
            </template>
            <el-timeline v-if="detail?.logs?.length">
              <el-timeline-item
                v-for="log in detail.logs"
                :key="log.id"
                :timestamp="log.actionTime"
                placement="top"
                type="primary"
              >
                <div class="font-medium">
                  {{ cmsLogActionLabel(log.actionType) }}
                </div>
                <div class="text-xs text-gray-500">
                  操作人：{{ log.operatorName || "定时任务" }}
                </div>
                <div v-if="log.detail" class="text-xs text-gray-500">
                  {{ log.detail }}
                </div>
              </el-timeline-item>
            </el-timeline>
            <div v-else class="text-sm text-gray-400">暂无留痕</div>
          </el-card>

          <el-card shadow="never">
            <template #header>
              <span class="font-medium">触达统计</span>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="目标人数">
                {{ fmt(readStat?.targetCount) }}
              </el-descriptions-item>
              <el-descriptions-item label="已读人数">
                {{ fmt(readStat?.readCount) }}
              </el-descriptions-item>
              <el-descriptions-item label="未读人数">
                {{ fmt(readStat?.unreadCount) }}
              </el-descriptions-item>
              <el-descriptions-item label="触达率">
                {{ reachRateText }}
              </el-descriptions-item>
            </el-descriptions>

            <el-tabs v-model="activeTab" class="mt-2">
              <el-tab-pane label="已读名单" name="read">
                <el-table
                  v-loading="readUsers.loading"
                  :data="readUsers.list"
                  size="small"
                >
                  <el-table-column prop="userId" label="用户ID" width="80" />
                  <el-table-column prop="userName" label="用户姓名" />
                  <el-table-column
                    prop="readTime"
                    label="阅读时间"
                    width="150"
                  />
                </el-table>
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="readUsers.total"
                  :page-size="readUsers.pageSize"
                  :current-page="readUsers.pageNum"
                  class="mt-2 justify-center"
                  @current-change="
                    (page: number) => {
                      readUsers.pageNum = page;
                      loadReadUsers();
                    }
                  "
                />
              </el-tab-pane>
              <el-tab-pane label="未读名单" name="unread">
                <el-table
                  v-loading="unreadUsers.loading"
                  :data="unreadUsers.list"
                  size="small"
                >
                  <el-table-column prop="userId" label="用户ID" width="80" />
                  <el-table-column prop="userName" label="用户姓名" />
                  <el-table-column
                    prop="readTime"
                    label="阅读时间"
                    width="150"
                  />
                </el-table>
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="unreadUsers.total"
                  :page-size="unreadUsers.pageSize"
                  :current-page="unreadUsers.pageNum"
                  class="mt-2 justify-center"
                  @current-change="
                    (page: number) => {
                      unreadUsers.pageNum = page;
                      loadUnreadUsers();
                    }
                  "
                />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.cms-cover-image {
  width: 80px;
  height: 48px;
  margin-right: 8px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
