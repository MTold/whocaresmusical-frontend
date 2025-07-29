<template>
  <div class="chat-dialog-overlay" @click="closeDialog">
    <div class="chat-dialog" @click.stop>
      <!-- Dialog header -->
      <div class="chat-header">
        <h3>智能助手</h3>
        <button class="close-btn" @click="closeDialog">×</button>
      </div>
      
      <!-- Messages container -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="message.role"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
        
        <!-- Thinking indicator -->
        <div v-if="loading" class="message assistant">
          <div class="message-content thinking">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
      
      <!-- Recommendation engine -->
      <RecommendationEngine ref="recommendationEngine" />
      
      <!-- Input area -->
      <div class="input-area">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="请输入您的问题..."
          @keyup.enter="sendMessage"
          :disabled="loading"
        />
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!inputMessage.trim() || loading"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import RecommendationEngine from './RecommendationEngine.vue'
import type { Message } from '@/types/ai-assistant'

interface Props {
  messages: Message[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'send-message', content: string): void
  (e: 'close'): void
}>()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const recommendationEngine = ref<InstanceType<typeof RecommendationEngine> | null>(null)

// Send message
const sendMessage = () => {
  if (inputMessage.value.trim() && !props.loading) {
    emit('send-message', inputMessage.value.trim())
    inputMessage.value = ''
  }
}

// Close dialog
const closeDialog = () => {
  emit('close')
}

// Format time for display
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Auto-scroll to bottom when new messages arrive
watch(() => props.messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

// Scroll to bottom on initial load
watch(() => props.loading, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})

// Expose recommendation engine methods to parent
defineExpose({
  refreshRecommendations: (query: string) => {
    if (recommendationEngine.value) {
      recommendationEngine.value.refreshRecommendations(query)
    }
  },
  getRelatedMusicals: (musicalId: number) => {
    if (recommendationEngine.value) {
      recommendationEngine.value.getRelatedMusicals(musicalId)
    }
  }
})
</script>

<style scoped>
.chat-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  z-index: 9999;
}

.chat-dialog {
  width: 350px;
  max-width: 90vw;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 10000;
  pointer-events: auto;
}

.chat-header {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
}

.messages-container {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100px;
  /* 移除max-height限制，让内容自然流动 */
}

.message {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background-color: #f1f3f4;
  color: #333;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.thinking {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #999;
  border-radius: 50%;
  animation: bounce 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

.input-area {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
}

.input-area input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-area input:focus {
  border-color: #007bff;
}

.input-area input:disabled {
  background-color: #f8f9fa;
}

.send-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-dialog {
    width: 95vw;
    max-height: 85vh;
    bottom: 20px;
    right: 2.5vw;
    left: 2.5vw;
  }
  
  .messages-container {
    padding: 8px;
  }
  
  .message {
    max-width: 85%;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .input-area {
    padding: 12px;
  }
  
  .input-area input {
    font-size: 13px;
  }
  
  .send-btn {
    font-size: 13px;
    padding: 8px 16px;
  }
}
</style>