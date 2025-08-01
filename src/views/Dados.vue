<template>
<div class="tudo" >
    <div class="dados-container">
        <input type="file" ref="fileInput" accept="image/*" style="display:none" @change="onFileChange" />
        <img :src="userImageUrl" alt="" class="foto-usuario" @click="triggerFileInput" title="Clique para alterar a foto" />
        <div v-if="carregando" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Carregando dados...</p>
        </div>
        <div v-else-if="erro" class="erro">{{ erro }}</div>
            <div class="informacoes" ref="informacoesRef">
                <div class="info-item">
                    <img src="/src/components/img/editando.png" alt="editar" class="edit-icon" @click="editarNome" />
                    <template v-if="editandoNome">
                        <input v-model="novoNome" ref="nomeInputRef" type="text" class="info-input" autofocus />
                    </template>
                    <template v-else>
                        <p class="info-label"><strong>Nome:</strong> {{ usuario.name }}</p>
                    </template>
                </div>
                <div class="info-item">
                    <img src="/src/components/img/editando.png" alt="editar" class="edit-icon" @click="editarEmail" />
                    <template v-if="editandoEmail">
                        <input v-model="novoEmail" ref="emailInputRef" type="email" class="info-input" autofocus />
                    </template>
                    <template v-else>
                        <p class="info-label"><strong>Email:</strong> {{ usuario.email }}</p>
                    </template>
                </div>
                <div class="info-item">
                    <img src="/src/components/img/editando.png" alt="editar" style="opacity: 0;" class="edit-icon" @click="editarSenha" />
                    <template v-if="editandoSenha">
                        <input v-model="novaSenha" ref="senhaInputRef" @blur="salvarSenha" @keyup.enter="salvarSenha" type="password" class="info-input" placeholder="Nova senha" autofocus />
                    </template>
                    <template v-else>
                        <p class="info-label"><strong>Senha:</strong> ********</p>
                    </template>
                </div>
                <div class="botoes-container">
                    <button v-if="editandoNome || editandoEmail" class="confirmar-btn" @click="confirmarEdicao">Confirmar alterações</button>
                    <button v-if="editandoNome || editandoEmail" class="cancelar-btn" @click="cancelarEdicao">Cancelar</button>
                </div>
            </div>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import api, { getUsuario } from '../services/api'

const usuario = ref({})
const carregando = ref(true)
const erro = ref('')
const fileInput = ref(null)
const Inputfile = ref(null)
const wallpaperStyle = ref({})

const BASE_IMAGE_URL = 'http://35.196.79.227:8000'

const userImageUrl = computed(() => {
    if (!usuario.value.image_path) return '/placeholder-image.jpg'
    return BASE_IMAGE_URL + usuario.value.image_path
})

const editandoNome = ref(false)
const editandoEmail = ref(false)
const editandoSenha = ref(false)
const novoNome = ref('')
const novoEmail = ref('')
const novaSenha = ref('')

const nomeInputRef = ref(null)
const emailInputRef = ref(null)
const senhaInputRef = ref(null)

function useClickOutside(targetRef, callback) {
    function handler(event) {
        if (targetRef.value && !targetRef.value.contains(event.target)) {
            callback()
        }
    }
    onMounted(() => {
        document.addEventListener('mousedown', handler)
    })
    onBeforeUnmount(() => {
        document.removeEventListener('mousedown', handler)
    })
}

useClickOutside(senhaInputRef, () => { if (editandoSenha.value) editandoSenha.value = false })

const informacoesRef = ref(null)

function cancelarEdicao() {
    if (editandoNome.value) {
        novoNome.value = usuario.value.name
        editandoNome.value = false
    }
    if (editandoEmail.value) {
        novoEmail.value = usuario.value.email
        editandoEmail.value = false
    }
}

function useClickOutsideDiv(targetRef, callback) {
    function handler(event) {
        if (targetRef.value && !targetRef.value.contains(event.target)) {
            callback()
        }
    }
    onMounted(() => {
        document.addEventListener('mousedown', handler)
    })
    onBeforeUnmount(() => {
        document.removeEventListener('mousedown', handler)
    })
}

useClickOutsideDiv(informacoesRef, cancelarEdicao)

onMounted(async () => {
    await carregarUsuario()
    const savedWallpaper = localStorage.getItem('wallpaperBg')
    if (savedWallpaper) {
        wallpaperStyle.value = {
            backgroundImage: `url('${savedWallpaper}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }
    }
})

async function carregarUsuario() {
    try {
        usuario.value = await getUsuario()
        novoNome.value = usuario.value.name
        novoEmail.value = usuario.value.email
        novaSenha.value = ''
    } catch (e) {
        erro.value = 'Erro ao carregar dados do usuário.'
    } finally {
        carregando.value = false
    }
}

function triggerFileInput() {
    if (fileInput.value) fileInput.value.click()
}

async function onFileChange(event) {
    const file = event.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
        const response = await api.put('/users/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        usuario.value = response.data
    } catch (e) {
        erro.value = 'Erro ao atualizar imagem de perfil.'
    }
}

function editarNome() {
    editandoNome.value = true
}

function editarEmail() {
    editandoEmail.value = true
}

function editarSenha() {
    editandoSenha.value = true
    novaSenha.value = ''
}

async function confirmarEdicao() {
    let alterou = false
    try {
        if (editandoNome.value && novoNome.value && novoNome.value !== usuario.value.name) {
            alterou = true
        }
        if (editandoEmail.value && novoEmail.value && novoEmail.value !== usuario.value.email) {
            alterou = true
        }
        if (alterou) {
            const response = await api.put('/users/me', { name: novoNome.value, email: novoEmail.value })
            usuario.value = response.data
        }
        editandoNome.value = false
        editandoEmail.value = false
    } catch (e) {
        erro.value = 'Erro ao atualizar dados.'
    }
}

</script>

<style scoped>

.tudo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f8f9fa;
    padding: 20px;
    box-sizing: border-box;
    min-height: 100%;
}

.dados-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 450px;
    width: 100%;
    background: #fff;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    position: relative;
}

/* ===== FOTO DO USUÁRIO ===== */
.foto-usuario {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 4px solid #e1e5e9;
    cursor: pointer;
    transition: all 0.3s ease;
    object-fit: cover;
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    margin-bottom: 30px;
}

.foto-usuario:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    border-color: #4CAF50;
}

/* ===== ESTADOS DE CARREGAMENTO ===== */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.carregando {
    color: #666;
    font-size: 1.1rem;
    text-align: center;
    padding: 40px 20px;
    font-weight: 500;
}

.erro {
    color: #dc3545;
    text-align: center;
    margin: 20px 0;
    background: #f8d7da;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #f5c6cb;
    font-weight: 500;
}

/* ===== INFORMAÇÕES ===== */
.informacoes {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.botoes-container {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8f9fa;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e9ecef;
    transition: 0.3s;
}

.info-item:hover {
    background: #f1f3f4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

.info-label {
    margin: 0;
    color: #333;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.info-label strong {
    color: #1a1a1a;
    font-weight: 600;
}

.edit-icon {
    width: 20px;
    height: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.7;
    flex-shrink: 0;
}

.edit-icon:hover {
    opacity: 1;
    transform: scale(1.1);
}

/* ===== INPUTS ===== */
.info-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    background: #fff;
    font-size: 1rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
    min-width: 0;
}

.info-input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

/* ===== BOTÕES ===== */
.confirmar-btn {
    padding: 12px 24px;
    background: #4CAF50;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    width: 100%;
    display: block;
}

.confirmar-btn:hover {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.cancelar-btn {
    padding: 12px 24px;
    background: #6c757d;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
    width: 100%;
    display: block;
}

.cancelar-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
}

/* ===== RESPONSIVIDADE ===== */

/* Tablets */
@media (max-width: 768px) {
    .tudo {
        padding: 16px;
    }
    
    .dados-container {
        padding: 30px 24px;
        max-width: 400px;
    }
    
    .foto-usuario {
        width: 160px;
        height: 160px;
        margin-bottom: 25px;
    }
    
    .info-item {
        padding: 14px 16px;
        gap: 10px;
    }
    
    .info-label {
        font-size: 1rem;
    }
    
    .info-input {
        padding: 10px 14px;
        font-size: 0.95rem;
    }
    
    .confirmar-btn,
    .cancelar-btn {
        padding: 10px 20px;
        font-size: 0.95rem;
    }
}

/* Mobile */
@media (max-width: 480px) {
    .tudo {
        padding: 12px;
    }
    
    .dados-container {
        padding: 24px 20px;
        max-width: 100%;
        border-radius: 12px;
    }
    
    .foto-usuario {
        width: 140px;
        height: 140px;
        margin-bottom: 20px;
    }
    
    .informacoes {
        gap: 12px;
    }
    
    .info-item {
        padding: 12px 14px;
        gap: 8px;
        flex-direction: column;
        align-items: flex-start;
    }
    
    .info-label {
        font-size: 0.9rem;
        width: 100%;
    }
    
    .info-input {
        width: 100%;
        padding: 8px 12px;
        font-size: 0.9rem;
    }
    
    .edit-icon {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 18px;
        height: 18px;
    }
    
    .botoes-container {
        margin-top: 16px;
        gap: 6px;
    }
    
    .confirmar-btn,
    .cancelar-btn {
        padding: 10px 18px;
        font-size: 0.9rem;
    }
}

/* Telas muito pequenas */
@media (max-width: 360px) {
    .dados-container {
        padding: 20px 16px;
    }
    
    .foto-usuario {
        width: 120px;
        height: 120px;
        margin-bottom: 16px;
    }
    
    .info-item {
        padding: 10px 12px;
    }
    
    .info-label {
        font-size: 0.85rem;
    }
    
    .info-input {
        padding: 6px 10px;
        font-size: 0.85rem;
    }
    
    .confirmar-btn,
    .cancelar-btn {
        padding: 8px 16px;
        font-size: 0.85rem;
    }
}

/* Telas grandes */
@media (min-width: 1200px) {
    .dados-container {
        max-width: 500px;
        padding: 50px;
    }
    
    .foto-usuario {
        width: 240px;
        height: 240px;
        margin-bottom: 40px;
    }
    
    .info-item {
        padding: 20px 24px;
        gap: 16px;
    }
    
    .info-label {
        font-size: 1.2rem;
    }
    
    .info-input {
        padding: 14px 18px;
        font-size: 1.1rem;
    }
    
    .confirmar-btn,
    .cancelar-btn {
        padding: 14px 28px;
        font-size: 1.1rem;
    }
}

/* Telas muito grandes */
@media (min-width: 1600px) {
    .dados-container {
        max-width: 550px;
        padding: 60px;
    }
    
    .foto-usuario {
        width: 280px;
        height: 280px;
        margin-bottom: 50px;
    }
    
    .info-item {
        padding: 24px 28px;
        gap: 20px;
    }
    
    .info-label {
        font-size: 1.3rem;
    }
    
    .info-input {
        padding: 16px 20px;
        font-size: 1.2rem;
    }
    
    .confirmar-btn,
    .cancelar-btn {
        padding: 16px 32px;
        font-size: 1.2rem;
    }
}

/* Orientação landscape em mobile */
@media (max-width: 768px) and (orientation: landscape) {
    .tudo {
        padding: 10px;
    }
    
    .dados-container {
        padding: 20px;
        max-width: 90%;
    }
    
    .foto-usuario {
        width: 120px;
        height: 120px;
        margin-bottom: 20px;
    }
    
    .informacoes {
        gap: 10px;
    }
    
    .info-item {
        padding: 10px 14px;
    }
}
</style>