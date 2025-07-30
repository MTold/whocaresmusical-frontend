import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { AuthResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const username = ref<string | null>(localStorage.getItem('username'))
  const isAdmin = ref<boolean>(localStorage.getItem('isAdmin') === 'true')

  const isLoggedIn = computed(() => !!token.value)

  const login = async (usernameInput: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.login({
        username: usernameInput,
        password
      })
      
      token.value = response.token
      username.value = response.username
      isAdmin.value = response.isAdmin || false
      
      // ÝX0localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('username', response.username)
      localStorage.setItem('isAdmin', String(response.isAdmin || false))
      
      // ¾naxiosØ¤header
      authApi.setAuthToken(response.token)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '{U1%' 
      }
    }
  }

  const register = async (username: string, password: string, email: string, isAdminUser: boolean = false) => {
    try {
      const response: AuthResponse = await authApi.register({
        username,
        password,
        email,
        isAdmin: isAdminUser
      })
      
      token.value = response.token
      username.value = response.username
      isAdmin.value = response.isAdmin || false
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('username', response.username)
      localStorage.setItem('isAdmin', String(response.isAdmin || false))
      
      authApi.setAuthToken(response.token)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'èŒ1%' 
      }
    }
  }

  const logout = () => {
    token.value = null
    username.value = null
    isAdmin.value = false
    
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('isAdmin')
    
    authApi.removeAuthToken()
  }

  const initializeAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUsername = localStorage.getItem('username')
    const savedIsAdmin = localStorage.getItem('isAdmin')
    
    if (savedToken) {
      token.value = savedToken
      username.value = savedUsername
      isAdmin.value = savedIsAdmin === 'true'
      authApi.setAuthToken(savedToken)
    }
  }

  return {
    token,
    username,
    isAdmin,
    isLoggedIn,
    login,
    register,
    logout,
    initializeAuth
  }
})