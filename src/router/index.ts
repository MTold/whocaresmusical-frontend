import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/user/HomeView.vue'
import ScheduleView from '../views/user/ScheduleView.vue'
import TheaterListView from '../views/user/TheaterListView.vue'
import ShowListView from '../views/user/ShowListView.vue'
import ProfileLayout from '../views/profile/ProfileLayout.vue'
import ShowDetailView from '../views/user/ShowDetailView.vue'
import LoginView from '../views/user/LoginView.vue'
import ForgotPasswordView from '../views/user/ForgotPasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: ScheduleView,
    },
    {
      path: '/theaters',
      name: 'theaters',
      component: TheaterListView,
    },
    {
      path: '/shows',
      name: 'shows',
      component: ShowListView,
    },
    {
      path: '/shows/:id',
      name: 'ShowDetail',
      props: true,
      component: ShowDetailView
    },
    {
      path: '/shows/:id/review',
      name: 'ShowReview',
      component: () => import('../views/user/ShowReview.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileLayout,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/user-register',
      name: 'user-register',
      component: () => import('../views/user/UserRegisterView.vue')
    },
  ],
})

export default router
