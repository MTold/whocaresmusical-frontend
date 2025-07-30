<template>
  <div class="ai-assistant-container">
    <!-- Floating Assistant Avatar -->
    <AssistantAvatar 
      :theme="theme"
      :character="character"
      :position="position"
      @click="toggleChat"
      @mousedown="startDrag"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    />
    
    <!-- Chat Dialog -->
    <ChatDialog 
      v-if="showChat"
      ref="chatDialog"
      :messages="messages"
      :loading="isThinking"
      @send-message="handleUserMessage"
      @close="toggleChat"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import AssistantAvatar from './AssistantAvatar.vue'
import ChatDialog from './ChatDialog.vue'
import { aiAssistantApi } from '@/api/ai-assistant'
import type { Message, ThemeConfig, UserBehaviorData } from '@/types/ai-assistant'

// Props for customization
interface Props {
  theme?: ThemeConfig
  character?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: () => ({
    primaryColor: '#FF6B35',
    secondaryColor: '#4ECDC4',
    size: 'medium',
    shape: 'circle',
    animation: 'bounce'
  }),
  character: 'robot'
})

// Reactive state
const showChat = ref(false)
const isThinking = ref(false)
// 调整初始位置，确保在右下角
const position = reactive({ 
  x: Math.min(window.innerWidth - 100, window.innerWidth - 80), 
  y: Math.min(window.innerHeight - 100, window.innerHeight - 80)
})
const dragState = reactive({ isDragging: false, offsetX: 0, offsetY: 0 })
const userData = ref<UserBehaviorData | null>(null)
const chatDialog = ref<InstanceType<typeof ChatDialog> | null>(null)

// Chat messages
const messages = ref<Message[]>([
  {
    id: '1',
    role: 'assistant',
    content: '您好！我是您的智能助手，可以根据您的喜好推荐音乐剧。有什么我可以帮您的吗？',
    timestamp: new Date()
  }
])

// Mouse following effect
let followTimer: number | null = null

// 初始化为null，用户数据将在需要时加载
onMounted(() => {
  userData.value = null
})

// 加载用户数据
const loadUserData = async () => {
  try {
    console.log('正在加载用户数据...')
    userData.value = await aiAssistantApi.getUserBehaviorData()
    console.log('用户数据加载完成:', userData.value)
  } catch (error) {
    console.error('加载用户数据失败:', error)
    userData.value = null
  }
}

// Toggle chat dialog
const toggleChat = () => {
  showChat.value = !showChat.value
  if (showChat.value) {
    // Add welcome message if chat is opened and no messages exist
    if (messages.value.length === 0) {
      messages.value.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: '您好！我是您的智能助手，可以根据您的喜好推荐音乐剧。有什么我可以帮您的吗？',
        timestamp: new Date()
      })
    }
  }
}

// Start dragging the assistant
const startDrag = (e: MouseEvent) => {
  dragState.isDragging = true
  dragState.offsetX = e.clientX - position.x
  dragState.offsetY = e.clientY - position.y
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

// Handle dragging movement
const handleDrag = (e: MouseEvent) => {
  if (!dragState.isDragging) return
  
  position.x = e.clientX - dragState.offsetX
  position.y = e.clientY - dragState.offsetY
  
  // Keep within viewport bounds
  position.x = Math.max(20, Math.min(window.innerWidth - 80, position.x))
  position.y = Math.max(20, Math.min(window.innerHeight - 80, position.y))
}

// Stop dragging
const stopDrag = () => {
  dragState.isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Handle mouse enter (for follow effect)
const handleMouseEnter = () => {
  if (dragState.isDragging) return
  
  // Start following mouse after a delay
  followTimer = window.setTimeout(() => {
    document.addEventListener('mousemove', handleMouseMove)
  }, 300)
}

// Handle mouse leave
const handleMouseLeave = () => {
  if (followTimer) {
    clearTimeout(followTimer)
    followTimer = null
  }
  document.removeEventListener('mousemove', handleMouseMove)
}

// Mouse following logic
const handleMouseMove = (e: MouseEvent) => {
  if (dragState.isDragging) return
  
  // Calculate distance between mouse and assistant
  const distance = Math.sqrt(
    Math.pow(e.clientX - position.x, 2) + 
    Math.pow(e.clientY - position.y, 2)
  )
  
  // Subtle follow effect when mouse is close
  if (distance < 150) {
    const followStrength = 0.03 * (1 - distance / 150)
    position.x += (e.clientX - position.x) * followStrength
    position.y += (e.clientY - position.y) * followStrength
    
    // Keep within bounds
    position.x = Math.max(20, Math.min(window.innerWidth - 80, position.x))
    position.y = Math.max(20, Math.min(window.innerHeight - 80, position.y))
  }
}

// Handle user message
const handleUserMessage = async (content: string) => {
  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  
  // Show thinking indicator
  isThinking.value = true
  
  try {
    // Check if the message is related to musical recommendations
    const isRecommendationQuery = isMusicalRecommendationQuery(content)
    const isSpecificQuery = isSpecificMusicalQuery(content)
    
    let responseContent: string
    
    // 对于推荐查询，无论是否登录都使用热门推荐
    if (isRecommendationQuery) {
      responseContent = await getPersonalizedRecommendation(content)
      
      // Refresh recommendations in the recommendation engine
      if (chatDialog.value) {
        chatDialog.value.refreshRecommendations(content)
      }
    } else if (isSpecificQuery) {
      // For specific musical queries, get related musicals
      responseContent = await getRelatedMusicals(content)
    } else {
      // For general queries, call external AI service
      responseContent = await callExternalAIService(content)
    }
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date()
    }
    messages.value.push(assistantMessage)
  } catch (error: any) {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: error.message || '抱歉，我遇到了一些问题。请稍后再试。',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
  } finally {
    isThinking.value = false
  }
}

// Check if the user query is related to musical recommendations
const isMusicalRecommendationQuery = (query: string): boolean => {
 const recommendationKeywords = ['推荐', '剧目', '音乐剧', '评分', '评价', '好看', '经典', '热门', '想看', '有什么', '适合', '类似', '相关', '相似']
 const lowerQuery = query.toLowerCase()
 
 // 排除通用问候语
 const greetingKeywords = ['你好', '您好', 'hello', 'hi', 'hey', '在吗', '有人吗']
 if (greetingKeywords.some(keyword => lowerQuery.includes(keyword)) && lowerQuery.length <= 10) {
   return false
 }
 
 return recommendationKeywords.some(keyword => lowerQuery.includes(keyword))
}

// Check if the user query is asking about a specific musical
const isSpecificMusicalQuery = (query: string): boolean => {
  const specificKeywords = ['类似', '相关', '相似', '和', '一样', '像']
  const lowerQuery = query.toLowerCase()
  return specificKeywords.some(keyword => lowerQuery.includes(keyword))
}

// Get personalized recommendation based on user data
const getPersonalizedRecommendation = async (userQuery: string): Promise<string> => {
  try {
    // 先加载用户数据
    await loadUserData()
    
    // 获取推荐列表
    const recommendations = await aiAssistantApi.getPersonalizedRecommendations()
    
    // 检查是否有用户数据
    const hasUserData = userData.value && 
        (userData.value.browsingHistory.length > 0 || 
         userData.value.favorites.length > 0 || 
         userData.value.reviews.length > 0)
    
    if (!hasUserData) {
      // 未登录或无用户数据，返回热门推荐
      if (recommendations.length > 0) {
        const recList = recommendations.slice(0, 3).map((rec: any) => rec.name).join('、')
        return `为您推荐近期热门的音乐剧：${recList}。这些剧目在观众中评价很高，值得一看！`
      }
      return '抱歉，暂时没有合适的剧目推荐。'
    } else {
      // 已登录且有用户数据，返回个性化推荐
      const favoritesList = userData.value?.favorites?.map(f => f.musicalName || f.name || '未知剧目').slice(0, 3).join('、') || ''
      const historyList = userData.value?.browsingHistory?.map(h => h.musicalName || h.name || '未知剧目').slice(0, 3).join('、') || ''
      
      if (recommendations.length > 0) {
        const recList = recommendations.slice(0, 3).map(rec => rec.name).join('、')
        
        let personalizedMessage = `根据您的`
        const parts: string[] = []
        
        if (userData.value?.favorites?.length && userData.value.favorites.length > 0) {
          parts.push(`收藏（${favoritesList}）`)
        }
        if (userData.value?.browsingHistory?.length && userData.value.browsingHistory.length > 0) {
          parts.push(`浏览历史（${historyList}）`)
        }
        if (userData.value?.reviews?.length && userData.value.reviews.length > 0) {
          const reviewMusicals = userData.value.reviews.map(r => r.musicalName || '剧目').slice(0, 2).join('、')
          parts.push(`对${reviewMusicals}等${userData.value.reviews.length}部剧目的评价`)
        }
        
        if (parts.length === 0) {
          personalizedMessage = `根据您的使用习惯，`
        } else {
          personalizedMessage += parts.join('、')
        }
        
        personalizedMessage += `，我为您推荐：${recList}。`
        
        return personalizedMessage
      } else {
        return '抱歉，暂时没有合适的剧目推荐。您可以告诉我您感兴趣的剧目类型，我会为您提供更精准的推荐。'
      }
    }
  } catch (error) {
    console.error('Failed to get personalized recommendations:', error)
    // 出错时返回通用推荐
    return '为您推荐一些经典音乐剧：《汉密尔顿》、《歌剧魅影》和《狮子王》。这些剧目在观众中广受好评！'
  }
}

// Get related musicals based on a specific query
const getRelatedMusicals = async (userQuery: string): Promise<string> => {
  try {
    // In a real implementation, you would extract the musical ID from the query
    // For now, we'll use a placeholder
    const musicalId = 1 // Placeholder ID
    
    const recommendations = await aiAssistantApi.getRelatedMusicals(musicalId)
    
    if (recommendations.length > 0) {
      const recList = recommendations.slice(0, 3).map(rec => rec.name).join('、')
      return `与该剧目相似的推荐：${recList}。这些剧目在玩家中评分很高，风格相似。`
    } else {
      return '暂时没有找到相关的剧目推荐。'
    }
  } catch (error) {
    console.error('Failed to get related musicals:', error)
    return '抱歉，获取相关剧目推荐时遇到了问题。您可以稍后再试。'
  }
}

// Call external AI service for general queries
const callExternalAIService = async (userQuery: string): Promise<string> => {
  try {
    // 对于一般查询，始终使用Moonshot API，不需要用户数据
    return await aiAssistantApi.sendMessageToAI(userQuery, null)
  } catch (error) {
    console.error('Failed to call external AI service:', error)
    // Fallback to local response generation
    return getAssistantResponse(userQuery)
  }
}

// Generate assistant response based on user input (fallback)
const getAssistantResponse = (userInput: string): string => {
  const lowerInput = userInput.toLowerCase()
  
  if (lowerInput.includes('推荐') || lowerInput.includes('看') || lowerInput.includes('剧')) {
    return '根据您的浏览历史和收藏，我推荐您观看《汉密尔顿》和《歌剧魅影》。这两部剧目在玩家中评分很高，与您之前观看的剧目风格相似。'
  } else if (lowerInput.includes('你好') || lowerInput.includes('hello')) {
    return '您好！我是您的智能助手。我可以根据您的喜好推荐音乐剧，您想了解什么类型的剧目呢？'
  } else {
    return '我是您的智能助手，专门为您推荐音乐剧。您可以问我关于剧目推荐的问题，比如"推荐一些好看的音乐剧"或者"我想看爱情题材的剧目"。'
  }
}

// Cleanup event listeners
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  if (followTimer) {
    clearTimeout(followTimer)
  }
})
</script>

<style scoped>
.ai-assistant-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 9998;
  pointer-events: auto;
}
</style>