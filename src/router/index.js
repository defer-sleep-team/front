import { createRouter, createWebHistory } from 'vue-router';
import Auth from '@/views/AuthView.vue';
import Home from '@/views/HomeView.vue';
import Profile from '@/views/ProfileView.vue';
import CreatePost from '@/components/CreatePost.vue'; // Импортируем компонент для создания поста
import PostWidget from '@/components/PostWidget.vue'; // Импортируем компонент для просмотра поста
import UnderDevelopmentView from '@/views/UnderDevelopmentView.vue';
import TermsView from '@/views/TermsView.vue';
import HelpView from '@/views/HelpView.vue';
import SubscriptionsView from '@/views/SubscriptionsView.vue';

const isAuthenticated = () => {
  // Проверяем, есть ли куки
  return document.cookie.includes('auth'); // Замените на имя вашей куки
};

const routes = [
  {
    path: '/',
    component: Home,
   
  },
  { path: '/auth', component: Auth },
  { path: '/profile/:profileID', component: Profile,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next('/auth'); // Перенаправляем на страницу авторизации
      } else {
        next();
      }
    },
   },
  {
    path: '/create-post',
    component: CreatePost,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next('/auth'); // Перенаправляем на страницу авторизации
      } else {
        next();
      }
    },
  },
  {
    path: '/watch-post/:postID',
    component: PostWidget,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next('/auth'); // Перенаправляем на страницу авторизации
      } else {
        next();
      }
    },
  },
  {
    path: '/subscriptions',
    component: SubscriptionsView,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next('/auth'); // Перенаправляем на страницу авторизации
      } else {
        next();
      }
    },
  },
  {
    path: '/support',
    component: HelpView,
  },
  {
    path: '/terms',
    component: TermsView, // Добавляем новый маршрут
  },
  {
    path: '/:catchAll(.*)',
    component: UnderDevelopmentView,
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;
