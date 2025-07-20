<template>
  <header class="user-header">
    <div class="header-content">
      <div class="logo-group">
        <router-link to="/" class="logo-link">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </router-link>
        <router-link to="/" class="logoslogan-link">
          <img src="@/assets/logo_slogan.png" alt="Logoslogan" class="slogan" />
        </router-link>
      </div>
      <nav class="nav-tabs">
        <router-link to="/" class="nav-tab" active-class="active">首页资讯</router-link>
        <router-link to="/schedule" class="nav-tab" active-class="active">所有排期</router-link>
        <router-link to="/theaters" class="nav-tab" active-class="active">剧院列表</router-link>
        <router-link to="/shows" class="nav-tab" active-class="active">演出列表</router-link>
        <router-link to="/profile" class="nav-tab" active-class="active">个人中心</router-link>
        <el-button class="user-icon-btn" type="text" @click="$router.push('/login')">
          <svg class="user-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="#59310E" stroke-width="2"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#59310E" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.user-header {
  position: sticky;
  top: 0;
  width: 100%;
  background: #F0F0F2;
  box-shadow: 0 2px 8px rgba(89, 49, 14, 0.08);
  z-index: 1000;
}
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}
.user-header.fixed {
  position: fixed;
  top: 0;
  width: 100%;
}
.logo-group {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 防止logo区域被压缩 */
}
.logo-link {
  display: flex;
  align-items: center;
  height: 100%;
}
.logo {
  height: 80px;
  width: auto;
}
.slogan {
  height: 80px;
  width: auto;
}
.nav-tabs {
  display: flex;
  gap: 32px;
}
.nav-tab {
  color: #8C837B;
  font-size: 18px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.nav-tab:hover {
  background: #F2E1AE;
  color: #59310E;
}
.active {
  background: #D2D3D9;
  color: #59310E;
}
.user-icon-btn {
  margin-left: 16px;
  padding: 0;
  min-width: 0;
  background: none;
  border: none;
  box-shadow: none;
  vertical-align: middle;
  position: relative;
  top: 5px;
}
.user-icon {
  display: inline-block;
  vertical-align: middle;
}
@media (max-width: 768px) {
  .header-content {
    padding: 0 8px;
    height: 52px;
  }
  .logo {
    height: 28px;
  }
  .nav-tabs {
    gap: 12px;
  }
  .nav-tab {
    font-size: 15px;
    padding: 6px 8px;
  }
}
</style>
