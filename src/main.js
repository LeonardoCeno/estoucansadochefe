import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { useUserStore } from './stores/user'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

// Função para inicializar o estado do usuário
async function initializeUserState() {
  try {
    const userStore = useUserStore()
    await userStore.initializeAuth()
  } catch (error) {
    console.error('Erro ao inicializar autenticação:', error)
  }
}

// Inicializar e montar o app
initializeUserState().then(() => {
  app.mount('#app')
})
