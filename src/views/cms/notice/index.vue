<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  getPortalPage,
  getPortalCategoryList,
  getPortalUnreadCount,
  type CategoryPortalList,
  type PortalItem
} from "@/api/cms";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "~icons/ep/search";

defineOptions({
  name: "CmsNotice"
});

const router = useRouter();

const loading = ref(true);
const dataList = ref<Array<PortalItem>>([]);
/** 门户分类计数（含全部/未分类） */
const categoryPortal = ref<CategoryPortalList>();
/** 当前用户公告未读数 */
const unreadCount = ref(0);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(9);

const form = reactive({
  /** 分类 id：undefined=全部，0=未分类哨兵 */
  categoryId: undefined as number | undefined,
  keyword: "",
  fullText: false
});

/** chip 数据：全部 / 未分类 / 各启用分类 */
const categoryChips = computed(() => {
  const chips: Array<{ id: number | undefined; label: string; count: number }> =
    [
      {
        id: undefined,
        label: "全部",
        count: categoryPortal.value?.totalCount ?? 0
      },
      {
        id: 0,
        label: "未分类",
        count: categoryPortal.value?.uncategorizedCount ?? 0
      }
    ];
  for (const cat of categoryPortal.value?.categoryList ?? []) {
    chips.push({ id: cat.id, label: cat.name, count: cat.articleCount });
  }
  return chips;
});

function handleCategoryChange(id: number | undefined) {
  form.categoryId = id;
  pageNum.value = 1;
  onSearch();
}

function handleSearch() {
  pageNum.value = 1;
  onSearch();
}

function handleCurrentChange(page: number) {
  pageNum.value = page;
  onSearch();
}

function goDetail(id: number) {
  router.push({ path: "/cms/notice/detail", query: { id: String(id) } });
}

async function onSearch() {
  loading.value = true;
  try {
    const data = await getPortalPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: form.categoryId,
      typeList: [12],
      keyword: form.keyword || undefined,
      fullText: form.fullText || undefined
    });
    dataList.value = data?.data ?? [];
    total.value = data?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getPortalCategoryList(12).then(data => {
    categoryPortal.value = data;
  });
  getPortalUnreadCount().then(count => {
    unreadCount.value = count ?? 0;
  });
  onSearch();
});
</script>

<template>
  <div class="main">
    <el-card shadow="never" class="mb-3">
      <div class="mb-2 flex items-center justify-between">
        <span class="font-medium">公告中心</span>
        <el-tag v-if="unreadCount > 0" type="danger" effect="plain">
          未读公告 {{ unreadCount }}
        </el-tag>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <el-check-tag
          v-for="chip in categoryChips"
          :key="String(chip.id)"
          :checked="form.categoryId === chip.id"
          @change="handleCategoryChange(chip.id)"
        >
          {{ chip.label }}（{{ chip.count }}）
        </el-check-tag>
        <div class="ml-auto flex items-center">
          <el-checkbox v-model="form.fullText" @change="handleSearch">
            全文
          </el-checkbox>
          <el-input
            v-model="form.keyword"
            placeholder="搜索标题/摘要（全文模式含正文）"
            clearable
            class="w-60!"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="useRenderIcon(Search)" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <div v-loading="loading">
      <el-row v-if="dataList.length" :gutter="12">
        <el-col
          v-for="item in dataList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card
            shadow="hover"
            class="notice-card"
            :class="{ 'notice-card--top': item.topWeight > 0 }"
            @click="goDetail(item.id)"
          >
            <div class="notice-card__tags">
              <el-tag size="small" type="info" effect="plain">
                {{ item.categoryName || "未分类" }}
              </el-tag>
              <el-tag
                v-if="item.isRead === 0"
                size="small"
                type="danger"
                effect="dark"
              >
                未读
              </el-tag>
              <el-tag
                v-if="item.topWeight > 0"
                size="small"
                type="warning"
                effect="plain"
              >
                置顶
              </el-tag>
            </div>
            <div class="notice-card__title">{{ item.title }}</div>
            <div class="notice-card__summary">
              {{ item.summary || "（无摘要）" }}
            </div>
            <div v-if="item.snippet" class="notice-card__snippet">
              ……{{ item.snippet }}……
            </div>
            <div class="notice-card__meta">
              <span>{{ item.publishUserName || "-" }}</span>
              <span>{{ item.publishTime || "-" }}</span>
              <span>浏览 {{ item.viewCount }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-else-if="!loading" description="暂无公告" />
      <div class="mt-3 flex justify-center">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="pageNum"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notice-card {
  margin-bottom: 12px;
  cursor: pointer;

  // 置顶暖色条
  &--top {
    border-left: 3px solid var(--el-color-warning);
  }

  &__tags {
    display: flex;
    gap: 4px;
    margin-bottom: 6px;
  }

  &__title {
    margin-bottom: 4px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__summary {
    display: -webkit-box;
    min-height: 44px;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    -webkit-box-orient: vertical;
  }

  &__snippet {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--el-color-primary);
  }

  &__meta {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
