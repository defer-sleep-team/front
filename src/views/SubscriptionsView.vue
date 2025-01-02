<template>
  <div style="height: 100vh; width: 100vw;">
  <AppHeader />
  <div style="display: flex; flex-direction: column; height: 100%; width:100%;">
    
    <div class="subscriptions-container">
      <h1 class="text-2xl font-bold mb-4 ml-2">Мои подписки</h1>
      <div v-if="subscriptions.length === 0" class="no-subs">
        <p>У вас нет подписок.</p>
      </div>
      <div v-for="subscription in subscriptions" :key="subscription.followee_id" class="subscription-item">
        <img v-if="subscription.avatar" :src="subscription.avatar" alt="Avatar" class="subscription-avatar" />
        <div class="subscription-info">
          <a :href="`https://aether-net.ru/profile/${subscription.followee_id}`" class="subscription-name" target="_blank" rel="noopener noreferrer">
            {{ subscription.username || 'Имя не указано' }}
          </a>
        </div>
        <button @click="unsubscribe(subscription.followee_id)" class="unsubscribe-button">Отписаться</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue';

export default {
  components: {
    AppHeader,
  },
  data() {
    return {
      subscriptions: [],
    };
  },
  async created() {
    await this.fetchSubscriptions();
  },
  methods: {
    async fetchSubscriptions() {
      try {
        const response = await fetch('https://api.aether-net.ru/api/get/subscriptions', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const subscriptions = await response.json();
          await Promise.all(subscriptions.map(sub => this.fetchUserInfo(sub.followee_id)));
        } else {
          console.error('Ошибка при загрузке подписок');
        }
      } catch (error) {
        console.error('Ошибка:', error);
      }
    },
    async fetchUserInfo(followeeId) {
      try {
        const response = await fetch(`https://api.aether-net.ru/api/get/user/${followeeId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userInfo = await response.json();
          this.subscriptions.push({
            followee_id: followeeId,
            username: userInfo.username,
            avatar: userInfo.avatar,
          });
        } else {
          console.error(`Ошибка при загрузке информации о пользователе с ID ${followeeId}`);
        }
      } catch (error) {
        console.error('Ошибка:', error);
      }
    },
    async unsubscribe(followeeId) {
      try {
        const response = await fetch(`https://api.aether-net.ru/api/put/unsubscribe/${followeeId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          this.subscriptions = this.subscriptions.filter(sub => sub.followee_id !== followeeId);
        } else {
          alert('Ошибка при отписке');
        }
      } catch (error) {
        console.error('Ошибка:', error);
      }
    },
  },
};
</script>

<style scoped>

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.subscriptions-container {
  padding: 0px, 2vw, 0px, 2vw;
}

.subscription-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1%;
  border-bottom: 1px solid #e0e0e0;
}

.subscription-avatar {
  width: 8rem; /* Установите нужный размер аватара */
  height: 8rem;
  border-radius: 50%;
  flex: grow;
  object-fit: cover;
}

.subscription-info {
  flex-grow: 1;
  margin-left: 10px;
}
.subscription-name {
  font-size: 1.8rem;
  font-family: 'Exo 2', sans-serif; 
  font-weight: bold;
}

.unsubscribe-button {
  background-color: #f44336;
  color: white;
  border: none;
  height: 70%;
  font-size: 1.7rem;
  width: auto;
  padding: 1% 2%;
  border-radius: 5%;
  cursor: pointer;
}

.unsubscribe-button:hover {
  background-color: #d32f2f;
}

.no-subs {
  text-align: center;
  margin-top: 20px;
  font-family: 'Exo 2', sans-serif; 
}

</style>