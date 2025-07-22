<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="register-title">注册账号</h2>
      <el-form :model="registerForm" ref="registerFormRef" label-width="100px" :rules="rules">
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="registerForm.username" placeholder="请输入用户名" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password maxlength="50" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" required>
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password maxlength="50" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="registerForm.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="registerForm.birthday" type="date" placeholder="请选择生日" style="width: 100%" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onRegister" :loading="loading" style="width: 100%">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="register-links">
        <router-link to="/login" class="link">已有账号？去登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { authApi } from '@/api/auth';
import type { RegisterRequest } from '@/types/auth';

const router = useRouter();
const registerFormRef = ref<FormInstance>();
const loading = ref(false);

const registerForm = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  userImage: 'default.jpg'
});

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度应在6-50个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};

const onRegister = async () => {
  try {
    await registerFormRef.value?.validate();
    loading.value = true;

    const registerData: RegisterRequest = {
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email || undefined,
      phone: registerForm.phone || undefined,
      gender: registerForm.gender || undefined,
      birthday: registerForm.birthday ? registerForm.birthday.toString().split('T')[0] : undefined,
      userImage: registerForm.userImage
    };

    const response = await authApi.register(registerData);
    authApi.setAuthToken(response.token);
    localStorage.setItem('username', response.username);
    localStorage.setItem('isAdmin', 'false');

    ElMessage.success('注册成功！');
    router.push('/');
  } catch (error: any) {
    if (error.response?.data) {
      ElMessage.error(error.response.data);
    } else if (error.message) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('注册失败，请重试');
    }
  } finally {
    loading.value = false;
  }
};
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
  width: 450px;
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