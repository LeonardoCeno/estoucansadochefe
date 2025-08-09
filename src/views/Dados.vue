<template>
<div class="dados-page">
    <div class="dados-container">
        <input type="file" ref="fileInput" accept="image/*" style="display:none" @change="onFileChange" />
        
        <!-- Header com foto -->
        <div class="header-perfil">
            <img :src="userImageUrl" alt="Foto do usuário" class="foto-usuario" @click="triggerFileInput" title="Clique para alterar a foto" />
        </div>

        <div v-if="carregando" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Carregando dados...</p>
        </div>
        
        <div v-else-if="erro" class="erro">{{ erro }}</div>
        
        <div v-else class="content-area">
            <!-- Seção de informações pessoais -->
            <div class="info-section">
                <h3 class="section-title">Informações Pessoais</h3>
                <div class="info-grid" ref="informacoesRef">
                    <div class="info-card">
                        <div class="info-header">
                            <span class="info-title">Nome</span>
                            <button class="edit-btn" @click="editarNome" title="Editar nome">
                                <img src="/src/components/img/editando.png" alt="editar" />
                            </button>
                        </div>
                        <div class="info-content">
                    <template v-if="editandoNome">
                                <input v-model="novoNome" ref="nomeInputRef" type="text" class="info-input" placeholder="Digite seu nome" autofocus />
                    </template>
                    <template v-else>
                                <span class="info-value">{{ usuario.name }}</span>
                    </template>
                </div>
                    </div>

                    <div class="info-card">
                        <div class="info-header">
                            <span class="info-title">Email</span>
                            <button class="edit-btn" @click="editarEmail" title="Editar email">
                                <img src="/src/components/img/editando.png" alt="editar" />
                            </button>
                        </div>
                        <div class="info-content">
                    <template v-if="editandoEmail">
                                <input v-model="novoEmail" ref="emailInputRef" type="email" class="info-input" placeholder="Digite seu email" autofocus />
                    </template>
                    <template v-else>
                                <span class="info-value">{{ usuario.email }}</span>
                    </template>
                        </div>
                    </div>
                </div>

                <!-- Botões de confirmação -->
                <div v-if="editandoNome || editandoEmail" class="edit-actions">
                    <button class="btn-primary" @click="confirmarEdicao">Salvar alterações</button>
                    <button class="btn-secondary" @click="cancelarEdicao">Cancelar</button>
                </div>
                </div>
                
            <!-- Seção de ações da conta -->
            <div class="actions-section">
                <h3 class="section-title">Ações da Conta</h3>
                <div class="actions-grid">
                    <button class="action-btn logout-btn" @click="fazerLogout">
                        <span>Fazer Logout</span>
                    </button>
                    <button class="action-btn delete-btn" @click="abrirModalExclusao">
                        <span>Excluir Conta</span>
                    </button>
                </div>
                </div>
            </div>
    </div>
    
    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="mostrarModalExclusao" class="modal-overlay" @click="fecharModalExclusao">
        <div class="modal-content" @click.stop>
            <h3>Confirmar Exclusão de Conta</h3>
            <p>{{ mensagemModal }}</p>
            <div class="modal-actions">
                <button @click="confirmarExclusao" class="btn-danger">Confirmar</button>
                <button @click="fecharModalExclusao" class="btn-secondary">Cancelar</button>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useUserStore } from '../stores/user'
import api, { getUsuario, excluirConta } from '../services/api'

const usuario = ref({})
const carregando = ref(true)
const erro = ref('')
const fileInput = ref(null)

const BASE_IMAGE_URL = 'http://35.196.79.227:8000'

const userImageUrl = computed(() => {
    if (!usuario.value.image_path) return '/placeholder-image.jpg'
    return BASE_IMAGE_URL + usuario.value.image_path
})

const editandoNome = ref(false)
const editandoEmail = ref(false)
const novoNome = ref('')
const novoEmail = ref('')

// Variáveis para logout e exclusão de conta
const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

// Variáveis para o modal de exclusão
const mostrarModalExclusao = ref(false)
const confirmandoExclusao = ref(false)
const mensagemModal = ref('')

// Refs para os inputs
const nomeInputRef = ref(null)
const emailInputRef = ref(null)
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
})

async function carregarUsuario() {
    try {
        usuario.value = await getUsuario()
        novoNome.value = usuario.value.name
        novoEmail.value = usuario.value.email
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

// Função para fazer logout
function fazerLogout() {
    userStore.logout()
    toast.success('Logout realizado com sucesso!')
    router.push('/')
}

// Função para abrir modal de exclusão
function abrirModalExclusao() {
    if (confirmandoExclusao.value) {
        // Segunda confirmação
        mensagemModal.value = 'ATENÇÃO: Esta ação excluirá permanentemente sua conta e todos os seus dados. Esta ação não pode ser desfeita. Tem certeza absoluta?'
    } else {
        // Primeira confirmação
        mensagemModal.value = 'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.'
    }
    mostrarModalExclusao.value = true
}

// Função para fechar modal
function fecharModalExclusao() {
    mostrarModalExclusao.value = false
    if (!confirmandoExclusao.value) {
        confirmandoExclusao.value = false
    }
}

// Função para confirmar exclusão
function confirmarExclusao() {
    if (confirmandoExclusao.value) {
        // Segunda confirmação - excluir conta
        excluirContaUsuario()
    } else {
        // Primeira confirmação - mostrar segunda confirmação
        confirmandoExclusao.value = true
        fecharModalExclusao()
        setTimeout(() => {
            abrirModalExclusao()
        }, 100)
    }
}

// Função para excluir a conta do usuário
async function excluirContaUsuario() {
    try {
        await excluirConta()
        toast.success('Conta excluída com sucesso!')
        userStore.logout()
        router.push('/')
    } catch (error) {
        toast.error('Erro ao excluir conta. Tente novamente.')
        confirmandoExclusao.value = false
        fecharModalExclusao()
    }
}

</script>

<style scoped>
/* Layout principal */
.dados-page {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 30px;
    box-sizing: border-box;
}

.dados-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
    overflow: hidden;
}

/* Header do perfil */
.header-perfil {
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    padding: 70px 40px;
    text-align: center;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
}

.foto-usuario {
    width: 240px;
    height: 240px;
    border-radius: 50%;
    border: 6px solid rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;
    object-fit: cover;
    margin: 0;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.foto-usuario:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.6);
}



/* Loading e erro */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    text-align: center;
}

.loading-container p {
    font-size: 1.2rem;
    margin: 0;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #02060af5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.erro {
    background: #f8d7da;
    color: #721c24;
    padding: 20px 40px;
    margin: 30px;
    border-radius: 10px;
    border-left: 5px solid #dc3545;
    font-weight: 500;
    font-size: 1.1rem;
}

/* Área de conteúdo */
.content-area {
    padding: 40px;
}

/* Seções */
.info-section,
.actions-section {
    margin-bottom: 50px;
}

.section-title {
    margin: 0 0 30px 0;
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    border-bottom: 3px solid #02060af5;
    padding-bottom: 12px;
}

/* Grid de informações */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.info-card {
    background: #f8f9fa;
    border-radius: 16px;
    padding: 30px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
}

.info-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.info-title {
    font-weight: 600;
    color: #495057;
    flex: 1;
    font-size: 1.3rem;
}

.edit-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.edit-btn:hover {
    background: rgba(2, 6, 10, 0.1);
}

.edit-btn img {
    width: 22px;
    height: 22px;
    opacity: 0.7;
}

.edit-btn:hover img {
    opacity: 1;
}

.info-content {
    min-height: 50px;
    display: flex;
    align-items: center;
}

.info-value {
    font-size: 1.3rem;
    color: #333;
    font-weight: 500;
}

.info-input {
    width: 100%;
    padding: 16px 20px;
    border: 2px solid #dee2e6;
    border-radius: 10px;
    font-size: 1.2rem;
    transition: border-color 0.3s ease;
    background: white;
}

.info-input:focus {
    outline: none;
    border-color: #02060af5;
    box-shadow: 0 0 0 3px rgba(2, 6, 10, 0.1);
}

/* Botões de edição */
.edit-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 25px;
    padding-top: 25px;
    border-top: 2px solid #e9ecef;
}

/* Grid de ações */
.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px 30px;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
}



.logout-btn {
    background: #6c757d;
    color: white;
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.logout-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
}

.delete-btn {
    background: #dc3545;
    color: white;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.delete-btn:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
}

/* Botões gerais */
.btn-primary {
    background: #02060af5;
    color: white;
    border: none;
    padding: 16px 30px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(2, 6, 10, 0.3);
    font-size: 1.1rem;
}

.btn-primary:hover {
    background: #02060acc;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(2, 6, 10, 0.4);
}

.btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 16px 30px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
    font-size: 1.1rem;
}

.btn-secondary:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
}

.btn-danger {
    background: #dc3545;
    color: white;
    border: none;
    padding: 16px 30px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    font-size: 1.1rem;
}

.btn-danger:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
}

.modal-content {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 100%;
    text-align: center;
    border: 3px solid #02060af5;
}

.modal-content h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.6rem;
    font-weight: 600;
}

.modal-content p {
    margin: 0 0 30px 0;
    color: #666;
    line-height: 1.6;
    font-size: 1.2rem;
}

.modal-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

/* Responsividade */
@media (max-width: 768px) {
    .dados-page {
        padding: 20px;
    }
    
    .header-perfil {
        padding: 50px 30px;
    }

    .foto-usuario {
        width: 180px;
        height: 180px;
    }

    .content-area {
        padding: 30px;
    }

    .section-title {
        font-size: 1.6rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 25px;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .info-card {
        padding: 25px;
    }

    .info-title {
        font-size: 1.2rem;
    }

    .info-value {
        font-size: 1.2rem;
    }

    .info-input {
        padding: 14px 18px;
        font-size: 1.1rem;
    }

    .edit-actions {
        flex-direction: column;
        gap: 12px;
    }

    .actions-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .action-btn {
        padding: 18px 25px;
        font-size: 1.1rem;
    }

    .btn-primary, .btn-secondary, .btn-danger {
        padding: 14px 25px;
        font-size: 1rem;
    }

    .modal-content {
        padding: 30px;
        max-width: 500px;
    }

    .modal-content h3 {
        font-size: 1.4rem;
    }

    .modal-content p {
        font-size: 1.1rem;
    }

    .modal-actions {
        flex-direction: column;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .dados-page {
        padding: 15px;
    }

    .header-perfil {
        padding: 40px 20px;
    }

    .foto-usuario {
        width: 150px;
        height: 150px;
    }
    
    .content-area {
        padding: 25px;
    }

    .section-title {
        font-size: 1.4rem;
        margin-bottom: 25px;
    }
    
        .info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .info-card {
        padding: 20px;
    }

    .info-title {
        font-size: 1.1rem;
    }

    .info-value {
        font-size: 1.1rem;
    }

    .info-input {
        padding: 12px 16px;
        font-size: 1rem;
    }

    .actions-grid {
        gap: 16px;
    }

    .action-btn {
        padding: 16px 20px;
        font-size: 1rem;
    }

    .btn-primary, .btn-secondary, .btn-danger {
        padding: 12px 20px;
        font-size: 0.95rem;
    }

    .modal-content {
        padding: 25px;
        margin: 15px;
    }

    .modal-content h3 {
        font-size: 1.3rem;
    }

    .modal-content p {
        font-size: 1rem;
    }
}
</style>