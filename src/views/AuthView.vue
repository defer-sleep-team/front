<template>
  <div class="flex h-screen bg-blue-100">
    <div class="flex-1 hidden md:flex flex-col items-center justify-center bg-blue-100 p-10">
      <h1 class="text-7xl font-bold text-blue-500 mb-4 aether">Aether</h1>
      <p class="text-center text-3xl mb-6">Медиахостинг для творческих личностей.
        <br />
        <br />Развивай свой собственный бренд!
        <br />Настраивай платные подписки!
        <br />Покажи всю красоту своего внутреннего мира!</p>
      <img src="@/assets/auth.png" alt="Фотоколлаж" class="w-full h-auto max-w-xs" />
    </div>
    <div class="flex-1 flex flex-col items-center justify-center p-10">
      <div class="md:hidden text-center mb-2">
        <h1 class="text-5xl font-bold text-blue-500 mb-2 aether">Aether</h1>
        <p class="text-2xl mb-4">Медиахостинг для творческих личностей.<br />Развивай свой собственный бренд!<br />Покажи всю красоту своего внутреннего мира!</p>
      </div>
      <div class="bg-white p-10 rounded-lg shadow-lg w-full max-w-md md:max-w-lg">
        <h2 class="text-3xl mb-6 text-center">{{ isLogin ? 'Авторизация' : 'Регистрация' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div v-if="errorMessage" class="text-red-500 mb-4 text-center">{{ errorMessage }}</div>
          <input
            v-if="!isLogin"
            type="text"
            v-model="username"
            placeholder="Имя пользователя"
            class="border p-4 mb-4 w-full rounded text-lg" 
            required
          />
          <input
            type="email"
            v-model="email"
            placeholder="Email"
            class="border p-4 mb-4 w-full rounded text-lg" 
            required
          />
          <input
            type="password"
            v-model="password"
            placeholder="Пароль"
            class="border p-4 mb-4 w-full rounded text-lg" 
            required
          />
          <button class="bg-blue-500 text-white p-4 rounded w-full hover:bg-blue-600 transition duration-200 text-lg"> 
            {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
          </button>
          <div id="buttonContainerId" class="mt-4"></div> <!-- Контейнер для кнопки Яндекса -->
          <div v-if="!isLogin" class="text-sm text-center mt-4">
            Регистрируясь на сервисе, вы подтверждаете свое согласие с 
            <router-link to="/terms" class="text-blue-500"> Условием пользовательского соглашения</router-link> и 
            <router-link to="/terms" class="text-blue-500"> Политикой обработки персональных данных</router-link>.
          </div>
        </form>
        <button @click="toggleForm" class="text-blue-500 mt-4 w-full text-center text-lg">
          {{ isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
///* global YaSendSuggestToken */
export default {
  data() {
    return {
      isLogin: true,
      email: '',
      username: '',
      password: '',
      errorMessage: '', // Состояние для сообщения об ошибке
    };
  },
  mounted() {
  // Проверка куки при монтировании компонента
  this.checkAuthCookie();

  // Инициализация Яндекс-авторизации
  if (document.cookie.includes('userID') && document.cookie.includes('auth')) {
    this.$router.push('/'); // Перенаправление на главную страницу
    return; // Выход из метода, чтобы не выполнять дальнейшую инициализацию
  }

  // Инициализация кнопки Яндекс-авторизации
  window.YaAuthSuggest.init({
    client_id: "efbba4c352a94b9aac2ce95ea445465c",
    response_type: "token",
    redirect_uri: "https://api.aether-net.ru/auth/yandex"
  }, "https://api.aether-net.ru", {
    view: "button",
    parentId: "buttonContainerId",
    buttonSize: 'm',
    buttonView: 'main',
    buttonTheme: 'light',
    buttonBorderRadius: "0",
    buttonIcon: 'ya',
  })
  .then(result => result.handler())
  .then(data => {
    console.log('Сообщение с токеном: ', data);
    this.sendTokenToServer(data.token); // Передаем токен на сервер
  })
  .catch(error => {
    console.log('Что-то пошло не так: ', error);
    alert('Ошибка при инициализации Яндекс-авторизации');
  });
},
methods: {
  checkAuthCookie() {
    const checkCookies = setInterval(() => {
      if (document.cookie.includes('auth')) {
        clearInterval(checkCookies); // Останавливаем проверку
        this.$router.push('/'); // Перенаправление на главную страницу
      }
    }, 100); // Проверяем каждые 100 мс
  }, 
  toggleForm() {
      this.isLogin = !this.isLogin;
      this.errorMessage = ''; // Сбрасываем сообщение об ошибке при переключении форм
    },
    async handleSubmit() {
      const url = this.isLogin ? 'https://api.aether-net.ru/login' : 'https://api.aether-net.ru/reg';
      const payload = this.isLogin
        ? { email: this.email, password: this.password }
        : { email: this.email, username: this.username, password: this.password };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include', // Включаем куки в запрос
        });

        if (response.ok) {
          const cookies = response.headers.get('Set-Cookie');
          if (cookies) {
            document.cookie = cookies; // Устанавливаем куки в клиенте
          }
          this.$router.push('/'); // Перенаправление на главную страницу
        } else if (response.status === 401) {
          const errorText = await response.text(); // Получаем текст ошибки
          this.errorMessage = errorText; // Устанавливаем сообщение об ошибке
        } else {
          const errorText = await response.text(); // Получаем текст ошибки
          alert(errorText || 'Ошибка при авторизации');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при выполнении запроса');
      }
    },
    async sendTokenToServer(token) {
  try {
    const response = await fetch('https://api.aether-net.ru/api/auth/yandex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      credentials: 'include', // Включаем куки в запрос
    });

    if (response.ok) {
      // Проверяем наличие куки
      const checkCookies = setInterval(() => {
        if (document.cookie.includes('auth')) {
          clearInterval(checkCookies); // Останавливаем проверку
          this.$router.push('/'); // Перенаправление на главную страницу
        }
      }, 100); // Проверяем каждые 100 мс
    } else {
      const errorText = await response.text(); // Получаем текст ошибки
      alert(errorText || 'Ошибка при авторизации через Яндекс');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Ошибка при выполнении запроса');
  }
}

  },
};
</script>

<style scoped>
@media (max-width: 768px) {
  .bg-white {
    padding: 30px; /* Увеличиваем отступы для мобильных устройств */
  }
  .aether {
    font-size: 5rem; /* Увеличиваем размер заголовка на мобильных устройствах */
  }
  .text-2xl {
    font-size: 1.5rem; /* Увеличиваем размер описания на мобильных устройствах */
  }
}

.aether {
  color: #2597FF;
  font-family: 'Varela Round', sans-serif;
}

@media (min-width: 768px) {
  .flex-1 {
    flex: 1; /* Увеличиваем ширину для больших экранов */
  }
}
</style>

