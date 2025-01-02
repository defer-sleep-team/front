<template>
  <div>
    <AppHeader />

    <div class="pl-5 pr-5 min-height">
      <!-- Profile Section -->
      <div class="user-cover" :style="{ backgroundImage: `url(${user.background})` }">
        <div class="avatar-container" @click="openAvatarModal">
          <img v-if="user.avatar" :src="user.avatar" alt="Avatar" class="avatar" />
        </div>
      </div>

      <!-- Информация о пользователе ниже аватарки -->
      <div class="user-info">
        <h1 class="username text-4xl">{{ user.username }}</h1>
        <p class="text15" :class="privilegeClass">{{ privilegeText }}</p>
        <div class="subscribers-info">
          <p class="subscribers-count text15">Подписчики: {{ user.subscribers_count }}</p>
         </div>
        <p v-if="user.bio" class="text-1xl user-bio" @click="toggleBio" :class="{ 'collapsed': !bioVisible }">
          {{ bioVisible ? user.bio : user.bio.split('\n').slice(0, 3).join('\n') + '...' }}
          <span v-if="!bioVisible && isBioOverflow" class="text-blue-500 cursor-pointer"> показать далее</span>
        </p>

        <div class="action-buttons">
          <button v-if="isCurrentUser" @click="openChangeUser" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Изменить профиль
          </button>
          <button v-else-if="!user.is_subscribed" @click="subscribe" class="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Подписаться
          </button>
          <button v-else @click="unsubscribe" class="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
            Отписаться
          </button>
        </div>
      </div>

      <!-- Posts Section -->
      <h2 class="text-2xl mt-4 font-exo">Посты пользователя</h2>
      <button v-if="isCurrentUser" @click="openCreatePost" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Создать пост
      </button>
      <div class="columns-container">
        <div v-for="(column, index) in columns" :key="index" class="column">
          <div v-for="post in column" :key="post.id" class="post-container" @click="openPostDetails(post)">
            <PostWidget
              :post="post"
            />
          </div>
        </div>
        <div v-if="hasError">
          <p>Произошла ошибка при загрузке постов.</p>
        </div>
        <div v-else-if="posts.length === 0">
          <p>Нет постов для отображения.</p>
        </div>
      </div>

      <PostDetailWidget
        v-if="selectedPost"
        :post="selectedPost"
        @close="closePostDetails"
      />

      <CreatePost
        v-if="isCreatePostVisible"
        @close="closeCreatePost"
        :isVisible="isCreatePostVisible"
      />

      <ChangeUser
        v-if="isChangeUserVisible"
        :user="user"
        @close="closeChangeUser"
        @profile-updated="fetchUserProfile(user.id)"
      />
    </div>

    <!-- Модальное окно для аватара -->
    <div v-if="isAvatarModalVisible" class="modal" @click="closeAvatarModal">
      <img :src="user.avatar" alt="Avatar" class="modal-avatar" @click.stop />
    </div>
  </div>
</template>

<script>
import PostWidget from '@/components/PostWidget.vue';
import PostDetailWidget from '@/components/PostDetailWidget.vue';
import CreatePost from '@/components/CreatePost.vue';
import ChangeUser from '@/components/ChangeUser.vue';
import AppHeader from '@/components/AppHeader.vue';

export default {
  components: {
    PostWidget,
    PostDetailWidget,
    CreatePost,
    ChangeUser,
    AppHeader,
  },
  data() {
    return {
      user: null,
      posts: [],
      selectedPost: null,
      isCreatePostVisible: false,
      isChangeUserVisible: false,
      hasError: false,
      bioVisible: false,
      isAvatarModalVisible: false,
      isBioOverflow: false,
      numberOfColumns: 1, // Default to 1 column
    };
  },
  computed: {
    columns() {
      const columns = Array.from({ length: this.numberOfColumns }, () => []);
      this.posts.forEach((post, index) => {
        columns[index % this.numberOfColumns].push(post);
      });
      return columns;
    },
    isCurrentUser() {
      const userIdFromCookie = this.getUserIdFromCookie();
      return this.user && this.user.id == userIdFromCookie;
    },
    privilegeText() {
      switch (this.user?.privilege_level) {
        case 0: return 'Пользователь';
        case 1: return 'Модератор';
        case 2: return 'Администратор';
        case 3: return 'Альфа-тестер';
        default: return 'Неизвестный уровень';
      }
    },
    privilegeClass() {
      switch (this.user?.privilege_level) {
        case 0: return 'text-gray-500'; // Обычный пользователь
        case 1: return 'text-green-500'; // Зеленый для модератора
        case 2: return 'text-red-500'; // Красный для администратора
        case 3: return 'text-violet-500'; // Фиолетовый для альфа-тестера
        default: return '';
      }
    }
  },
  async created() {
    const userId = this.$route.params.profileID;
    if (userId) {
      await this.fetchUserProfile(userId);
      await this.fetchUserPosts(userId);
      this.calculateNumberOfColumns();
    } else {
      alert('Не удалось получить ID пользователя. Пожалуйста, войдите в систему.');
    }
  },
  methods: {
    calculateNumberOfColumns() {
      const width = window.innerWidth;
      if (width >= 1200) {
        this.numberOfColumns = 5;
      } else if (width >= 992) {
        this.numberOfColumns = 4;
      } else if (width >= 768) {
        this.numberOfColumns = 3;
      } else if (width >= 480) {
        this.numberOfColumns = 2;
      } else {
        this.numberOfColumns = 1;
      }
    },
    toggleBio() {
      this.bioVisible = !this.bioVisible;
    },
    checkBioOverflow() {
      this.$nextTick(() => {
        const bioElement = this.$refs.bioElement;
        if (bioElement) {
          this.isBioOverflow = bioElement.scrollHeight > bioElement.clientHeight;
        }
      });
    },
    openAvatarModal() {
      this.isAvatarModalVisible = true; // Показываем модальное окно аватара
    },
    closeAvatarModal() {
      this.isAvatarModalVisible = false; // Скрываем модальное окно аватара
    },
    async fetchUserProfile(userId) {
      try {
        const response = await fetch(`https://api.aether-net.ru/api/get/user/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          this.user = await response.json();
        } else {
          alert('Ошибка при загрузке профиля');
        }
        this.checkBioOverflow();
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при выполнении запроса');
      }
    },

    async fetchUserPosts(userId) {
      try {
        const response = await fetch(`https://api.aether-net.ru/api/get/posts_of/${userId}/100`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          this.posts = Array.isArray(data) ? data : [];
          this.hasError = false; // Сбрасываем ошибку
          console.log('Посты пользователя:', this.posts);
        } else {
          this.hasError = true; // Устанавливаем ошибку
          alert('Ошибка при загрузке постов пользователя');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        this.hasError = true; // Устанавливаем ошибку
        alert('Ошибка при выполнении запроса');
      }
    },

    async subscribe() {
      const userId = this.$route.params.profileID; // Получаем ID пользователя из URL
      // Подписка на пользователя
      try {
        const response = await fetch(`https://api.aether-net.ru/api/put/subscribe/${userId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          this.user.is_subscribed = true; // Обновляем статус подписки
        } else {
          alert('Ошибка при подписке');
        }
      } catch (error) {
        console.error('Ошибка:', error);
      }
    },

    async unsubscribe() {
      const userId = this.$route.params.profileID; // Получаем ID пользователя из URL
      // Отписка от пользователя
      try {
        const response = await fetch(`https://api.aether-net.ru/api/put/unsubscribe/${userId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          this.user.is_subscribed = false; // Обновляем статус подписки
        } else {
          alert('Ошибка при отписке');
        }
      } catch (error) {
        console.error('Ошибка:', error);
      }
    },

    openPostDetails(post) {
      console.log('Выбранный пост:', post);
      this.selectedPost = post; // Устанавливаем выбранный пост
    },

    closePostDetails() {
      console.log('Закрытие деталей поста');
      this.selectedPost = null; // Сбрасываем выбранный пост
    },

    openCreatePost() {
      this.isCreatePostVisible = true; // Показываем виджет создания поста
    },

    closeCreatePost() {
      this.isCreatePostVisible = false; // Скрываем виджет создания поста
    },

    openChangeUser() {
      this.isChangeUserVisible = true; // Показываем компонент изменения профиля
    },

    closeChangeUser() {
      this.isChangeUserVisible = false; // Скрываем компонент изменения профиля
    },

    getUserIdFromCookie() {
      const name = "userID=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');

      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
      return null;
    }
  }
};
</script>

<style scoped>
.min-height {
  min-height: 100vh;
}

.user-cover {
  height: 23vh; /* Высота обложки */
  background-size: cover; /* Обложка заполняет контейнер */
  background-position: center; /* Центрируем изображение */
  position: relative; /* Для позиционирования аватара */
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Выравнивание аватара по нижнему краю */
  border-radius: 10px; /* Скругление углов */
  margin: 0 2%; /* Отступы по 2% от каждого края */
}

@media (min-width: 1024px) {
  .user-cover {
    height: 30vh; /* Увеличенная высота обложки на широких экранах */
  }
}

.avatar-container {
  position: relative;
  margin-bottom: -10rem; /* Поднимаем аватар над обложкой */
}

.avatar {
  width: 18rem; /* Установите нужный размер аватара */
  height: 18rem;
  border-radius: 50%; /* Круглая форма аватара */
  object-fit: cover; /* Обеспечивает правильное отображение изображения */
  border: 4px solid white; /* Белая рамка вокруг аватара */
}

.text15 {
  font-size: 1.3rem;
}

.user-info {
  text-align: center; /* Центрируем текст информации о пользователе */
  margin-top: 6rem; /* Увеличьте отступ сверху для информации о пользователе */
  padding: 4rem 20px; /* Добавьте отступы по бокам для мобильных устройств */
}

@media (min-width: 1024px) {
  .user-info {
    margin-top: 7rem; /* Увеличенный отступ для широких экранов */
  }
}

.username {
  font-size: 2rem; /* Размер имени пользователя */
  font-weight: bold; /* Жирный шрифт */
}

.user-status {
  font-size: 0.875rem; /* Размер статуса пользователя */
  color: gray; /* Цвет статуса */
}

.user-bio {
  margin-top: 10px; /* Отступ сверху для биографии */
  font-size: 1.125em; /* Увеличьте размер шрифта (пример: 1.125em соответствует 18px, если базовый размер 16px) */
  cursor: pointer; /* Указатель при наведении */
  white-space: pre-wrap; /* Сохраняем пробелы и переносы строк */
}

.action-buttons {
  margin-top: 20px; /* Отступ сверху для кнопок */
}

.columns-container {
  display: flex;
  align-self: center;
  flex-wrap: wrap; /* Позволяет колонкам переноситься на следующую строку */
  width: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Позволяет колонкам занимать равное пространство */
  min-width: 200px; /* Минимальная ширина колонки */
  padding-left: 0.5rem; /* Отступ слева */
  padding-right: 0.5rem; /* Отступ справа */
}

.post-container {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
  margin-bottom: 15px;
}

.post-container:hover {
  transform: scale(1.02);
}

/* Adaptive styles for different screen sizes */
@media (min-width: 1200px) {
  .column {
    flex-basis: calc(20% - 2rem); /* 5 колонок с учетом отступов */
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .column {
    flex-basis: calc(25% - 2rem); /* 4 колонки с учетом отступов */
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .column {
    flex-basis: calc(33.33% - 2rem); /* 3 колонки с учетом отступов */
  }
}

@media (max-width: 767px) {
  .column {
    flex-basis: calc(50% - 2rem); /* 2 колонки с учетом отступов */
  }
}

@media (max-width: 480px) {
  .column {
    flex-basis: calc(100% - 2rem); /* 1 колонка с учетом отступов */
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7); /* Полупрозрачный фон */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-avatar {
  width: auto; /* Размер аватара в модальном окне */
  height: 55%;
  object-fit: cover; /* Обеспечивает правильное отображение изображения */
}

h1, h2 {
  margin: 0; /* Убираем отступы у заголовков */
}

h1 {
  font-size: 2rem; /* Размер заголовка профиля */
}

h2 {
  font-size: 1.5rem; /* Размер заголовка постов */
  font-family: 'Exo 2', sans-serif; /* Устанавливаем шрифт Exo 2 для заголовка постов */
}

p {
  margin: 4px 0; /* Отступы для параграфов */
}

.subscribers-info {
  display: flex;
  justify-content: center;
  gap: 1rem; /* Промежуток между элементами */
}
</style>
