<template>
  <div class="post-detail-widget fixed inset-0 flex items-center justify-center z-50">
    <div class="modal-overlay w-full h-full" @click="close"></div>
    <div class="modal-container w-11/12 md:max-w-4xl mx-auto rounded shadow-lg overflow-y-auto flex flex-col md:flex-row">
      <div class="modal-content py-4 text-left px-6 w-full md:w-2/3">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold truncate">{{ getTruncatedDescription(localPost.description) }}</h2>
          <button @click="close" class="bg-red-600 text-white py-2 px-4 rounded">Закрыть</button>
        </div>
        <p class="description" :style="{ maxHeight: '50px', overflow: 'hidden', textOverflow: 'ellipsis' }">
          {{ localPost.description }}
        </p>
        <p><strong>ID:</strong> {{ localPost.id }}</p>
        <p><strong>NSFW:</strong> {{ localPost.is_nsfw ? 'Да' : 'Нет' }}</p>
        <p><strong>Дата регистрации:</strong> {{ new Date(localPost.reg_date).toLocaleDateString() }}</p>
        <p><strong>Лайки:</strong> {{ localPost.likes }} | <strong>Просмотры:</strong> {{ localPost.views }}</p>
        <p v-if="localPost.tags && localPost.tags.length > 0">
          <strong>Теги:</strong> {{ localPost.tags.join(', ') }}
        </p>
        <p v-else>
          <strong>Теги:</strong> Нет тегов
        </p>

        <div v-if="Array.isArray(localPost.image_urls) && localPost.image_urls.length > 0">
          <h3 class="text-xl mt-4">Изображения:</h3>
          <swiper :options="swiperOptions">
            <swiper-slide v-for="(url, index) in localPost.image_urls" :key="index">
              <img :src="url" alt="Post Image" class="compressed-image rounded-md border border-gray-300 cursor-pointer" @click="openModal(url)" />
            </swiper-slide>
            <template v-slot:pagination>
              <div class="swiper-pagination"></div>
            </template>
            <template v-slot:button-prev>
              <div class="swiper-button-prev"></div>
            </template>
            <template v-slot:button-next>
              <div class="swiper-button-next"></div>
            </template>
          </swiper>
        </div>
        <div v-else>
          <p>Нет изображений для отображения.</p>
        </div>

        <div class="user-info mt-4 flex items-center justify-between">
          <div class="flex items-center">
            <img :src="localPost.avatar" alt="Avatar" class="avatar rounded-full w-10 h-10" />
            <p class="ml-2">
              <strong>Пользователь: </strong>
              <a :href="`/profile/${localPost.user_id}`" class="text-blue-500 hover:underline">{{ localPost.username }}</a>
            </p>
          </div>
          <button
            @click="toggleLike"
            class="like-button ml-4"
            :class="localPost.is_liked ? 'liked' : 'unliked'"
          >
            <i class="fa fa-thumbs-up"></i>
          </button>
        </div>
        <button v-if="isCurrentUser" @click="editPost" class="ml-4 bg-yellow-500 text-white py-2 px-4 rounded">Редактировать пост</button>
        <button
          v-if="getUserRoleFromCookie() == '2'"
          @click="deletePost"
          class="ml-4 bg-red-600 text-white py-2 px-4 rounded"
        >
          Удалить пост
        </button>

        <EditPostWidget
          v-if="showEditPostWidget"
          :post="localPost"
          @close="showEditPostWidget = false"
          @update="updatePost"
          @delete="deletePost"
        />
      </div>

      <div class="comments-section w-full md:w-1/3 p-4 border-l border-gray-300 flex flex-col">
          <h3 class="text-xl mb-2">Комментарии</h3>
          <form @submit.prevent="addComment" class="mt-4">
            <textarea v-model="newComment" placeholder="Напишите комментарий..." class="w-full p-2 border border-gray-300 rounded" rows="3"></textarea>
            <button type="submit" class="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Добавить комментарий</button>
          </form>

<div class="comments-list mt-4 flex-1 overflow-y-auto">
  <div v-if="comments.length > 0">
    <CommentItem
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      :currentUserId="getUserIdFromCookie()"
      @delete-comment="handleDeleteComment"
    />
  </div>
  <div v-else>
    <p>Нет комментариев.</p>
  </div>
</div>
</div>
</div>

<div v-if="selectedImage" class="image-modal fixed inset-0 flex items-center justify-center z-60" @click="closeModal">
<div class="modal-overlay" @click="closeModal"></div>
<div class="modal-content bg-white rounded shadow-lg p-4" @click.stop>
<img :src="selectedImage" alt="Увеличенное изображение" class="max-w-full max-h-screen" />
<div class="flex justify-between mt-4">
  <button @click="closeModal" class="mt-4 bg-red-600 text-white py-2 px-4 rounded">Закрыть</button>
  <a :href="selectedImage" download class="mt-4 bg-green-600 text-white py-2 px-4 rounded">Скачать изображение</a>
</div>
</div>
</div>
</div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/swiper-bundle.css';
import EditPostWidget from '@/components/EditPostWidget.vue';
import CommentItem from '@/components/CommentItem.vue';

export default {
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showModal: false,
      selectedImage: null,
      localPost: { ...this.post },
      showEditPostWidget: false,
      comments: [],
      newComment: '',
      swiperOptions: {
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        loop: true
      }
    };
  },
  computed: {
    isCurrentUser() {
      const userId = this.getUserIdFromCookie();
      return userId == this.localPost.user_id;
    }
  },
  methods: {
    getTruncatedDescription(description) {
      const firstNewLineIndex = description.indexOf('\n');
      return firstNewLineIndex !== -1 ? description.substring(0, firstNewLineIndex) : description;
    },
    close() {
      this.$emit('close');
    },
    openModal(url) {
      this.selectedImage = url;
      this.showModal = true;
    },
    closeModal() {
      this.selectedImage = null;
      this.showModal = false;
    },
    toggleLike() {
      const currentLikedState = this.localPost.is_liked;
      const currentLikesCount = this.localPost.likes;

      this.localPost.is_liked = !currentLikedState;
      this.localPost.likes += this.localPost.is_liked ? 1 : -1;

      localStorage.setItem(`post_${this.localPost.id}_liked`, this.localPost.is_liked);

      const endpoint = this.localPost.is_liked
        ? `https://api.aether-net.ru/api/put/like/${this.localPost.id}`
        : `https://api.aether-net.ru/api/put/unlike/${this.localPost.id}`;

      fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      .then(response => {
        if (!response.ok) {
          this.localPost.is_liked = currentLikedState;
          this.localPost.likes = currentLikesCount;
          alert('Ошибка при изменении лайка. Попробуйте еще раз.');
        }
      })
      .catch(error => {
        this.localPost.is_liked = currentLikedState;
        this.localPost.likes = currentLikesCount;
        console.error('Ошибка при изменении лайка:', error);
      });
    },
    handleDeleteComment(commentId) {
      const commentToDelete = this.comments.find(comment => comment.id == commentId);
      this.comments = this.comments.filter(comment => comment.id !== commentId);

      const endpoint = `https://api.aether-net.ru/api/delete/comment/${commentId}`;
      fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
      })
      .then(response => {
        if (!response.ok) {
          this.comments.push(commentToDelete);
          alert('Ошибка при удалении комментария. Комментарий был удален локально, но не на сервере.');
        }
      })
      .catch(error => {
        console.error(error);
      });
    },
    incrementViewCount() {
      this.localPost.views += 1;
    },
    editPost() {
      this.showEditPostWidget = true;
    },
    updatePost(updatedPost) {
      this.localPost = updatedPost;
      this.showEditPostWidget = false;
    },
    deletePost() {
      const endpoint = `https://api.aether-net.ru/api/delete/sudo_post/${this.localPost.id}`;
      fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
      })
      .then(response => {
        if (response.ok) {
          this.close();
        } else {
          alert('Ошибка при удалении поста');
        }
      })
      .catch(error => {
        console.error('Ошибка при удалении поста:', error);
      });
    },
    getUserIdFromCookie() {
      const name = "userID=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) == 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
      return null;
    },
    getUserRoleFromCookie() {
      const name = "role=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) == 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
      return null;
    },
    loadComments() {
      const endpoint = `https://api.aether-net.ru/api/get/comments/${this.localPost.id}`;
      fetch(endpoint)
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            this.comments = data;
          } else {
            this.comments = [];
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке комментариев:', error);
          this.comments = [];
        });
    },
    addComment() {
      if (!this.newComment.trim()) {
        return;
      }

      const endpoint = `https://api.aether-net.ru/api/create/comment/${this.localPost.id}`;
      const commentData = {
        content: this.newComment,
      };

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
        credentials: 'include',
      })
      .then(response => {
        if (response.ok) {
          this.loadComments();
          this.newComment = '';
        } else {
          return response.json().then(err => {
            alert(`Ошибка при добавлении комментария: ${err.error}`);
          });
        }
      })
      .catch(error => {
        console.error('Ошибка при добавлении комментария:', error);
        alert('Произошла ошибка при добавлении комментария. Попробуйте еще раз.');
      });
    }
  },
  mounted() {
    const likedState = localStorage.getItem(`post_${this.localPost.id}_liked`);
    if (likedState !== null) {
      this.localPost.is_liked = likedState === 'true';
    }
    this.loadComments();
  },
  components: {
    EditPostWidget,
    CommentItem,
    Swiper,
    SwiperSlide
  }
};
</script>


<style scoped>
.post-detail-widget {
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.5);
}

.modal-overlay {
  position: fixed;
}

.modal-container {
  position: relative;
  max-width: 80%;
  max-height: 90%;
  margin: auto;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content {
  padding: 20px;
}

.comments-section {
  width: 98%;
  padding: 1.2em;
  margin: 1%;
  border-radius: 1%;
  height: 98vh;
  background-color: rgb(228, 233, 232);
  border-left: 1px solid #e5e7eb;
  flex: 0 0 33%;
  overflow-y: auto; /* Включите прокрутку */
}

/* Для компьютеров устанавливаем фиксированную высоту */
@media (min-width: 768px) {
  .comments-section {
    max-height: 43rem;
  }
}

.comments-list {
  flex: 1;
  overflow-y: auto;
}

.description {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  font-size: 1em;
  line-height: 1.5;
  padding-bottom: 5.6%;
}

@media (min-width: 768px) {
  .modal-container {
    flex-direction: row;
  }
}

.compressed-image {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info p {
  margin-left: 10px;
}

.like-button {
  background-color: transparent;
  border: none;
  outline: none;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.like-button i {
  font-size: 24px;
}

.like-button.liked {
  background-color: #e6f0ff;
  color: blue;
}

.like-button.unliked {
  color: gray;
}

.like-button.liked:hover {
  background-color: rgba(3, 39, 136, 0.1);
}

.like-button:hover {
  background-color: rgba(143, 159, 204, 0.1);
}

button {
  transition: background-color 0.3s, color 0.3s;
}

button:hover {
  background-color: rgba(0, 0, 255, 0.2);
}

.image-grid img {
  transition: transform 0.2s;
}

.image-grid img:hover {
  transform: scale(1.05);
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
}

.comment {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

textarea {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  resize: none;
  width: 100%;
  padding: 10px;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

button[type="submit"] {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 10px 15px;
}

button[type="submit"]:hover {
  background-color: #2563eb;
}
</style>
