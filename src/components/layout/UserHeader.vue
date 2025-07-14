<template>
  <header class="user-header">
    <div class="header-content">
      <router-link to="/" class="logo-link">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
      </router-link>
      <nav class="nav-tabs">
        <router-link to="/home" class="nav-tab" active-class="active">首页资讯</router-link>
        <router-link to="/theaters" class="nav-tab" active-class="active">剧院列表</router-link>
        <router-link to="/shows" class="nav-tab" active-class="active">演出列表</router-link>
        <router-link to="/profile" class="nav-tab" active-class="active">个人中心</router-link>

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
.logo-link {
  display: flex;
  align-items: center;
  height: 100%;
}
.logo {
  height: 40px;
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
