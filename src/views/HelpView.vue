<template>
    <AppHeader class="custom-header" />
    <div class="min-h-screen flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-6">
        Администратор сайта - 
        <a href="https://aether-net.ru/profile/86" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">LLlE0</a>
      </h1>
      <h1 class="text-4xl font-bold text-gray-800 mb-6">Адрес техподдержки Aether - defersleep@gmail.com</h1>
      <img src="../assets/big_logo.png" alt="Big Logo" class="max-w-md" />
    </div>
  </template>
  
  <script>
  import AppHeader from '@/components/AppHeader.vue';
  
  export default {
    components: {
      AppHeader,
    },
    name: 'UnderDevelopmentView',
  };
  </script>
  
  <style scoped>
  .custom-header {
    position: absolute;
    top: 0; /* Устанавливаем верхнее положение */
    left: 0; /* Устанавливаем левое положение */
    right: 0; /* Устанавливаем правое положение */
    z-index: 10; /* Устанавливаем z-index, чтобы заголовок был поверх других элементов */
  }
  </style>
  