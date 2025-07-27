<template>
  <div class="my-info">
    <form @submit.prevent="saveInfo" class="info-form">
      <div class="info-item">
        <span class="label">用户名</span>
        <input v-model="form.username" class="input" disabled />
      </div>
      <div class="info-item">
        <span class="label">性别</span>
        <select v-model="form.gender" class="input">
          <option value="">请选择</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div class="info-item">
        <span class="label">出生年月</span>
        <input type="date" v-model="form.birthday" class="input" />
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
        <input type="password" v-model="form.password" class="input" placeholder="不修改请留空" />
      </div>
      <div class="btn-row">
        <button type="submit" class="save-btn">保存</button>
        <button type="button" class="logout-btn" @click="logout">账户注销</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/user'
import { authApi } from '@/api/auth'
import type { User } from '@/types/user'

const router = useRouter()

const form = ref({
  userId: 0,
  username: '',
  gender: '',
  birthday: '',
  phone: '',
  email: '',
  password: '',
  userImage: ''
})

// 检查用户是否已登录
onMounted(async () => {
  if (!authApi.isLoggedIn()) {
    router.replace('/login')
    return
  }
  
  // 从后端获取用户信息
  try {
    const userData = await userApi.getCurrentUser()
    form.value.userId = userData.userId
    form.value.username = userData.username
    form.value.gender = userData.gender || ''
    form.value.birthday = userData.birthday || ''
    form.value.phone = userData.phone || ''
    form.value.email = userData.email || ''
    form.value.userImage = userData.userImage || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
    alert('获取用户信息失败')
  }
})

async function saveInfo() {
  try {
    // 准备要更新的数据
    const updateData: Partial<User> = {
      gender: form.value.gender || null,
      birthday: form.value.birthday || null,
      phone: form.value.phone || null,
      email: form.value.email || null
    }
    
    // 如果密码不为空，则更新密码
    if (form.value.password) {
      updateData.password = form.value.password
    }
    
    // 调用API更新用户信息
    const updatedUser = await userApi.updateCurrentUser(updateData)
    
    // 更新成功后更新表单数据
    form.value.gender = updatedUser.gender || ''
    form.value.birthday = updatedUser.birthday || ''
    form.value.phone = updatedUser.phone || ''
    form.value.email = updatedUser.email || ''
    
    // 清空密码字段
    form.value.password = ''
    
    alert('保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  }
}

function logout() {
  authApi.logout()
  router.replace('/login')
}
</script>

<style scoped>
.my-info {
  max-width: 420px;
  margin: 3px auto 0 auto;
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
  border: 1.5px solid #e67e22;
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
