// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // type-only import

// Lazy-loaded views
const HomeView  = () => import('../views/HomeView.vue')
const Details   = () => import('../views/Details.vue')
const Comments  = () => import('../views/Comments.vue')
const AboutView = () => import('../views/AboutView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    // Details page (your app uses /news/:id)
    path: '/news/:id',
    name: 'details',
    component: Details,
    props: true,
    // ❌ No children here — we removed the nested comments route
  },
  {
    // Top-level comments page
    path: '/comments/:id',
    name: 'comments',
    component: Comments,
    props: true, // passes route.params.id as prop
  },

  // (optional) compatibility alias if any old links use /details/:id
  // { path: '/details/:id', redirect: (to) => ({ name: 'details', params: to.params }) },

  // (optional) catch-all to home
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
