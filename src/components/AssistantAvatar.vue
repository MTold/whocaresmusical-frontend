<template>
  <div 
    class="assistant-avatar"
    :class="[theme.size, theme.shape, { 'is-dragging': isDragging }]"
    :style="avatarStyle"
    @click="$emit('click', $event)"
    @mousedown="$emit('mousedown', $event)"
    @mouseenter="$emit('mouseenter', $event)"
    @mouseleave="$emit('mouseleave', $event)"
  >
    <div class="avatar-content">
      <!-- Robot character -->
      <svg v-if="character === 'robot'" class="character-svg" viewBox="0 0 100 100">
        <rect x="20" y="20" width="60" height="60" rx="10" fill="white" :stroke="theme.primaryColor" stroke-width="2"/>
        <circle cx="40" cy="40" r="5" :fill="theme.primaryColor"/>
        <circle cx="60" cy="40" r="5" :fill="theme.primaryColor"/>
        <rect x="35" y="60" width="30" height="5" rx="2" :fill="theme.primaryColor"/>
        <rect x="15" y="30" width="10" height="5" rx="2" :fill="theme.primaryColor"/>
        <rect x="75" y="30" width="10" height="5" rx="2" :fill="theme.primaryColor"/>
      </svg>
      
      <!-- Cat character -->
      <svg v-else-if="character === 'cat'" class="character-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="white" :stroke="theme.primaryColor" stroke-width="2"/>
        <circle cx="40" cy="45" r="5" :fill="theme.primaryColor"/>
        <circle cx="60" cy="45" r="5" :fill="theme.primaryColor"/>
        <path d="M45 60 Q50 65 55 60" :stroke="theme.primaryColor" stroke-width="2" fill="none"/>
        <path d="M30 35 L20 25" :stroke="theme.primaryColor" stroke-width="2" fill="none"/>
        <path d="M70 35 L80 25" :stroke="theme.primaryColor" stroke-width="2" fill="none"/>
      </svg>
      
      <!-- Default character -->
      <svg v-else class="character-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="40" r="25" fill="white" :stroke="theme.primaryColor" stroke-width="2"/>
        <circle cx="40" cy="35" r="5" :fill="theme.primaryColor"/>
        <circle cx="60" cy="35" r="5" :fill="theme.primaryColor"/>
        <path d="M45 50 Q50 55 55 50" :stroke="theme.primaryColor" stroke-width="2" fill="none"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ThemeConfig } from '@/types/ai-assistant'

interface Props {
  theme: ThemeConfig
  character: string
  position: { x: number; y: number }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'mousedown', event: MouseEvent): void
  (e: 'mouseenter', event: MouseEvent): void
  (e: 'mouseleave', event: MouseEvent): void
}>()

const isDragging = ref(false)

// Compute avatar styles based on theme and position
const avatarStyle = computed(() => {
  return {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
    backgroundColor: props.theme.primaryColor,
    borderColor: props.theme.secondaryColor,
    animation: props.theme.animation === 'bounce' ? 'bounce 2s infinite' : 
               props.theme.animation === 'pulse' ? 'pulse 2s infinite' : 'none'
  }
})
</script>

<style scoped>
.assistant-avatar {
  position: fixed;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10001;
}

.assistant-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.assistant-avatar.is-dragging {
  transform: scale(1.05);
  cursor: grabbing;
}

/* Size variants */
.small {
  width: 50px;
  height: 50px;
}

.medium {
  width: 60px;
  height: 60px;
}

.large {
  width: 70px;
  height: 70px;
}

/* Shape variants */
.circle {
  border-radius: 50%;
}

.square {
  border-radius: 4px;
}

.rounded {
  border-radius: 16px;
}

.avatar-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-svg {
  width: 70%;
  height: 70%;
}

/* Animations */
@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.05); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>