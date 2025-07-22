<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>

      <!-- 身份选择 -->
      <div class="role-select">
        <el-radio-group v-model="role">
          <el-radio-button label="user">用户</el-radio-button>
          <el-radio-button label="admin">管理员</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 表单 -->
      <el-form :model="loginForm" ref="loginFormRef" label-width="80px">
        <el-form-item label="账号" prop="account">
          <el-input v-model="loginForm.account" placeholder="账号/手机号/邮箱" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>

        <el-form-item>
          <el-button class="login-btn" type="primary" @click="onLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 卡片底部链接 -->
      <template #footer>
        <div class="login-links-box">
          <!-- 第一行：注册账号 | 忘记密码？ -->
          <div v-if="role === 'user'" class="line1">
            <router-link to="/user-register" class="link">注册账号</router-link>
          </div>
          <div v-else class="line1">
          </div>

          <!-- 第二行：放弃登录，返回首页 -->
          <div class="line2">
            <router-link to="/" class="link">放弃登录，返回首页</router-link>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { authApi } from '@/api/auth';

const role = ref<'user' | 'admin'>('user');
const loginForm = reactive({
  account: '',
  password: ''
});
const loginFormRef = ref<FormInstance>();
const router = useRouter();

const rules: FormRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

const onLogin = async () => {
  try {
    await loginFormRef.value?.validate();

    // 管理员登录（临时硬编码）
    if (role.value === 'admin') {
      const { account, password } = loginForm;
      if (account === '15621310003' && password === '10003') {
        localStorage.setItem('isAdmin', 'true');
        ElMessage.success('管理员登录成功');
        router.replace('/admin');
        return;
      } else {
        ElMessage.error('管理员账号或密码错误');
        return;
      }
    }

    // 用户登录
    const response = await authApi.login({
      username: loginForm.account,
      password: loginForm.password
    });

    authApi.setAuthToken(response.token);
    localStorage.setItem('username', response.username);
    localStorage.setItem('isAdmin', 'false');

    ElMessage.success('登录成功！');
    router.push('/');
  } catch (error: any) {
    if (error.response?.data) {
      ElMessage.error(error.response.data);
    } else {
      ElMessage.error('登录失败，请检查账号密码');
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('/src/assets/login_bg.png') center center / cover no-repeat;
  position: relative;
  top: 0;
  margin-top: -45px;
}
.login-card {
  width: 400px;
  padding: 40px 30px 30px;
  box-shadow: 0 2px 16px rgba(89, 49, 14, 0.12);
  border-radius: 16px;
  background: #fff8f0;
  border: 1.5px solid #bfa074;
}
.login-title {
  text-align: center;
  margin-bottom: 18px;
  font-size: 24px;
  font-weight: bold;
  color: #59310e;
}
.role-select {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}
.el-radio-button__inner {
  background: #f2e1ae !important;
  color: #59310e !important;
  border: 1.5px solid #bfa074 !important;
  font-weight: bold;
  transition: background 0.2s, color 0.2s;
}
.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: #bfa074 !important;
  color: #fff !important;
  border-color: #bfa074 !important;
}
.el-radio-button__inner:hover {
  background: #e2cfa2 !important;
  color: #59310e !important;
}
.el-form-item__label {
  color: #8c837b;
  font-weight: 500;
}
.el-input__wrapper {
  background: #f7f1ea;
  border: 1px solid #bfa074;
  border-radius: 6px;
}
.login-btn {
  background: #bfa074;
  border: none;
  color: #fff;
  font-weight: bold;
  width: 100%;
  border-radius: 6px;
  transition: background 0.2s;
}
.login-btn:hover {
  background: #59310e;
}
.login-links-box {
  margin-top: 12px;
  text-align: center;
  font-size: 15px;
  line-height: 1.8;
}
.login-links-box .link {
  color: #bfa074;
  text-decoration: underline;
}
.divider {
  color: #bfa074;
  margin: 0 8px;
}
</style>
