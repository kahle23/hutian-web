<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig
} from "@wangeditor/editor";
import { onBeforeUnmount, ref, shallowRef, watch } from "vue";

defineOptions({
  name: "CmsRichEditor"
});

/**
 * wangeditor 富文本封装（v-model:string，HTML 模式）
 * 创建/销毁与外部值同步均在组件内处理，父组件只关心 v-model。
 */
const props = withDefaults(
  defineProps<{
    /** 正文 HTML */
    modelValue?: string;
    /** 编辑器高度 */
    height?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: "",
    height: "360px",
    placeholder: "请输入正文..."
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const mode = "default";
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ["fullScreen"]
};
const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  readOnly: false
};

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor>();
const innerHtml = ref(props.modelValue);

// 外部值变化（编辑回显）同步进编辑器；deep 覆盖非字符串注入场景
watch(
  () => props.modelValue,
  val => {
    if ((val ?? "") !== innerHtml.value) innerHtml.value = val ?? "";
  },
  { deep: true }
);

// 编辑器内部输入同步回父组件
watch(innerHtml, val => {
  emit("update:modelValue", val ?? "");
});

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor;
}

// 组件销毁时及时销毁编辑器，防止内存泄漏
onBeforeUnmount(() => {
  editorRef.value?.destroy();
});
</script>

<template>
  <div class="cms-rich-editor">
    <Toolbar
      class="cms-rich-editor__toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="innerHtml"
      class="cms-rich-editor__body"
      :style="{ height: props.height }"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<style lang="scss" scoped>
.cms-rich-editor {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  // wangeditor 内部滚动区占满容器
  :deep(.w-e-text-container) {
    background-color: var(--el-bg-color);
  }

  &__toolbar {
    border-bottom: 1px solid var(--el-border-color);
  }

  &__body {
    overflow-y: hidden;
  }
}
</style>
