import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/user/HomeView.vue'
import ScheduleView from '../views/user/ScheduleView.vue'
import TheaterListView from '../views/user/TheaterListView.vue'
import ShowListView from '../views/user/ShowListView.vue'
import ProfileLayout from '../views/profile/ProfileLayout.vue'
import ShowDetailView from '../views/user/ShowDetailView.vue'

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
    }
  ],
})

export default router
