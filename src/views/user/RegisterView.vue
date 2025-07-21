<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="register-title">注册账号</h2>
      <el-form :model="registerForm" ref="registerFormRef" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onRegister">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="register-links">
        <router-link to="/login" class="link">已有账号？去登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();

const registerForm = ref({
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const registerFormRef = ref();

const onRegister = () => {
  if (!registerForm.value.phone && !registerForm.value.email) {
    ElMessage.warning('请填写手机号或邮箱');
    return;
  }
  if (!registerForm.value.password) {
    ElMessage.warning('请输入密码');
    return;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致');
    return;
  }
  ElMessage.info('注册功能待实现');
};

onMounted(() => {
  const role = localStorage.getItem('loginRole');
  if (role === 'admin') {
    ElMessage.warning('仅用户可注册');
    router.replace('/login');
  }
});
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 64px);
  background: url('@/assets/login_bg.png') center calc(40px + 50%) / cover no-repeat;
}
.register-card {
  width: 400px;
  padding: 40px 30px 30px 30px;
  box-shadow: 0 2px 16px rgba(89,49,14,0.12);
  border-radius: 16px;
  background: #fff8f0;
  border: 1.5px solid #bfa074;
}
.register-title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: bold;
  color: #59310E;
}
.register-links {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  font-size: 15px;
}
.link {
  color: #bfa074;
  text-decoration: underline;
  cursor: pointer;
}
</style>
