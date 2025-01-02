<template>
    <div class="edit-post-widget fixed inset-0 flex items-center justify-center z-50">
      <div class="modal-overlay" @click="close"></div>
      <div class="modal-container bg-white w-11/12 md:max-w-lg mx-auto rounded shadow-lg overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
          <h2 class="text-2xl font-semibold">Редактировать пост</h2>
          <label for="description" class="block mt-4">Новое описание:</label>
          <textarea id="description" v-model="updatedPost.description" class="w-full border rounded p-2"></textarea>
  
          <div class="flex items-center mt-4">
            <input type="checkbox" v-model="updatedPost.is_private" id="is_private" />
            <label for="is_private" class="ml-2">Сделать приватным</label>
          </div>
  
          <div class="flex items-center mt-2">
            <input type="checkbox" v-model="updatedPost.is_nsfw" id="is_nsfw" />
            <label for="is_nsfw" class="ml-2">Сделать NSFW</label>
          </div>
  
          <div class="flex justify-end mt-4">
            <button @click="saveChanges" class="bg-blue-500 text-white py-2 px-4 rounded">Сохранить</button>
            <button @click="deletePost" class="bg-red-600 text-white py-2 px-4 rounded ml-2">Удалить пост</button>
            <button @click="close" class="bg-gray-300 text-black py-2 px-4 rounded ml-2">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
export default {
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      updatedPost: { ...this.post } // Создаем локальную копию поста для редактирования
    };
  },
  methods: {
  close() {
    this.$emit('close'); // Закрываем виджет редактирования
  },
  saveChanges() {
    const endpoint = `/api/update/post/${this.updatedPost.id}`;
    fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.updatedPost),
      credentials: 'include' // Добавлено для передачи куков
    })
    .then(response => {
      if (response.ok) {
        this.$emit('update', this.updatedPost); // Отправляем обновленный пост родительскому компоненту
        this.close(); // Закрываем виджет
      } else {
        alert('Ошибка при обновлении поста');
      }
    })
    .catch(error => {
      console.error('Ошибка при обновлении поста:', error);
    });
  },
  deletePost() {
  const confirmation = confirm('Вы уверены, что хотите удалить этот пост?'); // Запрос подтверждения
  if (confirmation) {
    const endpoint = `https://api.aether-net.ru/api/delete/post/${this.updatedPost.id}`;
    fetch(endpoint, {
      method: 'DELETE',
      credentials: 'include' // Добавлено для передачи куков
    })
    .then(response => {
      if (response.ok) {
        this.$emit('delete'); // Уведомляем родительский компонент о том, что пост был удален
        this.close(); // Закрываем виджет
        location.reload(); // Обновляем страницу после удаления
      } else {
        console.error('Ошибка при удалении поста');
      }
    })
    .catch(error => {
      console.error('Ошибка сети:', error);
    });
  }
  }}};
</script>

<style scoped>
.edit-post-widget {
  background: rgba(0, 0, 0, 0.5); /* Полупрозрачный фон для модального окна */
}

.modal-overlay {
  position: fixed; /* Фиксированное позиционирование для наложения */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Полупрозрачный черный фон */
}

.modal-container {
  position: relative; /* Относительное позиционирование для контейнера модального окна */
  max-width: 800px; /* Увеличенная максимальная ширина модального окна */
  margin: auto; /* Центрирование модального окна */
  background: white; /* Белый фон модального окна */
  border-radius: 8px; /* Закругление углов модального окна */
  overflow: hidden; /* Скрытие переполнения */
}

.modal-content {
  padding: 20px; /* Внутренние отступы для содержимого модального окна */
}

textarea {
  resize: vertical; /* Позволяет изменять размер текстового поля только по вертикали */
  min-height: 100px; /* Минимальная высота текстового поля */
}

button {
  transition: background-color 0.3s, color 0.3s; /* Плавный переход для кнопок */
}

button:hover {
  background-color: rgba(0, 0, 255, 0.2); /* Светло-синий фон при наведении на кнопки */
}
</style>
