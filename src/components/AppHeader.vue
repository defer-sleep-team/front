<template>
  <div>
    <header class="flex justify-between items-center p-4 mb-4 bg-blue-100">
      <a href="/" class="aether text-7xl">Aether</a>
      <button v-if="isLoggedIn" @click="toggleSidebar" class="menu-button bg-blue-500 text-white py-3 px-5 rounded flex items-center text-lg">
        <span class="menu-text pr-2">Меню</span> <i class="fas fa-bars"></i> <!-- Иконка гамбургера -->
      </button>
      <button v-else @click="redirectToAuth" class="menu-button bg-blue-500 text-white py-3 px-5 rounded flex items-center text-lg">
        <span class="menu-text">Войти</span> <i class="fas fa-sign-in-alt ml-2"></i> <!-- Иконка входа -->
      </button>
    </header>

    <nav :class="['sidebar', { 'is-active': sidebarOpen }]">
      <div class="sidebar-header">
        <h2 class="headermenu text-6xl">Меню</h2>
        <button @click="toggleSidebar" class="close-button">
          <i class="fas fa-times"></i> <!-- Иконка крестика -->
        </button>
      </div>
      <ul>
        <li class="litem h-full flex items-center"><a @click.prevent="goToProfile"><i class="fas fa-user mr-2"></i>Профиль</a></li>
        <li class="litem h-full flex items-center"><router-link to="/subscriptions" @click="toggleSidebar"><i class="fas fa-bell mr-2"></i>Подписки</router-link></li>
        <li class="litem h-full flex items-center"><router-link to="/support" @click="toggleSidebar"><i class="fas fa-question-circle mr-2"></i>Поддержка</router-link></li>
        <li class="litem h-full flex items-center"><router-link to="/terms" @click="toggleSidebar"><i class="fas fa-file-alt mr-2"></i>Правила</router-link></li>
      </ul>
      <div class="flex justify-center mt-auto">
        <li class="litem h-full flex items-center w-full"><a @click.prevent="logout"><i class="fas fa-sign-out-alt mr-2"></i>Выйти</a></li>
      </div>
    </nav>

    <div class="mask" v-if="sidebarOpen" @click="toggleSidebar"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sidebarOpen: false, // Состояние боковой панели
      userId: this.getUserIdFromCookie(),
      auth: this.getAuthFromCookie(),
    };
  },
  computed: {
    isLoggedIn() {
      return this.userId != null && this.auth != null;
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    getUserIdFromCookie() {
      const name = "userID=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) == 0) {
          const cookieValue = cookie.substring(name.length, cookie.length);
          return this.isCookieValid(cookie) ? cookieValue : null;
        }
      }
      return null;
    },
    getAuthFromCookie() {
      const name = "auth=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) == 0) {
          const cookieValue = cookie.substring(name.length, cookie.length);
          return this.isCookieValid(cookie) ? cookieValue : null;
        }
      }
      return null;
    },
    isCookieValid(cookie) {
      const cookieParts = cookie.split(';');
      for (let part of cookieParts) {
        if (part.trim().startsWith('expires=')) {
          const expires = new Date(part.trim().substring(8));
          return expires > new Date(); // Проверяем, не истек ли срок действия куки
        }
      }
      return true; // Если нет информации о сроке действия, считаем куки действительными
    },
    logout() {
      // Отправляем запрос на сервер для выхода
      fetch("https://api.aether-net.ru/logout", {
        method: 'DELETE',
        credentials: 'include' // Включаем куки в запрос, если это необходимо
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка при выходе');
        }

        // Удаляем все куки после успешного ответа от сервера
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.split("=")[0].trim(); // Получаем имя куки
          console.log("Удаляем куки:", cookieName); // Выводим имя куки, который будет удален
          document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        });

        this.$router.push('/auth'); // Перенаправление на страницу авторизации
      })
      .catch(error => {
        console.error("Ошибка при выходе:", error);
        // Обработка ошибок, если необходимо
      });
    },
    goToProfile() {
      if (this.isLoggedIn) {
        this.$router.push(`/profile/${this.userId}`); // Перенаправление на страницу профиля
      }
    },
    redirectToAuth() {
      this.$router.push('/auth'); // Перенаправление на страницу авторизации
    }
  },

  mounted() {
    // Скрыть меню по умолчанию на компьютерах
    if (window.innerWidth > 768) {
      this.sidebarOpen = false;
    }
  }
};
</script>

<style>
/* Ваши стили остаются без изменений */
.sidebar {
  position: fixed;
  top: 0;
  right: -650px; /* Скрываем панель за пределами экрана справа */
  width: 25vw; /* Ширина панели 25% от ширины экрана */
  height: 100%;
  background-color: #fff;
  transition: right 0.3s ease;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.sidebar.is-active {
  right: 0; /* Показываем панель */
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.close-button {
  background: none;
  border: none;
  color: #333;
  font-size: 24px;
  cursor: pointer;
}

.logo {
  padding: 20px;
  font-size: 24px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.aether {
  color: #2597FF;
  font-family: 'Varela Round', sans-serif; /* Применяем шрифт Varela Round */
}

.headermenu {
  color: #2597FF;
  font-family: 'Exo 2', sans-serif; /* Применяем шрифт Exo 2 */
}

.litem {
  font-size: 1.5em;
  font-family: 'Exo 2', sans-serif; /* Применяем шрифт Exo 2 */
}

li {
  padding: 0;
  border-bottom: 1px solid #ddd;
}

li a {
  text-decoration: none;
  color: #333;
  display: flex; /* Используем flex для выравнивания иконок и текста */
  align-items: center; /* Центрируем иконки по вертикали */
  padding: 15px 20px;
  width: 100%;
  height: 100%;
}

li a:hover {
  background-color: #f0f0f0;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 768px) {
  .sidebar {
    width: 80vw;
  }

  .aether {
    font-size: 2.5rem; /* Уменьшить размер текста */
  }

  .menu-text {
    display: none; /* Скрываем текст "Меню" на мобильных устройствах */
  }

  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    padding: 0;
    border-radius: 50%;
  }

  .menu-button i {
    font-size: 1.8rem;
  }
}
</style>
