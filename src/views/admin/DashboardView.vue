<template>
  <div class="admin-info">
    <form @submit.prevent="saveInfo" class="info-form">
      <div class="info-item">
        <span class="label">用户名</span>
        <input v-model="form.username" class="input" />
      </div>
      <div class="info-item">
        <span class="label">电话</span>
        <input v-model="form.phone" class="input" />
      </div>
      <div class="info-item">
        <span class="label">邮箱</span>
        <input v-model="form.email" class="input" />
      </div>
      <div class="info-item">
        <span class="label">密码</span>
        <input type="password" v-model="form.password" class="input" />
      </div>
      <div class="btn-row">
        <button type="submit" class="save-btn">保存</button>
        <button type="button" class="logout-btn" @click="logout">退出登录</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const form = ref({
  username: '',
  phone: '',
  email: '',
  password: ''
})

onMounted(() => {
  form.value.username = localStorage.getItem('admin_username') || ''
  form.value.phone = localStorage.getItem('admin_phone') || ''
  form.value.email = localStorage.getItem('admin_email') || ''
  form.value.password = localStorage.getItem('admin_password') || ''
})

function saveInfo() {
  localStorage.setItem('admin_username', form.value.username)
  localStorage.setItem('admin_phone', form.value.phone)
  localStorage.setItem('admin_email', form.value.email)
  localStorage.setItem('admin_password', form.value.password)
  alert('保存成功！')
}

function logout() {
  localStorage.removeItem('isAdmin')
  router.replace('/login')
}
</script>

<style scoped>
.admin-info {
  max-width: 420px;
  margin: 40px auto 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 36px 32px 32px 32px;
}
.info-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 0 12px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
  padding-top: 6px;
}
.label {
  color: #666;
  font-size: 16px;
  width: 90px;
  flex-shrink: 0;
  letter-spacing: 1px;
}
.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  background: #fafbfc;
  transition: border 0.2s;
}
.input:focus {
  border: 1.5px solid #a0522d;
  outline: none;
  background: #fff;
}
.btn-row {
  margin-top: 30px;
  display: flex;
  gap: 18px;
  justify-content: flex-end;
}
.save-btn {
  background: linear-gradient(90deg, #a0522d 60%, #e6c9b0 100%);
  color: #fff;
  border: none;
  padding: 8px 32px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(230,126,34,0.08);
  transition: background 0.2s;
}
.save-btn:hover {
  background: linear-gradient(90deg, #7a3a1d 60%, #a0522d 100%);
}
.logout-btn {
  background: #fff;
  color: #e74c3c;
  border: 1.5px solid #e74c3c;
  padding: 8px 22px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.logout-btn:hover {
  background: #e74c3c;
  color: #fff;
}
</style>
