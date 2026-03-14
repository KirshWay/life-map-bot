<script setup lang="ts">
defineProps<{
  isSharing: boolean
}>()

defineEmits<{
  share: []
}>()
</script>

<template>
  <button class="share-button" :disabled="isSharing" @click="$emit('share')">
    <svg
      v-if="!isSharing"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
    <div v-else class="share-spinner" />
  </button>
</template>

<style scoped>
.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--tg-theme-hint-color, #6b7280);
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.share-button:active {
  color: var(--tg-theme-button-color, #2481cc);
}

.share-button:disabled {
  cursor: default;
  opacity: 0.6;
}

.share-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--tg-theme-hint-color, #6b7280);
  border-top-color: var(--tg-theme-button-color, #2481cc);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
