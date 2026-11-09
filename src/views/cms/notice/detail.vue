<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPortalDetail, type PortalItem } from "@/api/cms";
import ContentRender from "../components/content-render.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Back from "~icons/ep/back";

defineOptions({
  name: "CmsNoticeDetail"
});

const route = useRoute();
const router = useRouter();

const noticeId = Number(route.query.id);
const loading = ref(true);
const detail = ref<PortalItem>();

function fmt(value: unknown, emptyText = "-") {
  return value === null || value === undefined || value === ""
    ? emptyText
    : String(value);
}

function goBack() {
  router.push("/cms/notice");
}

onMounted(async () => {
  loading.value = true;
  try {
    // 打开即调门户详情：浏览数 +1、记已读
    detail.value = await getPortalDetail(noticeId);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-loading="loading" class="main">
    <el-card shadow="never">
      <div class="mb-2 flex items-center justify-between">
        <span class="font-medium">公告详情（#{{ noticeId }}）</span>
        <el-button :icon="useRenderIcon(Back)" @click="goBack">返回</el-button>
      </div>

      <template v-if="detail">
        <div class="notice-detail__title">{{ detail.title }}</div>
        <div class="notice-detail__meta">
          <el-tag size="small" type="info" effect="plain">
            {{ detail.categoryName || "未分类" }}
          </el-tag>
          <span>发布人：{{ fmt(detail.publishUserName) }}</span>
          <span>发布时间：{{ fmt(detail.publishTime) }}</span>
          <span>浏览数：{{ fmt(detail.viewCount) }}</span>
        </div>

        <div v-if="detail.coverImages?.length" class="notice-detail__covers">
          <el-image
            v-for="(img, index) in detail.coverImages"
            :key="index"
            :src="img.addr"
            :preview-src-list="detail.coverImages.map(it => it.addr)"
            :initial-index="index"
            preview-teleported
            fit="cover"
            class="notice-detail__cover"
          />
        </div>

        <ContentRender
          :content-type="detail.contentType"
          :content="detail.content"
        />

        <div
          v-if="detail.attachments?.length"
          class="notice-detail__attachments"
        >
          <span class="font-medium">附件：</span>
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
        </div>
      </template>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.notice-detail {
  &__title {
    margin-bottom: 8px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding-bottom: 12px;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__covers {
    margin-bottom: 12px;
  }

  &__cover {
    width: 120px;
    height: 72px;
    margin-right: 8px;
    cursor: pointer;
    border-radius: 4px;
  }

  &__attachments {
    padding-top: 12px;
    margin-top: 12px;
    font-size: 13px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
