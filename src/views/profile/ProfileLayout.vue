<template>
  <div class="profile-layout">
    <aside class="profile-sidebar">
      <ul class="profile-menu">
        <li v-for="item in menuItems" :key="item.key"
            :class="{ active: isActive(item), group: item.group }"
            @click="!item.group && goTo(item.key)">
          <template v-if="!item.group">{{ item.label }}</template>
          <template v-else><span class="group-title">{{ item.label }}</span></template>
        </li>
      </ul>
    </aside>
    <main class="profile-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

interface MenuItem {
  key: string;
  label: string;
  routeName?: string;
  group?: boolean;
}

const menuItems: MenuItem[] = [
  { key: 'my-info', label: '个人信息管理', routeName: 'MyInfo' },
  { key: 'my-reviews', label: '我的评价', routeName: 'MyReviews' },
  { key: 'favorite-shows', label: '收藏剧目', routeName: 'FavoriteShows' },
  { key: 'browse-history', label: '历史浏览记录', routeName: 'BrowseHistory' },
  { key: 'other-group', label: '其他', group: true },
  { key: 'faq', label: '常见问题', routeName: 'FAQ' },
  { key: 'messages', label: '消息中心', routeName: 'Messages' },
]

function goTo(page: string) {
  const item = menuItems.find(i => i.key === page)
  if (item && !item.group && item.routeName) router.push({ name: item.routeName })
}

function isActive(item: MenuItem) {
  return item.routeName && route.name === item.routeName
}
</script>

<style scoped>
.profile-layout {
  display: flex;
  max-width: 900px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  min-height: 500px;
}
.profile-sidebar {
  width: 200px;
  border-right: 1px solid #eee;
  padding: 32px 0 32px 24px;
  background: #fafafa;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
.profile-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.profile-menu li {
  padding: 16px 0;
  cursor: pointer;
  font-size: 18px;
  transition: color 0.2s;
  border-bottom: 1px solid #eee;
}
.profile-menu li:last-child {
  border-bottom: none;
}
.profile-menu li:hover {
  color: #e67e22;
}
.profile-menu li.active {
  color: #a0522d;
  font-weight: bold;
  background: #f7f1ed;
}
.profile-menu li.group {
  cursor: default;
  background: none;
  color: #bbb;
  font-size: 15px;
  font-weight: bold;
  padding-top: 18px;
  padding-bottom: 6px;
  border-bottom: none;
}
.group-title {
  padding-left: 2px;
  letter-spacing: 2px;
}
.profile-content {
  flex: 1;
  padding: 40px 32px;
  min-width: 0;
}
</style>
