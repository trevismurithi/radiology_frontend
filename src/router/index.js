// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { getAuth  } from "firebase/auth";

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/DefaultLayout.vue'),
    beforeEnter: (to) => {
      const auth = getAuth();
      if(auth.currentUser && auth.currentUser.email) {
        if(to.path === '/') {
          return '/home'
        }
        return true
      }
      return '/auth/login'
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (Home-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/HomePage.vue'),
      },
      {
        path: '/reports',
        name: 'ReportList',
        // route level code-splitting
        // this generates a separate chunk (Home-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/ReportsPage.vue'),
      },
      {
        path: '/report',
        name: 'Report',
        // route level code-splitting
        // this generates a separate chunk (Home-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/ReportPage.vue'),
      },
      {
        path: '/archives',
        name: 'Archives',
        // route level code-splitting
        // this generates a separate chunk (Home-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/ArchivesPage.vue'),
      },
      {
        path: '/profile',
        name: 'Profile',
        // route level code-splitting
        // this generates a separate chunk (Home-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/ProfilePage.vue'),
      },
    ],
  },
  {
    path: '/auth/login',
    component: () => import('@/layouts/auth/DefaultLayout.vue'),
    beforeEnter: () => {
      const auth = getAuth();
      if(!auth.currentUser || !auth.currentUser.email) {
        return true
      }
      return '/'
    },
    children: [
      {
        path: '',
        name: 'Login',
        // route level code-splitting
        // this generates a separate chunk (Home-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/LoginPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
