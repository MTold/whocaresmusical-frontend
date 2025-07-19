<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>
      <div class="role-select">
        <el-radio-group v-model="role">
          <el-radio-button label="user">用户</el-radio-button>
          <el-radio-button label="admin">管理员</el-radio-button>
        </el-radio-group>
      </div>
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
      <div v-if="role === 'user'" class="login-links">
        <router-link to="/user-register" class="link">注册账号</router-link>
        <span class="divider">|</span>
        <router-link to="/forgot-password" class="link">忘记密码？</router-link>
      </div>
      <div v-else class="login-links">
        <router-link to="/forgot-password" class="link">忘记密码？</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const role = ref<'user' | 'admin'>('user');
const loginForm = ref({
  account: '',
  password: ''
});
const loginFormRef = ref();

const onLogin = () => {
  ElMessage.info(`以${role.value === 'user' ? '用户' : '管理员'}身份登录功能待实现`);
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('/src/assets/login_bg.png') center center/cover no-repeat;
  position: relative;
  top: -70px;
}
.login-card {
  width: 400px;
  padding: 40px 30px 30px 30px;
  box-shadow: 0 2px 16px rgba(89,49,14,0.12);
  border-radius: 16px;
  background: #fff8f0;
  border: 1.5px solid #bfa074;
}
.login-title {
  text-align: center;
  margin-bottom: 18px;
  font-size: 24px;
  font-weight: bold;
  color: #59310E;
}
.role-select {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}
.el-radio-group {
  width: 100%;
  display: flex;
  justify-content: center;
}
.el-radio-button__inner {
  background: #f2e1ae !important;
  color: #59310E !important;
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
  color: #59310E !important;
}
.el-form-item__label {
  color: #8C837B;
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
  background: #59310E;
}
.login-links {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 12px;
  font-size: 15px;
}
.link {
  color: #bfa074;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}
.divider {
  color: #bfa074;
}
</style>
