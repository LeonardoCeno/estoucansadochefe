<template>
    <div class="tudo">
        <div class="pedidos-container">
            <div class="titulo-secao">
                <h2>MEUS PEDIDOS</h2>
            </div>
            <div class="soumdetalhe"></div>
            
            <div class="pedidos-content">
                <div v-if="carregando" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Carregando pedidos...</p>
                </div>

                <div v-else-if="!pedidosAtivos.length" class="estado-pedidos">
                    <div class="pedidos-vazio">
                        <img src="../components/img/listafinal.png" alt="Nenhum pedido" class="pedidos-vazio-img">
                        <h3>Você ainda não fez nenhum pedido</h3>
                        <p>Comece a comprar para ver seus pedidos aqui!</p>
                        <router-link to="/pesquisas" class="btn-comprar-agora">
                            Comprar Agora
                        </router-link>
                    </div>
                </div>

                <!-- Lista de Pedidos -->
                <div v-else class="pedidos-lista">
                    <div v-for="pedido in pedidosAtivos" :key="pedido.id" class="pedido-card">
                        <div class="pedido-header">
                            <div class="pedido-info">
                                <h4>Pedido</h4>
                                <p class="pedido-data">{{ formatarData(pedido.order_date) }}</p>
                            </div>

                        </div>

                        <div class="pedido-produtos">
                            <div v-for="produto in pedido.products" :key="produto.id" class="produto-item">
                                <div class="produto-imagem">
                                    <img :src="getImageUrl(produto.image_path)" :alt="produto.name" />
                                </div>
                                <div class="produto-info">
                                    <h5>{{ produto.name }}</h5>
                                    <p class="produto-preco">R$ {{ formatarPreco(produto.price) }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="pedido-acoes">
                            <button 
                                v-if="pedido.status === 'PENDING'"
                                @click="abrirModalCancelamento(pedido.id)" 
                                class="btn-cancelar-pedido">
                                Cancelar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Confirmação -->
        <div v-if="modalCancelamento.ativo" class="modal-overlay" @click="fecharModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Cancelar Pedido?</h3>
                </div>
                <div class="modal-body">
                    <p>Tem certeza que deseja cancelar este pedido?</p>
                    <p>Esta ação não pode ser desfeita.</p>
                </div>
                <div class="modal-footer">
                    <button @click="fecharModal" class="btn-cancelar">Cancelar</button>
                    <button 
                        @click="confirmarCancelamento" 
                        class="btn-confirmar"
                        :disabled="cancelando">
                        {{ cancelando ? 'Cancelando...' : 'Confirmar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { getPedidos, cancelarPedido } from '../services/api'

const toast = useToast()

// Estados
const carregando = ref(true)
const pedidos = ref([])
const cancelando = ref(false)

// Modal de cancelamento
const modalCancelamento = ref({
    ativo: false,
    pedidoId: null
})

const pedidosAtivos = computed(() => {
    return pedidos.value.filter(pedido => pedido.status === 'PENDING')
})

// Funções
function formatarData(data) {
    // Criar a data considerando que vem em UTC
    const dataObj = new Date(data + 'Z') // Adiciona Z para indicar UTC
    return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo' // Força o fuso horário brasileiro
    })
}

function formatarPreco(preco) {
    return parseFloat(preco).toFixed(2).replace('.', ',')
}

function getImageUrl(imagePath) {
    if (!imagePath) return '/placeholder-image.jpg'
    if (imagePath.startsWith('http')) return imagePath
    return `http://35.196.79.227:8000${imagePath}`
}



async function carregarPedidos() {
    try {
        carregando.value = true
        const dadosPedidos = await getPedidos()
        pedidos.value = dadosPedidos
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        toast.error('Erro ao carregar pedidos')
        pedidos.value = []
    } finally {
        carregando.value = false
    }
}

function abrirModalCancelamento(pedidoId) {
    modalCancelamento.value = {
        ativo: true,
        pedidoId: pedidoId
    }
}

function fecharModal() {
    modalCancelamento.value = {
        ativo: false,
        pedidoId: null
    }
    cancelando.value = false
}

async function confirmarCancelamento() {
    try {
        cancelando.value = true
        await cancelarPedido(modalCancelamento.value.pedidoId)
        
        // Atualizar o status do pedido localmente
        const pedido = pedidos.value.find(p => p.id === modalCancelamento.value.pedidoId)
        if (pedido) {
            pedido.status = 'CANCELLED'
        }
        
        toast.success('Pedido cancelado com sucesso!')
        fecharModal()
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error)
        toast.error('Erro ao cancelar pedido')
    } finally {
        cancelando.value = false
    }
}



onMounted(async () => {
    await carregarPedidos()
})
</script>

<style scoped>
.soumdetalhe {
    width: 100%;
    max-width: 1250px;
    height: 1px;
    background-color: #838383;
    margin-bottom: 5px;
}

.tudo {
    width: 100%;
    height: 100vh;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
    box-sizing: border-box;
}

.pedidos-container {
    width: 100%;
    max-width: 1200px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.titulo-secao {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #4f79a3;
    height: 4.5rem;
    width: 100%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin-bottom: 15px;
}

.titulo-secao h2 {
    font-size: 26px;
    color: rgb(255, 255, 255);
    margin: 0;
    font-weight: bold;
}

.pedidos-content {
    height: 80%;
    overflow-y: auto;
    padding-right: 10px;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
    width: 100%;
    height: 100%;
    min-height: 400px;
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

.estado-pedidos {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    text-align: center;
}

.pedidos-vazio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.pedidos-vazio-img {
    width: 120px;
    height: auto;
    opacity: 0.6;
}

.pedidos-vazio h3 {
    font-size: 24px;
    color: #333;
    margin: 0;
}

.pedidos-vazio p {
    font-size: 16px;
    color: #666;
    margin: 0;
}

.btn-comprar-agora {
    background-color: #4f79a3;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s;
}

.btn-comprar-agora:hover {
    background-color: #3a5a7a;
}

.pedidos-lista {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.pedido-card {
    background-color: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
    padding: 24px;
    transition: all 0.3s ease;
}

.pedido-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.pedido-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e9ecef;
}

.pedido-info h4 {
    font-size: 20px;
    color: #333;
    margin: 0 0 5px 0;
    font-weight: bold;
}

.pedido-data {
    font-size: 14px;
    color: #666;
    margin: 0;
}



.pedido-produtos {
    margin-bottom: 20px;
}

.produto-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.produto-item:last-child {
    border-bottom: none;
}

.produto-imagem {
    flex-shrink: 0;
}

.produto-imagem img {
    width: 60px;
    height: 84px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #dee2e6;
}

.produto-info {
    flex: 1;
}

.produto-info h5 {
    font-size: 16px;
    color: #333;
    margin: 0 0 5px 0;
    font-weight: bold;
}

.produto-preco {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.pedido-acoes {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn-cancelar-pedido {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-cancelar-pedido {
    background-color: #dc3545;
    color: white;
}

.btn-cancelar-pedido:hover:not(:disabled) {
    background-color: #c82333;
}

.btn-cancelar-pedido:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* Estilos do Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid #02060af5;
}

.modal-header {
    margin-bottom: 15px;
}

.modal-header h3 {
    color: #e11d48;
    font-size: 18px;
    font-weight: bold;
    margin: 0;
}

.modal-body {
    margin-bottom: 20px;
}

.modal-body p {
    color: #333;
    font-size: 14px;
    margin: 5px 0;
    line-height: 1.4;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn-cancelar {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.btn-cancelar:hover {
    background-color: #5a6268;
}

.btn-confirmar {
    background-color: #e11d48;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.btn-confirmar:hover:not(:disabled) {
    background-color: #c81e3a;
}

.btn-confirmar:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* Responsividade */
@media (max-width: 768px) {
    .tudo {
        padding: 10px;
    }
    
    .titulo-secao {
        height: 3.5rem;
    }
    
    .titulo-secao h2 {
        font-size: 20px;
    }
    
    .pedido-card {
        padding: 16px;
    }
    
    .pedido-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .pedido-acoes {
        flex-direction: column;
        gap: 8px;
    }
    
    .btn-cancelar-pedido {
        width: 100%;
        padding: 10px;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 5px;
    }
    
    .titulo-secao h2 {
        font-size: 16px;
    }
    
    .pedido-card {
        padding: 12px;
    }
    
    .pedido-info h4 {
        font-size: 18px;
    }
    
    .produto-imagem img {
        width: 50px;
        height: 70px;
    }
    
    .produto-info h5 {
        font-size: 14px;
    }
    
    .produto-preco {
        font-size: 12px;
    }
    

}
</style>