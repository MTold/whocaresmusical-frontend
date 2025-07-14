import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/user/HomeView.vue'
import TheaterListView from '../views/user/TheaterListView.vue'
import ShowListView from '../views/user/ShowListView.vue'
import ProfileLayout from '../views/profile/ProfileLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
      path: '/profile',
      name: 'profile',
      component: ProfileLayout,
    },

  ],
})

export default router
