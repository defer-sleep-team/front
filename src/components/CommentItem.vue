<template>
  <div class="comment">
    <div class="flex items-center justify-between">
      <p style="font-family: 'Exo 2'; white-space: pre-wrap;">
        <strong>
          <a :href="`/profile/${comment.user_id}`" class="text-blue-500 hover:underline">
            {{ comment.username }}
          </a>:
        </strong> 
        {{ comment.content }}
      </p>
      <button v-if="canDelete" @click="deleteComment" class="delete-button">
        &times; 
      </button>
    </div>
    <p class="text-gray-500 text-sm">{{ formatDate(comment.reg_date) }}</p>
  </div>
</template>

  
  <script>
  export default {
    props: {
      comment: {
        type: Object,
        required: true
      },
      currentUserId: {
        type: Number,
        required: true
      }
    },
    computed: {
      canDelete() {
        return this.comment.user_id == this.currentUserId;
      }
    },
    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString();
      },
      deleteComment() {
        this.$emit('delete-comment', this.comment.id); // Эмитируем событие для удаления комментария
      }
    }
  };
  </script>
  
  <style scoped>
  .comment {
    background-color: #fefffe;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
  }
  
  a {
    color: #3b82f6; /* Цвет ссылки */
    text-decoration: none; /* Убираем подчеркивание */
  }
  
  a:hover {
    text-decoration: underline; /* Подчеркивание при наведении */
  }
  
  .delete-button {
    background: none;
    border: none;
    color: red;
    cursor: pointer;
    font-size: 1.2em; /* Размер крестика */
  }
  </style>
  