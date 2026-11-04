<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { message } from "@/utils/message";
import { updateUserPwd } from "@/api/system";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({ name: "UserPwdDialog" });

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: "请输入旧密码", trigger: "blur" },
    { min: 6, max: 18, message: "密码长度应为6-18位", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 18, message: "密码长度应为6-18位", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value && value === form.oldPassword) {
          callback(new Error("新密码不能与旧密码相同"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

/** 供导航栏用户下拉调用 */
function show() {
  form.oldPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
  visible.value = true;
}

/** 提交：成功后提示并登出回登录页（业务失败由 http 层统一提示） */
function handleSubmit() {
  formRef.value?.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      await updateUserPwd({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      visible.value = false;
      message("密码修改成功，请使用新密码重新登录", { type: "success" });
      await useUserStoreHook().logOut();
    } catch {
      // 失败提示已由 http 层处理，弹窗保留供修正重试
    } finally {
      loading.value = false;
    }
  });
}

defineExpose({ show });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="420px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    draggable
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      @keyup.enter="handleSubmit"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          clearable
          placeholder="请输入当前登录密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          clearable
          placeholder="请输入新密码（6-18位）"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          clearable
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>
