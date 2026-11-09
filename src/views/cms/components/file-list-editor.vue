<script setup lang="ts">
import { ref, watch } from "vue";
import type { CmsFileItem } from "@/api/cms";

defineOptions({
  name: "CmsFileListEditor"
});

/**
 * 封面图/附件手工登记列表（后端无上传能力）：
 * 每行 = 名称 + URL 地址两个输入框，可增删行，提交时组装 Array<{name,addr}>。
 */
const props = withDefaults(
  defineProps<{
    modelValue?: Array<CmsFileItem>;
    /** 添加行按钮文案 */
    addText?: string;
    namePlaceholder?: string;
    addrPlaceholder?: string;
  }>(),
  {
    modelValue: () => [],
    addText: "添加",
    namePlaceholder: "名称",
    addrPlaceholder: "URL 地址"
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: Array<CmsFileItem>];
}>();

function cloneList(source?: Array<CmsFileItem>): Array<CmsFileItem> {
  return (source ?? []).map(it => ({
    name: it.name ?? "",
    addr: it.addr ?? ""
  }));
}

const list = ref<Array<CmsFileItem>>(cloneList(props.modelValue));

// 编辑回显时整体同步（深比较，避免编辑过程中被覆盖）
watch(
  () => props.modelValue,
  val => {
    if (JSON.stringify(cloneList(val)) !== JSON.stringify(list.value)) {
      list.value = cloneList(val);
    }
  },
  { deep: true }
);

function emitChange() {
  emit(
    "update:modelValue",
    list.value.map(it => ({ name: it.name, addr: it.addr }))
  );
}

function addRow() {
  list.value.push({ name: "", addr: "" });
  emitChange();
}

function removeRow(index: number) {
  list.value.splice(index, 1);
  emitChange();
}
</script>

<template>
  <div class="w-full">
    <div v-for="(item, index) in list" :key="index" class="cms-file-row">
      <el-input
        v-model="item.name"
        class="cms-file-row__name"
        :placeholder="namePlaceholder"
        clearable
        @input="emitChange"
      />
      <el-input
        v-model="item.addr"
        class="cms-file-row__addr"
        :placeholder="addrPlaceholder"
        clearable
        @input="emitChange"
      />
      <el-button link type="danger" @click="removeRow(index)">删除</el-button>
    </div>
    <el-button type="primary" plain @click="addRow">{{ addText }}</el-button>
  </div>
</template>

<style lang="scss" scoped>
.cms-file-row {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;

  &__name {
    flex-shrink: 0;
    width: 220px;
  }

  &__addr {
    flex: 1;
  }
}
</style>
