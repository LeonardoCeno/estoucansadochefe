import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUsuario, verifyToken, renewToken } from '../services/api'
import api from '../services/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // Função simples para carregar dados do usuário
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

  // Função para verificar e renovar token se necessário
  async function checkAndRenewToken() {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
      const result = await verifyToken()
      
      if (result.valid) {
        // Token válido, configurar headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        return true
      } else {
        // Token inválido, tentar renovar
        try {
          await renewToken()
          return true
        } catch (renewError) {
          // Falha na renovação, fazer logout
          logout()
          return false
        }
      }
    } catch (error) {
      logout()
      return false
    }
  }

  // Função para inicializar autenticação (usada no carregamento da página)
  async function initializeAuth() {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const isValid = await checkAndRenewToken()
      if (isValid && !isAuthenticated.value) {
        await loadUser()
      }
    } catch (error) {
      logout()
    }
  }

  // Logout simples
  function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    
    // Notificar outros componentes
    window.dispatchEvent(new Event('user-logout'))
  }

  // Definir usuário diretamente (usado no login)
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
    setUser,
    initializeAuth,
    checkAndRenewToken
  }
}) 