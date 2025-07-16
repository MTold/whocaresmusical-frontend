<template>
  <footer class="footer-bar">
    <div class="footer-left">
      <img class="footer-logo" src="@/assets/logo金.png" alt="Logo" />
      <img class="footer-slogan" src="@/assets/slogan金.png" alt="Slogan" />
    </div>
    <div class="footer-right">
      <div class="footer-contact">
        <span class="footer-text">联系我们</span>
        <div class="footer-details">
          <span class="footer-team">沪cares musicals团队</span>
          <span class="footer-email">Email: 1363746469@qq.com</span>
           <span class="footer-tel">Tel: 13612930976 Ms.Zheng</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';

defineComponent({
  name: 'UserFooter',
});
</script>

<style scoped>
.footer-bar {
  width: 100%;
  left: 0;
  bottom: 0;
  position: fixed; /* 固定底部 */
  z-index: 1000; /* 确保底栏在最上面 */
  display: flex;
  align-items: center;
  height: 60px; /* 底栏高度 */
  background: linear-gradient(to right, #ffffff, #f2e1ae); /* 渐变背景 */
  overflow: hidden; /* 隐藏溢出部分 */
}

.footer-left {
  display: flex;
  align-items: center;
  padding-left: 30px; /* 左边距 */
  height: 100%;
  flex-shrink: 0; /* 防止缩小 */
  position: relative; /* 相对定位 */
  border-radius: 10 50% 50% 0; /* 创建弧线 */
  background-color: #ffffff; /* 左边背景色 */
}

.footer-logo {
  height: 60px; /* 图片高度 */
  margin-right: 10px;
  margin-left: -20px; /* 向左移动 */
  margin-top: 5px; /* 向下移动 */
}

.footer-slogan {
  height: 70px; /* 图片高度 */
  margin-left: 10px; /* 向左移动 */
}

.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-grow: 1; /* 填充剩余空间 */
}

.footer-contact {
  text-align: left;
}

.footer-text {
  font-size: 16px;
  color: #59310e;
  font-weight: bold; /* 字体加粗 */
  font-family: '宋体', sans-serif; /* 中文字体 */
  margin-bottom: 5px;
}

.footer-details {
  display: flex;
  flex-direction: row; /* 改为行内布局 */
}

.footer-team, .footer-email,.footer-tel  {
  font-size: 14px;
  color: #59310e;
  font-family: '宋体', sans-serif; /* 中文字体 */
  margin-right: 40px; /* 右边距 */
}


</style>
