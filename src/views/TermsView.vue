<template>
    <AppHeader class="custom-header" />
    <div class="min-h-screen flex flex-col p-7 items-center justify-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-6">Пользовательское соглашение</h1>
      <p class="text-lg text-gray-700 mb-4">
        Пожалуйста, внимательно прочитайте следующие условия и положения.
      </p>
      <div class="mb-4">
        <h2 class="text-xl font-semibold">Скачиваемые файлы</h2>
        <ul class="list-disc list-inside">
          <li>
            <a
              href="/Пользовательское соглашение.pdf"
              download 
              class="text-blue-500 hover:underline"
            >
              Скачайте Пользовательское соглашение (PDF)
            </a>
          </li>
          <li>
            <a
              href="/Политика_обработки_персональных_данных.pdf"
              download
              class="text-blue-500 hover:underline"
            >
              Скачайте Политику обработки персональных данных (PDF)
            </a>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import AppHeader from '@/components/AppHeader.vue';
  
  export default {
    components: {
      AppHeader,
    },
    name: 'TermsView',
  };
  </script>
  
  <style scoped>
  .custom-header {
    position: absolute;
    top: 0;
    left: 0; /* Устанавливаем левое положение */
    right: 0; /* Устанавливаем правое положение */
    z-index: 10; /* Устанавливаем z-index, чтобы заголовок был поверх других элементов */
  }
  </style>
  