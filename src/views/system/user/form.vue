<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    account: "",
    password: "",
    name: "",
    enabled: 1
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

/** 编辑态：账号不可改、不展示密码框（改密走重置密码） */
const isEdit = defineModel<boolean>("edit", { default: false });

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="登录账号" prop="account">
      <el-input
        v-model="newFormInline.account"
        clearable
        :disabled="isEdit"
        placeholder="请输入登录账号"
      />
    </el-form-item>

    <el-form-item v-if="!isEdit" label="登录密码" prop="password">
      <el-input
        v-model="newFormInline.password"
        clearable
        show-password
        placeholder="请输入登录密码"
      />
    </el-form-item>

    <el-form-item label="用户姓名" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入用户姓名"
      />
    </el-form-item>

    <el-form-item label="是否启用">
      <el-switch
        v-model="newFormInline.enabled"
        :active-value="1"
        :inactive-value="0"
        active-text="启用"
        inactive-text="停用"
        inline-prompt
      />
    </el-form-item>
  </el-form>
</template>
