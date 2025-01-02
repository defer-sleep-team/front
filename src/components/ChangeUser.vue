<template>
    <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
        <h2 class="text-2xl font-semibold mb-4">Изменить профиль</h2>
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700">Имя пользователя:</label>
            <input type="text" v-model="localUser.username" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
          </div>
          <div class="mb-4">
            <label for="bio" class="block text-sm font-medium text-gray-700">Биография:</label>
            <textarea v-model="localUser.bio" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"></textarea>
          </div>
          <div class="mb-4">
            <label for="avatar" class="block text-sm font-medium text-gray-700">Аватар:</label>
            <div 
              class="mt-1 border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition"
              @dragover.prevent
              @drop.prevent="handleDrop('avatar', $event)"
              @click="openFileDialog('avatar')"
            >
              <p class="text-gray-500">Перетащите изображение сюда или нажмите для выбора файла</p>
              <input type="file" ref="avatarInput" @change="onFileChange('avatar', $event)" class="hidden" accept="image/*" />
            </div>
            <div v-if="avatarFile" class="mt-2">
              <img :src="createObjectURL(avatarFile)" class="max-h-12" />
              <button @click="removeImage('avatar')" class="bg-red-500 text-white rounded-full p-1">×</button>
            </div>
          </div>
          <div class="mb-4">
            <label for="background" class="block text-sm font-medium text-gray-700">Обложка:</label>
            <div 
              class="mt-1 border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition"
              @dragover.prevent
              @drop.prevent="handleDrop('background', $event)"
              @click="openFileDialog('background')"
            >
              <p class="text-gray-500">Перетащите изображение сюда или нажмите для выбора файла</p>
              <input type="file" ref="backgroundInput" @change="onFileChange('background', $event)" class="hidden" accept="image/*" />
            </div>
            <div v-if="backgroundFile" class="mt-2">
              <img :src="createObjectURL(backgroundFile)" class="max-h-12" />
              <button @click="removeImage('background')" class="bg-red-500 text-white rounded-full p-1">×</button>
            </div>
          </div>
          <div class="flex justify-between">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Сохранить изменения</button>
            <button type="button" @click="$emit('close')" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">Закрыть</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      user: Object,
    },
    data() {
      return {
        localUser: { ...this.user }, // Создаем локальную копию объекта пользователя
        avatarFile: null,
        backgroundFile: null,
      };
    },
    methods: {
      openFileDialog(type) {
        this.$refs[`${type}Input`].click();
      },
      handleDrop(type, event) {
        const file = event.dataTransfer.files[0];
        if (file) {
          this.onFileChange(type, { target: { files: [file] } });
        }
      },
      onFileChange(type, event) {
      const file = event.target.files[0];
      if (file) {
        console.log(`Файл ${type} загружен:`, file.name);
        if (type === 'avatar') {
          this.avatarFile = file;
        } else if (type === 'background') {
          this.backgroundFile = file;
        }
      } else {
        console.log(`Файл ${type} не выбран.`);
      }
    },
    createObjectURL(file) {
      return URL.createObjectURL(file); // Создаем URL для отображения изображения
    },
    removeImage(type) {
      if (type === 'avatar') {
        this.avatarFile = null; // Удаляем аватар
      } else if (type === 'background') {
        this.backgroundFile = null; // Удаляем обложку
      }
    },
    async submitForm() {
      const formData = new FormData();
      
      // Используем старые значения, если новые пустые
      formData.append('username', this.localUser.username || this.user.username);
      formData.append('bio', this.localUser.bio || this.user.bio);
      
      if (this.avatarFile) {
        formData.append('avatar', this.avatarFile);
      }
      if (this.backgroundFile) {
        formData.append('background', this.backgroundFile);
      }

      console.log('Отправка данных формы:', {
        username: this.localUser.username,
        bio: this.localUser.bio,
        avatarFile: this.avatarFile ? this.avatarFile.name : null,
        backgroundFile: this.backgroundFile ? this.backgroundFile.name : null,
      });

      try {
        const response = await fetch("https://api.aether-net.ru/api/put/changeuser", {
          method: 'PUT',
          body: formData,
          credentials: 'include',
        });

        if (response.ok) {
          alert('Профиль успешно обновлен');
          this.$emit('close'); // Закрываем модальное окно
          this.$emit('profile-updated'); // Уведомляем родительский компонент о обновлении профиля
        } else {
          console.error('Ошибка при обновлении профиля:', response.statusText);
          alert('Ошибка при обновлении профиля');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при выполнении запроса');
      }
    }
  }
};
</script>

<style scoped>
/* Стили для модального окна можно добавить здесь, если нужно */
</style>

  