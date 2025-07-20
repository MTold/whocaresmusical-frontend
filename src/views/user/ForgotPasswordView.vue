<template>
  <div class="forgot-container">
    <el-card class="forgot-card">
      <h2 class="forgot-title">找回密码</h2>
      <el-form :model="forgotForm" ref="forgotFormRef" label-width="80px">
        <el-form-item label="账号/邮箱" prop="username">
          <el-input v-model="forgotForm.username" placeholder="请输入账号/邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button class="forgot-btn" type="primary" @click="onSend">发送重置邮件</el-button>
        </el-form-item>
      </el-form>
      <div class="forgot-links">
        <router-link to="/login" class="link">返回登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const forgotForm = ref({
  username: ''
});
const forgotFormRef = ref();

const onSend = () => {
  ElMessage.info('重置邮件功能待实现');
};
</script>

<style scoped>
.forgot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('@/assets/login_bg.png') center center/cover no-repeat;
  position: relative;
  top: 0;
}
.forgot-card {
  width: 400px;
  padding: 40px 30px 30px 30px;
  box-shadow: 0 2px 16px rgba(89,49,14,0.12);
  border-radius: 16px;
  background: #fff8f0;
  border: 1.5px solid #bfa074;
}
.forgot-title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: bold;
  color: #59310E;
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
.forgot-btn {
  background: #bfa074;
  border: none;
  color: #fff;
  font-weight: bold;
  width: 100%;
  border-radius: 6px;
  transition: background 0.2s;
}
.forgot-btn:hover {
  background: #59310E;
}
.forgot-links {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  font-size: 15px;
}
.link {
  color: #bfa074;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}
</style>
