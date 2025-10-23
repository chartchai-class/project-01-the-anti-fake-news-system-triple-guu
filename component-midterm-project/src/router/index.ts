// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // type-only import
import { useAuthStore } from '@/stores/authStore'

// Lazy-loaded views
const HomeView  = () => import('../views/HomeView.vue')
const Details   = () => import('../views/Details.vue')
const Comments  = () => import('../views/Comments.vue')
const AboutView = () => import('../views/AboutView.vue')
const PostView = () => import('../views/PostView.vue')
const LoginView = () => import('../views/LoginView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/edit-profile',
    name: 'edit-profile',
    component: () => import('@/views/EditProfileView.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
 {
  path: "/news/create",
  name: "CreateNews",
  component: () => import("@/views/CreateNewsView.vue"),
},
{
  path: '/about',
  name: 'about',
  component: () => import('@/views/AboutView.vue'),
},

  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
    {
    path: '/post',
    name: 'post',
    component:PostView
  },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
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

// Global navigation guard for authentication
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const publicPages = ['/login', '/about', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const token = auth.token || localStorage.getItem('jwt');
  if (authRequired && !token) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router
