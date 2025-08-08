<template>
    <div class="admin-pedidos">
        <div class="header-section">
            <h1>Gerenciamento de Pedidos</h1>
            <div class="stats-container">
                <div class="stat-card">
                    <span class="stat-number">{{ totalPedidos }}</span>
                    <span class="stat-label">Total de Pedidos</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ pedidosPendentes }}</span>
                    <span class="stat-label">Pendentes</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ pedidosProcessando }}</span>
                    <span class="stat-label">Processando</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ pedidosEnviados }}</span>
                    <span class="stat-label">Enviados</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ pedidosEntregues }}</span>
                    <span class="stat-label">Entregues</span>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <div class="filtros-section">
            <div class="filtros-container">
                <button 
                    @click="alterarFiltro('TODOS')"
                    :class="['btn-filtro', { 'ativo': filtroAtivo === 'TODOS' }]">
                    TODOS ({{ totalPedidos }})
                </button>
                <button 
                    @click="alterarFiltro('PENDING')"
                    :class="['btn-filtro', { 'ativo': filtroAtivo === 'PENDING' }]">
                    PENDENTES ({{ pedidosPendentes }})
                </button>
                <button 
                    @click="alterarFiltro('PROCESSING')"
                    :class="['btn-filtro', { 'ativo': filtroAtivo === 'PROCESSING' }]">
                    PROCESSANDO ({{ pedidosProcessando }})
                </button>
                <button 
                    @click="alterarFiltro('SHIPPED')"
                    :class="['btn-filtro', { 'ativo': filtroAtivo === 'SHIPPED' }]">
                    ENVIADOS ({{ pedidosEnviados }})
                </button>
                <button 
                    @click="alterarFiltro('COMPLETED')"
                    :class="['btn-filtro', { 'ativo': filtroAtivo === 'COMPLETED' }]">
                    ENTREGUES ({{ pedidosEntregues }})
                </button>
                <button 
                    @click="alterarFiltro('CANCELED')"
                    :class="['btn-filtro', { 'ativo': filtroAtivo === 'CANCELED' }]">
                    CANCELADOS ({{ pedidosCancelados }})
                </button>
            </div>
        </div>

        <!-- Lista de Pedidos -->
        <div class="pedidos-section">
            <div v-if="carregando" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando pedidos...</p>
            </div>

            <div v-else-if="!pedidosFiltrados.length" class="empty-state">
                <img src="../components/img/listafinal.png" alt="Nenhum pedido" class="empty-img">
                <h3>Nenhum pedido encontrado</h3>
                <p>Não há pedidos com o filtro selecionado.</p>
            </div>

            <div v-else class="pedidos-grid" ref="pedidosGridRef">
                <div v-for="pedido in pedidosFiltrados" :key="pedido.id" class="pedido-card">
                    <div class="pedido-header">
                        <div class="pedido-info">
                            <h3>Pedido #{{ pedido.id }}</h3>
                            <p class="pedido-data">{{ formatarData(pedido.order_date) }}</p>
                            <p class="pedido-user">Usuário ID: {{ pedido.user_id }}</p>
                        </div>
                        <div class="pedido-status">
                            <span :class="['status-badge', `status-${pedido.status.toLowerCase()}`]">
                                {{ getStatusLabel(pedido.status) }}
                            </span>
                        </div>
                    </div>

                    <div class="pedido-produtos">
                        <h4>Produtos ({{ pedido.products.length }})</h4>
                        <div class="produtos-lista">
                            <div v-for="produto in pedido.products" :key="produto.id" class="produto-item">
                                <img :src="getImageUrl(produto.image_path)" :alt="produto.name" class="produto-img">
                                <div class="produto-info">
                                    <h5>{{ produto.name }}</h5>
                                    <p class="produto-preco">R$ {{ formatarPreco(produto.price) }}</p>
                                    <p class="produto-stock">Estoque: {{ produto.stock }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pedido-acoes">
                        <div class="status-selector">
                            <label for="status-select">Atualizar Status:</label>
                            <select 
                                :id="`status-${pedido.id}`"
                                v-model="pedido.status"
                                @change="atualizarStatus(pedido.id, pedido.status)"
                                :disabled="atualizandoStatus === pedido.id">
                                <option value="PENDING">Pendente</option>
                                <option value="PROCESSING">Processando</option>
                                <option value="SHIPPED">Enviado</option>
                                <option value="COMPLETED">Entregue</option>
                                <option value="CANCELED">Cancelado</option>
                            </select>
                        </div>
                        <button 
                            @click="verDetalhes(pedido)"
                            class="btn-detalhes">
                            Ver Detalhes
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Detalhes -->
        <div v-if="modalDetalhes.ativo" class="modal-overlay" @click="fecharModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>Detalhes do Pedido #{{ modalDetalhes.pedido?.id }}</h2>
                    <button @click="fecharModal" class="btn-fechar">×</button>
                </div>
                <div class="modal-body">
                    <div class="detalhes-info">
                        <div class="info-row">
                            <strong>Data do Pedido:</strong>
                            <span>{{ formatarData(modalDetalhes.pedido?.order_date) }}</span>
                        </div>
                        <div class="info-row">
                            <strong>Status:</strong>
                            <span :class="['status-badge', `status-${modalDetalhes.pedido?.status.toLowerCase()}`]">
                                {{ getStatusLabel(modalDetalhes.pedido?.status) }}
                            </span>
                        </div>
                        <div class="info-row">
                            <strong>Usuário ID:</strong>
                            <span>{{ modalDetalhes.pedido?.user_id }}</span>
                        </div>
                        <div class="info-row">
                            <strong>Endereço ID:</strong>
                            <span>{{ modalDetalhes.pedido?.address_id }}</span>
                        </div>
                        <div class="info-row">
                            <strong>Cupom ID:</strong>
                            <span>{{ modalDetalhes.pedido?.coupon_id || 'Nenhum' }}</span>
                        </div>
                    </div>

                    <div class="detalhes-produtos">
                        <h3>Produtos do Pedido</h3>
                        <div class="produtos-grid">
                            <div v-for="produto in modalDetalhes.pedido?.products" :key="produto.id" class="produto-detalhe">
                                <img :src="getImageUrl(produto.image_path)" :alt="produto.name">
                                <div class="produto-info-detalhe">
                                    <h4>{{ produto.name }}</h4>
                                    <p class="produto-preco">R$ {{ formatarPreco(produto.price) }}</p>
                                    <p class="produto-descricao">{{ produto.description }}</p>
                                    <p class="produto-categoria">Categoria ID: {{ produto.category_id }}</p>
                                    <p class="produto-stock">Estoque: {{ produto.stock }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="fecharModal" class="btn-fechar-modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { getPedidosPorAdmin, atualizarStatusPedido } from '../services/api'

const toast = useToast()

// Estados
const carregando = ref(true)
const pedidos = ref([])
const filtroAtivo = ref('TODOS')
const atualizandoStatus = ref(null)

const modalDetalhes = ref({
    ativo: false,
    pedido: null
})

const pedidosGridRef = ref(null)

// Computed properties
const pedidosFiltrados = computed(() => {
    if (filtroAtivo.value === 'TODOS') {
        return pedidos.value
    }
    return pedidos.value.filter(pedido => pedido.status === filtroAtivo.value)
})

const totalPedidos = computed(() => pedidos.value.length)
const pedidosPendentes = computed(() => pedidos.value.filter(p => p.status === 'PENDING').length)
const pedidosProcessando = computed(() => pedidos.value.filter(p => p.status === 'PROCESSING').length)
const pedidosEnviados = computed(() => pedidos.value.filter(p => p.status === 'SHIPPED').length)
const pedidosEntregues = computed(() => pedidos.value.filter(p => p.status === 'COMPLETED').length)
const pedidosCancelados = computed(() => pedidos.value.filter(p => p.status === 'CANCELED').length)

// Funções
function formatarData(data) {
    if (!data) return ''
    const dataObj = new Date(data + 'Z')
    return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
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

function getStatusLabel(status) {
    const labels = {
        'PENDING': 'Pendente',
        'PROCESSING': 'Processando',
        'SHIPPED': 'Enviado',
        'COMPLETED': 'Entregue',
        'CANCELED': 'Cancelado'
    }
    return labels[status] || status
}

async function carregarPedidos() {
    try {
        carregando.value = true
        const dados = await getPedidosPorAdmin(228)
        pedidos.value = dados
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        toast.error('Erro ao carregar pedidos')
        pedidos.value = []
    } finally {
        carregando.value = false
    }
}

async function atualizarStatus(pedidoId, novoStatus) {
    try {
        atualizandoStatus.value = pedidoId
        
        await atualizarStatusPedido(pedidoId, novoStatus)
        
        toast.success(`Status do pedido #${pedidoId} atualizado para ${getStatusLabel(novoStatus)}`)
    } catch (error) {
        console.error('Erro ao atualizar status:', error)
        toast.error('Erro ao atualizar status do pedido')
        
        // Reverter mudança local
        const pedido = pedidos.value.find(p => p.id === pedidoId)
        if (pedido) {
            pedido.status = pedido.status // Manter status anterior
        }
    } finally {
        atualizandoStatus.value = null
    }
}

function verDetalhes(pedido) {
    modalDetalhes.value = {
        ativo: true,
        pedido: pedido
    }
}

function fecharModal() {
    modalDetalhes.value = {
        ativo: false,
        pedido: null
    }
}

function alterarFiltro(novoFiltro) {
    filtroAtivo.value = novoFiltro
    
    // Scroll para o topo da lista de pedidos
    nextTick(() => {
        if (pedidosGridRef.value) {
            pedidosGridRef.value.scrollTop = 0
        }
    })
}

onMounted(async () => {
    await carregarPedidos()
})
</script>

<style scoped>
.admin-pedidos {
    padding: 16px;
    max-width: 1400px;
    margin: 0 auto;
    background-color: #ffffff;
    min-height: 100%;
}

.header-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.header-section h1 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 28px;
    font-weight: bold;
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

.stat-card {
    background: linear-gradient(135deg, #4f79a3, #3a5a7a);
    color: white;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-number {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    opacity: 0.9;
}

.filtros-section {
    background: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.filtros-container {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

.btn-filtro {
    padding: 10px 16px;
    border: 2px solid #4f79a3;
    border-radius: 8px;
    background: transparent;
    color: #4f79a3;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
}

.btn-filtro:hover:not(.ativo) {
    background: #4f79a3;
    color: white;
    transform: translateY(-1px);
}

.btn-filtro.ativo {
    background: #4f79a3;
    color: white;
    box-shadow: 0 2px 8px rgba(79, 121, 163, 0.3);
}

.pedidos-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4f79a3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    text-align: center;
}

.empty-img {
    width: 80px;
    height: auto;
    opacity: 0.6;
    margin-bottom: 16px;
}

.empty-state h3 {
    color: #333;
    margin: 0 0 8px 0;
}

.empty-state p {
    color: #666;
    margin: 0;
}

.pedidos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
    padding: 16px;
    height: 50vh;
    max-height: calc(100vh - 400px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #c0c4c9 #f1f3f5;
}

.pedidos-grid::-webkit-scrollbar { width: 8px; height: 8px; }
.pedidos-grid::-webkit-scrollbar-track { background: #f1f3f5; }
.pedidos-grid::-webkit-scrollbar-thumb { background-color: #c0c4c9; border-radius: 0; border: 1px solid #e5e7eb; }

.pedido-card {
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 16px;
    background: #ffffff;
    transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.pedido-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.pedido-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid #e9ecef;
}

.pedido-info h3 {
    margin: 0 0 6px 0;
    color: #02060af5;
    font-size: 18px;
    font-weight: 700;
}

.pedido-data {
    margin: 0 0 4px 0;
    color: #666;
    font-size: 14px;
}

.pedido-user {
    margin: 0;
    color: #888;
    font-size: 12px;
}

.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
}

.status-pending {
    background: #fff3cd;
    color: #856404;
}

.status-processing {
    background: #cce5ff;
    color: #004085;
}

.status-shipped {
    background: #d1ecf1;
    color: #0c5460;
}

.status-completed {
    background: #d4edda;
    color: #155724;
}

.status-canceled {
    background: #f8d7da;
    color: #721c24;
}

.pedido-produtos {
    margin-bottom: 14px;
}

.pedido-produtos h4 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 16px;
}

.produtos-lista {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.produto-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.produto-img {
    width: 64px;
    height: 90px;
    object-fit: cover;
    border-radius: 4px;
}

.produto-info h5 {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #333;
}

.produto-preco {
    margin: 0 0 2px 0;
    font-size: 12px;
    color: #666;
}

.produto-stock {
    margin: 0;
    font-size: 11px;
    color: #888;
}

.pedido-acoes {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.status-selector {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-selector label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.status-selector select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    background: white;
}

.btn-detalhes {
    padding: 10px 16px;
    background: #079ac7;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-detalhes:hover {
    background: #067aa0;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
    margin: 0;
    color: #333;
}

.btn-fechar {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.modal-body {
    padding: 20px;
}

.detalhes-info {
    margin-bottom: 24px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
    border-bottom: none;
}

.detalhes-produtos h3 {
    margin: 0 0 16px 0;
    color: #333;
}

.produtos-grid {
    display: grid;
    gap: 16px;
}

.produto-detalhe {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.produto-detalhe img {
    width: 80px;
    height: 112px;
    object-fit: cover;
    border-radius: 6px;
}

.produto-info-detalhe h4 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 16px;
}

.produto-info-detalhe p {
    margin: 0 0 4px 0;
    font-size: 14px;
}

.produto-preco {
    color: #4f79a3;
    font-weight: bold;
}

.produto-descricao {
    color: #666;
    font-style: italic;
}

.produto-categoria, .produto-stock {
    color: #888;
    font-size: 12px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #e9ecef;
    text-align: right;
}

.btn-fechar-modal {
    padding: 10px 20px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-fechar-modal:hover {
    background: #5a6268;
}

/* Responsividade */
@media (max-width: 768px) {
    .admin-pedidos {
        padding: 10px 8px;
    }
    
    .stats-container {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .filtros-container {
        flex-direction: column;
    }
    
    .btn-filtro {
        width: 100%;
        text-align: center;
    }
    
    .pedido-header {
        flex-direction: column;
        gap: 8px;
    }
    
    .pedido-acoes {
        flex-direction: column;
        gap: 12px;
    }
    
    .status-selector {
        width: 100%;
    }
    
    .status-selector select {
        width: 100%;
    }
    
    .produto-detalhe {
        flex-direction: column;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .pedidos-grid {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 12px;
        max-height: calc(100vh - 320px);
    }

    .pedido-info h3 { font-size: 16px; }
    .pedido-data { font-size: 12px; }
    .pedido-user { font-size: 11px; }
    .status-selector label { font-size: 12px; }
    .status-selector select { font-size: 12px; }
    .btn-detalhes { font-size: 13px; padding: 8px 14px; }
}
</style>