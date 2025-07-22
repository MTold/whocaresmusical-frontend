import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  /* 普通用户区 */
  {
    path: '/',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/user/HomeView.vue') },
      {
        path: 'schedule',
        name: 'schedule',
        component: () => import('@/views/user/ScheduleView.vue'),
      },
      {
        path: 'theaters',
        name: 'theaters',
        component: () => import('@/views/user/TheaterListView.vue'),
      },
      {
        path: 'theaters/:id',
        name: 'TheaterDetail',
        props: true,
        component: () => import('@/views/user/TheaterDetailView.vue'),
      },
      { path: 'shows', name: 'shows', component: () => import('@/views/user/MusicalListView.vue') },
      {
        path: 'shows/:id',
        name: 'ShowDetail',
        props: true,
        component: () => import('@/views/user/MusicalDetailView.vue'),
      },
      {
        path: 'shows/:id/review',
        name: 'ShowReview',
        component: () => import('@/views/user/ShowReview.vue'),
      },
      {
        path: 'profile',
        component: () => import('@/views/profile/ProfileLayout.vue'),
        children: [
          { path: '', redirect: { name: 'MyInfo' } },
          {
            path: 'my-info',
            name: 'MyInfo',
            component: () => import('@/views/profile/MyInfo.vue'),
          },
          {
            path: 'my-reviews',
            name: 'MyReviews',
            component: () => import('@/views/profile/MyReviews.vue'),
          },
          {
            path: 'favorite-shows',
            name: 'FavoriteShows',
            component: () => import('@/views/profile/FavoriteShows.vue'),
          },
          {
            path: 'browse-history',
            name: 'BrowseHistory',
            component: () => import('@/views/profile/BrowseHistory.vue'),
          },
          { path: 'faq', name: 'FAQ', component: () => import('@/views/profile/FAQ.vue') },
          {
            path: 'messages',
            name: 'Messages',
            component: () => import('@/views/profile/Messages.vue'),
          },
        ],
      },
      {
        path: 'user-register',
        name: 'user-register',
        component: () => import('@/views/user/RegisterView.vue'),
      },
      { path: 'login', name: 'login', component: () => import('@/views/user/LoginView.vue') },
    ],
  },

  /* 公共页面，不挂在任何布局里（无头无尾） */
  // { path: '/forgot-password', name: 'forgot-password', component: () => import('@/views/user/ForgotPasswordView.vue') },

  /* 管理员区 */
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      {
        path: 'dashboard',
        name: 'DashboardView',
        component: () => import('@/views/admin/DashboardView.vue'),
      },

      {
        path: 'users',
        name: 'UserManager',
        component: () => import('@/views/admin/UserManagerView.vue'),
      },
      {
        path: 'reviews',
        name: 'ReviewManager',
        component: () => import('@/views/admin/ReviewManagerView.vue'),
      },
      {
        path: 'news',
        name: 'NewsManager',
        component: () => import('@/views/admin/InfoManagerView.vue'),
      },
      {
        path: 'shows',
        name: 'ShowManager',
        component: () => import('@/views/admin/ShowManagerView.vue'),
      },
      {
        path: 'theaters',
        name: 'TheaterManager',
        component: () => import('@/views/admin/TheaterManagerView.vue'),
      },
      /* 其余管理子页面继续往这里加 */
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/* -------- 简易路由守卫 -------- */
router.beforeEach((to, _, next) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  if (to.path.startsWith('/admin') && !isAdmin) return next('/login')
  next()
})

export default router
