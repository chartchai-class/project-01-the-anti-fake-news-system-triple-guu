// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // <- type-only import fixes your error

// Lazy-loaded views
const HomeView = () => import('../views/HomeView.vue')
const Details   = () => import('../views/Details.vue')
const Comments  = () => import('../views/Comments.vue')
const AboutView  = () => import('../views/AboutView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  
  {
    path: '/about',
    name: 'About',
    component: AboutView,
  },

  {
    path: '/news/:id',
    name: 'details',
    component: Details,
    props: true, // passes :id as a prop to Details
    children: [
      {
        path: 'comments',
        name: 'comments',
        component: Comments,
        props: true, // passes :id as a prop to Comments
      },
    ],
  },
  // (optional) catch-all → send unknown routes to home
  // { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
