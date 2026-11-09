<script setup lang="ts">
import { reactive, ref } from "vue";
import { CMS_TYPE_OPTIONS } from "../constants";
import type { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    name: "",
    code: "",
    type: 1,
    icon: "",
    sort: 0,
    enabled: 1,
    description: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const rules = reactive({
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择内容类型", trigger: "change" }]
});

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="rules"
    label-width="82px"
  >
    <el-form-item label="分类名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入分类名称"
      />
    </el-form-item>

    <el-form-item label="分类编码" prop="code">
      <el-input
        v-model="newFormInline.code"
        clearable
        placeholder="请输入分类编码（选填，唯一性校验）"
      />
    </el-form-item>

    <el-form-item label="内容类型" prop="type">
      <el-select
        v-model="newFormInline.type"
        placeholder="请选择内容类型"
        class="w-full!"
      >
        <el-option
          v-for="item in CMS_TYPE_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="图标" prop="icon">
      <el-input
        v-model="newFormInline.icon"
        clearable
        placeholder="请输入图标名称（iconify，选填）"
      />
    </el-form-item>

    <el-form-item label="排序" prop="sort">
      <el-input-number
        v-model="newFormInline.sort"
        :min="0"
        controls-position="right"
      />
      <span class="ml-2 text-xs text-gray-400">升序，越小越前</span>
    </el-form-item>

    <el-form-item label="是否启用" prop="enabled">
      <el-switch
        v-model="newFormInline.enabled"
        :active-value="1"
        :inactive-value="0"
        active-text="启用"
        inactive-text="禁用"
        inline-prompt
      />
    </el-form-item>

    <el-form-item label="描述" prop="description">
      <el-input
        v-model="newFormInline.description"
        type="textarea"
        :rows="2"
        clearable
        placeholder="请输入描述（选填）"
      />
    </el-form-item>
  </el-form>
</template>
