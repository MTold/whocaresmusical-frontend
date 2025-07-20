<script setup lang="ts">
</script>

<template>
  <div class="page-container">
    <el-container style="height: 100vh;">

      <el-main>
        <router-view /> <!-- 只需要这个，路由由 main.ts 挂载 -->
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.common-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-bottom: 60px;
}

.el-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.el-header {
  width: 100%;
  padding: 0;
}

.main-content {
  flex: 1;
}
</style>
