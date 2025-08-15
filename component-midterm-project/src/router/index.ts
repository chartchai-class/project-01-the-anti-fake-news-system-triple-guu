// src/router/index.ts  (or src/route/index.ts if that's your folder)
import { createRouter, createWebHistory } from 'vue-router'
import { getById } from '../data/news'

// ✅ lazy-load views with the correct filenames
const Home = () => import('../views/HomeView.vue')
const Details = () => import('../views/Details.vue')
const Comments = () => import('../views/Comments.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    {
      path: '/news/:id',
      name: 'details',
      component: Details,
      props: true,
      beforeEnter: (to, _from, next) => {
        const item = getById(String(to.params.id))
        if (!item) return next({ name: 'home' })
        to.meta.item = item
        next()
      },
      children: [
        { path: 'comments', name: 'comments', component: Comments, props: true }
      ]
    }
  ]
})

export default router
