<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="login-title">壶天</div>
      <div class="login-sub">壶里乾坤大，炉中日月长</div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="login-tip">骨架账号：admin / 123456</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { loginApi } from '@/api/auth'
import { setToken } from '@/utils/cache'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await loginApi({ username: form.username, password: form.password })
    setToken(res.data.token)
    userStore.setUser({ username: res.data.username, nickname: res.data.nickname })
    ElMessage.success('欢迎来到壶天')
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #1f2d3d 0%, #2b4d6f 50%, #3a7ca5 100%);
}

.login-card {
  width: 380px;
  padding: 12px 8px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #303133;
}

.login-sub {
  margin: 8px 0 24px;
  font-size: 13px;
  text-align: center;
  color: #909399;
}

.login-btn {
  width: 100%;
}

.login-tip {
  font-size: 12px;
  text-align: center;
  color: #c0c4cc;
}
</style>
