<template>
    <div class="login-bg">
      <div class="imagem" >
        <img src="../components/img/fundodologin.jpeg" alt="">
      </div>
        <div class="login-card">
          <router-link to="/">
            <button class="voltar-button">VOLTAR</button>
          </router-link>
            <div class="logo-container">
                <router-link to="/">
                <img :src="logo" alt="Logo" class="login-logo" />
                </router-link>
            </div>
        <h2 v-if="!showRegister">Bem-vindo ao Manya!</h2>
        <h2 v-else>Crie sua conta</h2>
        <form v-if="!showRegister" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" v-model="email" required placeholder="Digite seu e-mail" />
        </div>
        <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" v-model="password" required placeholder="Digite sua senha" />
        </div>
        <button type="submit" :disabled="loading">Entrar</button>
        <p v-if="error" class="error">{{ error }}</p>
        <p class="toggle-form">Não tem conta? <a href="#" @click.prevent="showRegister = true">Criar conta</a></p>
        </form>
        <form v-else @submit.prevent="handleRegister" class="login-form">
            <div class="form-group">
                <label for="name">Nome</label>
                <input type="text" id="name" v-model="registerName" required placeholder="Seu nome completo" />
            </div>
            <div class="form-group">
                <label for="registerEmail">E-mail</label>
                <input type="email" id="registerEmail" v-model="registerEmail" required placeholder="Digite seu e-mail" />
            </div>
            <div class="form-group">
                <label for="registerPassword">Senha</label>
                <input type="password" id="registerPassword" v-model="registerPassword" required placeholder="Crie uma senha" />
            </div>
            <button type="submit" :disabled="loading">Cadastrar</button>
            <p v-if="registerError" class="error">{{ registerError }}</p>
            <p v-if="registerSuccess" class="success">{{ registerSuccess }}</p>
            <p class="toggle-form">Já tem conta? <a href="#" @click.prevent="showRegister = false">Entrar</a></p>
        </form>
        </div>
    </div>
</template>

<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useUserStore } from '../stores/user'
import logoImg from '../components/img/agrsimtabao-Photoroom.png'
import { login, register } from '../services/api'

const logo = logoImg
const toast = useToast()
const userStore = useUserStore()
const showRegister = ref(false)

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerError = ref('')
const registerSuccess = ref('')

const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const { user } = await login(email.value, password.value)
    userStore.setUser(user)
    toast.success('Login realizado com sucesso!')
    router.push('/')
  } catch (err) {
    toast.error(err.response?.data?.detail || 'Erro ao fazer login.')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  registerError.value = ''
  registerSuccess.value = ''
  loading.value = true
  try {
    await register(registerName.value, registerEmail.value, registerPassword.value)
    toast.success('Cadastro realizado com sucesso! Faça login.')
    registerName.value = ''
    registerEmail.value = ''
    registerPassword.value = ''
    showRegister.value = false
  } catch (err) {
    toast.error(err.response?.data?.detail || 'Erro ao cadastrar.')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>

.voltar-button {
  position: absolute;
  width: auto;
  top: 10px;
  left: 10px;
  background-color: #fff;
  border: none;
}

.imagem {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  width: 50%;
  height: 90vh;
  border-radius: 10px 0 0 10px;
}

.imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px 0 0 10px;
}

.login-bg {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #06080a50 0%, #14323b59 60%, #4e46e563 100%);
}

.login-card {
  background: #fff;
  border-radius: 0 10px 10px 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 24px 20px 20px 20px;
  width: 40%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-right: 50px;
  position: relative;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
  border-radius: 12px;
  width: 100%;
  position: relative;
  left: -2.5px;
}

.login-logo {
  width: 160px;
  height: auto;
  transition: transform 0.3s ease;
}

.login-logo:hover {
  transform: scale(1.05);
}

h2 {
  color: #06080a;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(135deg, #14323b 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-form {
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #14323b;
  font-size: 0.85rem;
  margin: 0;
  letter-spacing: 0.5px;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

input:focus {
  border-color: #4f46e5;
  outline: none;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
  transform: translateY(-1px);
}

input::placeholder {
  color: #94a3b8;
  font-size: 13px;
}

button {
  width: 100%;
  padding: 10px 12px;
  background: linear-gradient(135deg, #14323b 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79,70,229,0.2);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

button:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(79,70,229,0.3);
}

button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.toggle-form {
  position: relative;
  bottom: 10px;
  width: 100%;
  margin-bottom: 16px;
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.toggle-form a {
  color: #4f46e5;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.3s ease;
  border-bottom: 1px solid transparent;
}

.toggle-form a:hover {
  color: #14323b;
  border-bottom-color: #14323b;
}

.error {
  color: #ef4444;
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

.success {
  color: #22c55e;
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  background: #f0fdf4;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #22c55e;
}

/* ===== RESPONSIVIDADE SIMPLES ===== */

/* Tablet e Mobile (768px e abaixo) */
@media (max-width: 768px) {
  .login-bg {
    flex-direction: column;
    padding: 15px;
  }
  
  .imagem {
    display: none;
  }
  
  .login-card {
    width: 100%;
    max-width: 450px;
    height: auto;
    min-height: 80vh;
    margin-right: 0;
    border-radius: 10px;
    padding: 20px 16px;
    gap: 16px;
  }
  
  .login-logo {
    width: 120px;
  }
  
  h2 {
    font-size: 1.4rem;
  }
  
  .login-form {
    max-width: 100%;
  }
  
  .voltar-button {
    top: 8px;
    left: 8px;
    padding: 6px 10px;
    font-size: 11px;
  }
}

/* Mobile (600px e abaixo) */
@media (max-width: 600px) {
  .login-card {
    width: 100%;
    max-width: 400px;
    height: auto;
    min-height: 80vh;
    margin-right: 0;
    border-radius: 10px;
    padding: 20px 16px;
    gap: 16px;
  }
  
  .login-logo {
    width: 100px;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  .form-group {
    gap: 6px;
  }
  
  input {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  button {
    padding: 12px 14px;
    font-size: 13px;
  }
}

/* Mobile Pequeno (480px e abaixo) */
@media (max-width: 480px) {
  .login-bg {
    padding: 10px;
  }
  
  .login-card {
    padding: 16px 12px;
    gap: 12px;
    max-width: 350px;
  }
  
  .login-logo {
    width: 90px;
  }
  
  h2 {
    font-size: 1.2rem;
  }
  
  input {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  button {
    padding: 10px 12px;
    font-size: 12px;
  }
  
  .toggle-form {
    font-size: 13px;
  }
  
  .error,
  .success {
    font-size: 13px;
    padding: 6px 10px;
  }
  
  .voltar-button {
    top: 5px;
    left: 5px;
    padding: 5px 8px;
    font-size: 10px;
  }
}
</style>

