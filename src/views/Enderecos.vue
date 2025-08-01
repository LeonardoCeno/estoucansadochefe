<template>
    <div class="tudo">
        <div class="conteudo">
            <div class="barra-do-titulo">
                <div class="titulo">
                    <h1>Meus Endereços</h1>
                    <p class="subtitulo">Gerencie seus endereços de entrega</p>
                </div>
                <button class="btn-novo-endereco" @click="mostrarModal = true">
                    <span>+</span>
                    Novo Endereço
                </button>
            </div>

            <!-- Modal de novo endereço -->
            <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
                <div class="modal-form">
                    <div class="modal-header">
                        <h2>Novo Endereço</h2>
                        <button class="btn-fechar" @click="mostrarModal = false">&times;</button>
                    </div>
                    <form class="form-endereco" @submit.prevent="adicionarEndereco">
                        <div class="campos-form">
                            <div class="campo">
                                <label for="rua">Rua *</label>
                                <input v-model="novoEndereco.street" type="text" id="rua" placeholder="Nome da rua" required />
                            </div>
                            <div class="campo">
                                <label for="numero">Número *</label>
                                <input v-model="novoEndereco.number" type="number" id="numero" placeholder="123" required />
                            </div>
                            <div class="campo">
                                <label for="cep">CEP *</label>
                                <input v-model="novoEndereco.zip" type="text" id="cep" placeholder="00000-000" required />
                            </div>
                            <div class="campo">
                                <label for="cidade">Cidade *</label>
                                <input v-model="novoEndereco.city" type="text" id="cidade" placeholder="Nome da cidade" required />
                            </div>
                            <div class="campo">
                                <label for="estado">Estado *</label>
                                <input v-model="novoEndereco.state" type="text" id="estado" placeholder="Seu Estado" required />
                            </div>
                            <div class="campo">
                                <label for="pais">País *</label>
                                <input v-model="novoEndereco.country" type="text" id="pais" placeholder="Brasil" required />
                            </div>
                        </div>
                        <div class="botoes-modal">
                            <button type="submit" class="btn-salvar">Salvar Endereço</button>
                            <button type="button" class="btn-cancelar" @click="mostrarModal = false">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal de edição de endereço -->
            <div v-if="modalEditar" class="modal-overlay" @click.self="fecharModalEditar">
                <div class="modal-form">
                    <div class="modal-header">
                        <h2>Editar Endereço</h2>
                        <button class="btn-fechar" @click="fecharModalEditar">&times;</button>
                    </div>
                    <form class="form-endereco" @submit.prevent="salvarEdicaoEndereco">
                        <div class="campos-form">
                            <div class="campo">
                                <label for="rua-edit">Rua *</label>
                                <input v-model="enderecoEditando.street" type="text" id="rua-edit" placeholder="Nome da rua" required />
                            </div>
                            <div class="campo">
                                <label for="numero-edit">Número *</label>
                                <input v-model="enderecoEditando.number" type="number" id="numero-edit" placeholder="123" required />
                            </div>
                            <div class="campo">
                                <label for="cep-edit">CEP *</label>
                                <input v-model="enderecoEditando.zip" type="text" id="cep-edit" placeholder="00000-000" required />
                            </div>
                            <div class="campo">
                                <label for="cidade-edit">Cidade *</label>
                                <input v-model="enderecoEditando.city" type="text" id="cidade-edit" placeholder="Nome da cidade" required />
                            </div>
                            <div class="campo">
                                <label for="estado-edit">Estado *</label>
                                <input v-model="enderecoEditando.state" type="text" id="estado-edit" placeholder="Seu Estado" required />
                            </div>
                            <div class="campo">
                                <label for="pais-edit">País *</label>
                                <input v-model="enderecoEditando.country" type="text" id="pais-edit" placeholder="Brasil" required />
                            </div>
                        </div>
                        <div class="botoes-modal">
                            <button type="submit" class="btn-salvar">Salvar Alterações</button>
                            <button type="button" class="btn-cancelar" @click="fecharModalEditar">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="enderecos-lista">
                <div v-if="carregando" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Carregando endereços...</p>
                </div>
                <div v-else-if="erro" class="erro">{{ erro }}</div>
                <div v-else>
                    <div v-if="enderecos.length === 0" class="nenhum-endereco">
                        <div class="icone-vazio">📍</div>
                        <h3>Nenhum endereço cadastrado</h3>
                        <p>Adicione seu primeiro endereço para receber suas compras</p>
                    </div>
                    <div v-else class="enderecos-grid">
                        <div v-for="endereco in enderecos" :key="endereco.id" class="endereco-card">
                            <div class="endereco-content">
                                <div class="endereco-principal">
                                    <h3>{{ endereco.street }}, {{ endereco.number }}</h3>
                                    <p>{{ endereco.city }} - {{ endereco.state }}</p>
                                    <span class="cep">{{ endereco.zip }}</span>
                                </div>
                                <div class="endereco-acoes">
                                    <button class="btn-edit" @click="abrirModalEditar(endereco)">Editar</button>
                                    <button class="btn-delete" @click="excluirEndereco(endereco.id)">Excluir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { getEnderecos, criarEndereco, atualizarEndereco, deletarEndereco } from '../services/api'

const enderecos = ref([])
const carregando = ref(true)
const erro = ref(null)
const toast = useToast()
const mostrarModal = ref(false)
const modalEditar = ref(false)
const enderecoEditando = ref({})

const novoEndereco = ref({
    street: '',
    number: '',
    zip: '',
    city: '',
    state: '',
    country: ''
})

async function carregarEnderecos() {
    carregando.value = true
    erro.value = null
    try {
        enderecos.value = await getEnderecos()
    } catch (e) {
        erro.value = 'Erro ao carregar endereços.'
    } finally {
        carregando.value = false
    }
}

async function adicionarEndereco() {
    try {
        await criarEndereco(novoEndereco.value)
        await carregarEnderecos()
        novoEndereco.value = { street: '', number: '', zip: '', city: '', state: '', country: '' }
        mostrarModal.value = false
    } catch (e) {
        erro.value = 'Erro ao adicionar endereço.'
    }
}

function abrirModalEditar(endereco) {
    enderecoEditando.value = { ...endereco }
    modalEditar.value = true
}

function fecharModalEditar() {
    modalEditar.value = false
    enderecoEditando.value = {}
}

async function salvarEdicaoEndereco() {
    try {
        await atualizarEndereco(enderecoEditando.value.id, enderecoEditando.value)
        await carregarEnderecos()
        fecharModalEditar()
    } catch (e) {
        erro.value = 'Erro ao editar endereço.'
    }
}

async function excluirEndereco(id) {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
        try {
            await deletarEndereco(id)
            toast.success('Endereço excluído com sucesso!')
            await carregarEnderecos()
        } catch (e) {
            toast.error('Erro ao excluir endereço.')
        }
    }
}

onMounted(carregarEnderecos)
</script>

<style scoped>
.tudo {
    width: 100%;
    height: 100%;
    background-color: #f8f9fa;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
    min-width: 0;
}

.conteudo {
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    overflow-x: hidden;
}

.barra-do-titulo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    padding: 32px;
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.titulo h1 {
    margin: 0 0 8px 0;
    color: #1a1a1a;
    font-size: 1.8rem;
    font-weight: 700;
}

.subtitulo {
    margin: 0;
    color: #666;
    font-size: 1rem;
}

.btn-novo-endereco {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #1565C0;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-novo-endereco:hover {
    background-color: #0D47A1;
    transform: translateY(-1px);
}

.btn-novo-endereco span {
    font-size: 1.2rem;
    font-weight: bold;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-form {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    padding: 0;
    min-width: 400px;
    max-width: 500px;
    width: 100%;
    overflow: hidden;
    border: 2px solid #02060af5;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 1.5rem;
    font-weight: 700;
}

.btn-fechar {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.btn-fechar:hover {
    background: #e9ecef;
    color: #333;
}

.form-endereco {
    padding: 32px;
}

.campos-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
}

.campo {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.campo label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.campo input {
    padding: 14px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    background: #fff;
    transition: all 0.2s;
}

.campo input:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.botoes-modal {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn-salvar {
    background-color: #1565C0;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-salvar:hover {
    background-color: #0D47A1;
}

.btn-cancelar {
    background-color: #6c757d;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancelar:hover {
    background-color: #5a6268;
}

/* Lista de Endereços */
.enderecos-lista {
    width: 100%;
}

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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px;
    color: #666;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #030a11f5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.erro {
    background: #fee;
    color: #c53030;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #feb2b2;
    text-align: center;
    margin: 20px 0;
}

.nenhum-endereco {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 60px 20px;
    text-align: center;
    color: #666;
}

.icone-vazio {
    font-size: 3rem;
    opacity: 0.5;
}

.nenhum-endereco h3 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
}

.nenhum-endereco p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.8;
}

.enderecos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
    margin-top: 20px;
}

.endereco-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 20px;
    border: 1px solid #e1e5e9;
}

.endereco-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
}

.endereco-principal h3 {
    margin: 0 0 8px 0;
    color: #1a1a1a;
    font-size: 1.1rem;
    font-weight: 600;
}

.endereco-principal p {
    margin: 0 0 4px 0;
    color: #666;
    font-size: 0.9rem;
}

.cep {
    color: #999;
    font-size: 0.8rem;
    font-weight: 500;
}

.endereco-acoes {
    display: flex;
    gap: 8px;
}

.btn-edit, .btn-delete {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-edit {
    background-color: #6c757d;
    color: white;
}

.btn-edit:hover {
    background-color: #5a6268;
}

.btn-delete {
    background-color: #dc3545;
    color: white;
}

.btn-delete:hover {
    background-color: #c82333;
}

@media (max-width: 768px) {
    .tudo {
        padding: 16px;
    }
    
    .barra-do-titulo {
        flex-direction: column;
        gap: 16px;
        text-align: center;
        padding: 24px;
    }
    
    .titulo h1 {
        font-size: 1.5rem;
    }
    
    .modal-form {
        min-width: 100%;
        max-width: 100%;
        margin: 20px;
    }
    
    .form-endereco {
        padding: 24px;
    }
    
    .enderecos-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .endereco-card {
        padding: 16px;
    }
    
    .endereco-content {
        flex-direction: column;
        gap: 12px;
    }
    
    .endereco-acoes {
        justify-content: flex-end;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 12px;
    }
    
    .barra-do-titulo {
        padding: 20px;
    }
    
    .titulo h1 {
        font-size: 1.3rem;
    }
    
    .btn-novo-endereco {
        padding: 10px 20px;
        font-size: 0.9rem;
    }
    
    .form-endereco {
        padding: 20px;
    }
    
    .campo input {
        padding: 12px 14px;
        font-size: 0.95rem;
    }
    
    .endereco-card {
        padding: 12px;
    }
    
    .endereco-principal h3 {
        font-size: 1rem;
    }
    
    .endereco-principal p {
        font-size: 0.85rem;
    }
    
    .btn-edit, .btn-delete {
        padding: 4px 8px;
        font-size: 0.75rem;
    }
}
</style>