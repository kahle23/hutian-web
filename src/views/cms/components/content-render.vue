<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "CmsContentRender"
});

/**
 * CMS 正文统一渲染（管理端详情/门户详情共用）：
 * contentType=3 → v-html（wangeditor 产物）；2 Markdown/1 纯文本/0 缺省 → pre-wrap 纯文本
 * 如实展示（Markdown 不做语法渲染）。
 */
const props = withDefaults(
  defineProps<{
    /** 正文格式：0 缺省/1 纯文本/2 Markdown/3 Html */
    contentType?: number;
    content?: string;
  }>(),
  {
    contentType: 1,
    content: ""
  }
);

const isHtml = computed(() => props.contentType === 3);
</script>

<template>
  <div v-if="isHtml" class="cms-content-html" v-html="props.content" />
  <pre v-else class="cms-content-plain">{{ props.content }}</pre>
</template>

<style lang="scss" scoped>
.cms-content-html {
  line-height: 1.8;
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
  }

  :deep(p) {
    margin: 0 0 8px;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 14px 0 8px;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 24px;
    margin: 8px 0;
  }

  :deep(blockquote) {
    padding: 4px 12px;
    margin: 8px 0;
    color: var(--el-text-color-secondary);
    border-left: 3px solid var(--el-border-color);
  }

  :deep(table) {
    border-collapse: collapse;

    th,
    td {
      padding: 4px 8px;
      border: 1px solid var(--el-border-color);
    }
  }
}

.cms-content-plain {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.8;
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
