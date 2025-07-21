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
  max-width: 500px; /* 增加最大宽度 */
  margin: 60px auto 0 auto; /* 增加顶部边距 */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1); /* 增加阴影深度 */
  padding: 48px 40px; /* 增加内边距 */
  position: absolute;   /* 或 fixed，视需求而定 */
  top: 15px;
  left: 25%;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: 24px; /* 增加控件之间的间距 */
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0 16px; /* 增加标签和输入框之间的间距 */
  border-bottom: 1px solid #e0e0e0; /* 调整边框颜色 */
  padding-bottom: 14px;
  padding-top: 10px;
}

.label {
  color: #333; /* 增加标签颜色的对比度 */
  font-size: 18px; /* 增加字体大小 */
  width: 100px; /* 增加标签宽度 */
  flex-shrink: 0;
  letter-spacing: 1px;
}

.input {
  flex: 1;
  padding: 10px 16px; /* 增加输入框内边距 */
  border: 1px solid #ccc; /* 调整边框颜色 */
  border-radius: 8px; /* 增加圆角 */
  font-size: 18px; /* 增加字体大小 */
  background: #f9f9f9; /* 调整背景色 */
  transition: border 0.2s, box-shadow 0.2s;
}

.input:focus {
  border: 2px solid #a0522d;
  outline: none;
  background: #fff;
  box-shadow: 0 0 8px rgba(160, 82, 45, 0.2); /* 增加聚焦时的阴影 */
}

.btn-row {
  margin-top: 36px; /* 增加按钮与表单之间的间距 */
  display: flex;
  gap: 24px; /* 增加按钮之间的间距 */
  justify-content: flex-end;
}

.save-btn {
  background: linear-gradient(90deg, #a0522d 60%, #e6c9b0 100%);
  color: #fff;
  border: none;
  padding: 10px 40px; /* 增加按钮内边距 */
  border-radius: 8px; /* 增加圆角 */
  font-size: 18px; /* 增加字体大小 */
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(230,126,34,0.2); /* 增加阴影深度 */
  transition: background 0.2s, box-shadow 0.2s;
}

.save-btn:hover {
  background: linear-gradient(90deg, #7a3a1d 60%, #a0522d 100%);
}

.logout-btn {
  background: #fff;
  color: #e74c3c;
  border: 2px solid #e74c3c; /* 增加边框宽度 */
  padding: 10px 26px; /* 增加按钮内边距 */
  border-radius: 8px; /* 增加圆角 */
  font-size: 18px; /* 增加字体大小 */
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.logout-btn:hover {
  background: #e74c3c;
  color: #fff;
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.2); /* 增加阴影深度 */
}
</style>
