<template>
  <div class="post-widget">
    <img :src="post.image_urls[0]" alt="Post Image" class="post-image" />
    <div class="post-info">
      <h2 class="post-description">{{ post.description }}</h2>
      <div v-if="post.tags && post.tags.length>0 && post.tags[0]" class="post-tags">
        <span v-for="(tag, index) in post.tags.slice(0, 2)" :key="index" class="post-tag">
          {{ tag }}
        </span>
      </div>
      <p class="post-date">{{ new Date(post.reg_date).toLocaleDateString() }}</p>
      <p class="post-stats">
        <strong>Лайки:</strong> {{ post.likes }} |
        <strong>Просмотры:</strong> {{ post.views }}
      </p>
      <p class="post-author">
        <strong>Автор:</strong> <router-link :to="`/profile/${post.user_id}`">{{ post.username }}</router-link>
      </p>
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
  }
};
</script>

<style scoped>
.post-widget {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.post-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.post-description {
  font-size: 1.2em;
  font-weight: bold;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-info {
  padding: 16px;
  flex-grow: 1;
}

.post-tags {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}

.post-tag {
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.9em;
  color: #333;
}

.post-date,
.post-stats,
.post-author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-date {
  color: gray;
  font-size: 0.9em;
}

.post-stats {
  font-size: 0.9em;
  margin: 8px 0;
}

.post-author {
  font-size: 0.9em;
  color: blue;
}
</style>
