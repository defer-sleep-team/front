<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <h1 class="text-2xl font-bold mb-4">Создать пост</h1>
      <form @submit.prevent="createPost">
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700">Описание:</label>
          <textarea v-model="post.description" id="description" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"></textarea>
        </div>
        <div class="mb-4">
          <label for="isPrivate" class="inline-flex items-center">
            <input type="checkbox" v-model="post.isPrivate" id="isPrivate" class="form-checkbox h-4 w-4 text-blue-600" />
            <span class="ml-2 text-sm text-gray-700">Приватный</span>
          </label>
        </div>
        <div class="mb-4">
          <label for="isNSFW" class="inline-flex items-center">
            <input type="checkbox" v-model="post.isNSFW" id="isNSFW" class="form-checkbox h-4 w-4 text-blue-600" />
            <span class="ml-2 text-sm text-gray-700">NSFW</span>
          </label>
        </div>
        <div class="mb-4">
          <label for="tags" class="block text-sm font-medium text-gray-700">Теги (через запятую):</label>
          <input type="text" v-model="tags" id="tags" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
        </div>
        <div class="mb-4">
          <label for="images" class="block text-sm font-medium text-gray-700">Изображения:</label>
          <div 
            class="mt-1 border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="openFileDialog"
          >
            <p class="text-gray-500">Перетащите изображения сюда или нажмите для выбора файлов</p>
            <input type="file" ref="fileInput" @change="handleFileUpload" multiple class="hidden" accept="image/*" />
          </div>
          <p class="mt-2 text-sm text-gray-500">Максимум 10 изображений.</p>
          <div class="mt-2 overflow-y-auto max-h-32"> <!-- Добавлен класс для прокрутки -->
            <div v-for="(image, index) in images" :key="index" class="relative inline-block mr-2">
              <img :src="createObjectURL(image)" class="max-h-12" /> <!-- Установлен максимальный размер изображения -->
              <button @click="removeImage(index)" class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">×</button>
            </div>
          </div>
        </div>
        <button type="submit" :disabled="isSubmitting" class="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700">
  Создать пост
</button>
      </form>
      <div v-if="message" class="mt-4 text-sm" :class="{'text-green-600': !error, 'text-red-600': error}">
        {{ message }}
      </div>
      <button @click="close" class="mt-4 text-blue-600 hover:underline">Закрыть</button>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      post: {
        description: '',
        isPrivate: false,
        isNSFW: false,
      },
      tags: '',
      images: [],
      message: '',
      error: false,
      isSubmitting: false, 
    };
  },
  methods: {
  openFileDialog() {
    this.$refs.fileInput.click();
  },
  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    this.addImages(files);
  },
  handleDrop(event) {
    const files = Array.from(event.dataTransfer.files);
    this.addImages(files);
  },
  addImages(files) {
    const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validFormats.includes(file.type));

    if (invalidFiles.length > 0) {
      this.message = 'Пожалуйста, выберите файлы в формате JPG, JPEG, PNG, GIF или WEBP.';
      this.error = true;
      return;
    }

    if (this.images.length + files.length > 10) {
      this.message = 'Вы можете загрузить максимум 10 изображений.';
      this.error = true;
      return;
    }

    this.images.push(...files.slice(0, 10 - this.images.length)); // Ограничиваем до 10
    this.message = '';
    this.error = false;
  },
  createObjectURL(image) {
    return URL.createObjectURL(image); // Используем URL.createObjectURL
  },
  removeImage(index) {
    this.images.splice(index, 1); // Удаляем изображение по индексу
  },
  async createPost() {
  // Проверка на наличие хотя бы одного изображения
  if (this.images.length === 0) {
    this.message = 'Пожалуйста, выберите хотя бы одно изображение.';
    this.error = true;
    return; // Прекращаем выполнение метода, если нет изображений
  }

  const formData = new FormData();
  formData.append('postData', JSON.stringify({
    description: this.post.description,
    isPrivate: this.post.isPrivate,
    isNSFW: this.post.isNSFW,
    tags: this.tags.split(',').map(tag => tag.trim()), // Преобразуем строку тегов в массив
  }));
  this.images.forEach((image) => {
    formData.append('images', image);
  });

  this.isSubmitting = true; // Устанавливаем состояние отправки в true

  try {
    const response = await fetch('https://api.aether-net.ru/api/create/post', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (response.ok) {
      this.message = 'Пост успешно создан!';
      this.error = false;
      this.resetForm();
    } else {
      // Обработка различных кодов состояния
      if (response.status === 413) {
        this.message = 'Ошибка: файл слишком большой. Пожалуйста, выберите меньший файл.';
      } else if (response.status === 400) {
        this.message = 'Ошибка: неправильный формат файла. Пожалуйста, проверьте загружаемые файлы.';
      } else {
        const errorText = await response.text(); // Получаем текст ответа
        console.error('Ошибка сервера:', errorText); // Выводим текст в консоль
        try {
          const errorData = JSON.parse(errorText); // Попробуем распарсить как JSON
          this.message = errorData.message || 'Ошибка при создании поста';
        } catch (e) {
          this.message = 'Ошибка при создании поста: Неверный формат ответа';
        }
      }
      this.error = true;
    }
  } catch (error) {
    console.error('Ошибка:', error);
    this.message = 'Ошибка при выполнении запроса';
    this.error = true;
  } finally {
    this.isSubmitting = false; // Устанавливаем состояние отправки в false после завершения
  }
},

  resetForm() {
    this.post.description = '';
    this.post.isPrivate = false;
    this.post.isNSFW = false;
    this.tags = '';
    this.images = [];
    location.reload(); 
  },
  close() {
    this.resetForm(); // Сбрасываем форму при закрытии
    this.$emit('close'); // Излучаем событие закрытия
  }
}

}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Затемняем фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Убедитесь, что модальное окно поверх остальных элементов */
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px; /* Максимальная ширина модального окна */
}

.border-dashed {
  border-style: dashed; /* Дашированный стиль границы */
}

.hover\:bg-gray-100:hover {
  background-color: #f7fafc; /* Цвет фона при наведении */
}

.relative {
  position: relative; /* Для позиционирования кнопки удаления */
}

.absolute {
  position: absolute; /* Для кнопки удаления */
}

.overflow-y-auto {
  overflow-y: auto; /* Включаем вертикальную прокрутку */
}

.max-h-32 {
  max-height: 8rem; /* Максимальная высота для контейнера изображений */
}

.max-h-12 {
  max-height: 3em; /* Максимальная высота для изображений */
}
</style>
