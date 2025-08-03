import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUsuario, verifyToken, renewToken } from '../services/api'
import api from '../services/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  async function loadUser() {
    try {
      isLoading.value = true
      const userData = await getUsuario()
      user.value = userData
      isAuthenticated.value = true
    } catch (error) {
      logout()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Função para inicializar o estado do usuário (usada no carregamento da página)
  async function initializeAuth() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // Configurar o token no Axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Só carregar dados se não estiver autenticado
        if (!isAuthenticated.value) {
          await loadUser()
        }
      } catch (error) {
        // Se houver erro, limpar o token inválido
        logout()
        throw error
      }
    }
  }

  async function tryRenewToken() {
    try {
      const newToken = await renewToken()
      return newToken
    } catch (error) {
      logout()
      throw error
    }
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    
    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new Event('user-logout'))
  }

  function setUser(userData) {
    user.value = userData
    isAuthenticated.value = true
  }

  return { 
    user, 
    isAuthenticated, 
    isLoading, 
    loadUser, 
    logout, 
    tryRenewToken,
    setUser,
    initializeAuth
  }
}) 