<template>
  <AppHeader />

  <div class="pl-5 pr-5 min-height" @scroll="handleScroll">
    <div class="columns-container">
      <div v-for="(column, index) in columns" :key="index" class="column">
        <div v-for="post in column" :key="post.id" class="post-container" @click="openPostDetails(post)">
          <PostWidget
            :post="post"
          />
        </div>
      </div>
    </div>

    <PostDetailWidget
      v-if="selectedPost"
      :post="selectedPost"
      @close="closePostDetails"
    />

    <div v-if="loading" class="loading-indicator">Загрузка...</div>
  </div>
</template>

<script>
import PostWidget from '@/components/PostWidget.vue';
import PostDetailWidget from '@/components/PostDetailWidget.vue';
import AppHeader from '@/components/AppHeader.vue';
import Cookies from 'js-cookie';

export default {
  components: {
    PostWidget,
    PostDetailWidget,
    AppHeader,
  },
  data() {
    return {
      posts: [],
      selectedPost: null,
      watched: 0,
      loading: false,
      allPostsLoaded: false,
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
    }
  },
  async created() {
    this.watched = 0;
    Cookies.set('watched', this.watched, {
      sameSite: 'None',
      secure: true,
      domain: '.aether-net.ru',
    });

    this.calculateNumberOfColumns();
    await this.fetchPosts();
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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
    async fetchPosts() {
      if (this.loading || this.allPostsLoaded) return;

      this.loading = true;

      try {
        const response = await fetch(`https://api.aether-net.ru/api/get/trends/20`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const newPosts = await response.json();
          if (newPosts && Array.isArray(newPosts)) {
            if (newPosts.length === 0) {
              this.allPostsLoaded = true;
            } else {
              const uniquePosts = newPosts.filter(newPost =>
                !this.posts.some(existingPost => existingPost.id === newPost.id)
              );

              if (uniquePosts.length === 0) {
                this.allPostsLoaded = true;
              } else {
                this.posts = [...this.posts, ...uniquePosts];
                this.watched += 20;
                Cookies.set('watched', this.watched, {
                  sameSite: 'None',
                  secure: true,
                  domain: '.aether-net.ru',
                });
              }
            }
          }
        } else {
          console.error('Ошибка при выполнении запроса');
          alert('Не удалось загрузить посты. Попробуйте позже.');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке постов. Попробуйте еще раз.');
      } finally {
        this.loading = false;
      }
    },
    openPostDetails(post) {
      this.selectedPost = post;
    },
    closePostDetails() {
      this.selectedPost = null;
    },
    handleScroll() {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight * 0.9) {
        this.fetchPosts();
      }
    }
  }
};
</script>

<style scoped>
.pl-5 {
  padding-left: 1.25rem;
}

.pr-5 {
  padding-right: 1.25rem;
}

.bg-blue-50 {
  background-color: #ebf8ff;
}

.min-height {
  min-height: 100vh;
  justify-content: center;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
  color: #555;
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
</style>
