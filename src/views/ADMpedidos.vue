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
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 30px;
    box-sizing: border-box;
}

.header-section {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.header-section h1 {
    margin: 0 0 25px 0;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.2rem;
    font-weight: 700;
    text-align: center;
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
}

.stat-card {
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(2, 6, 10, 0.2);
    transition: all 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(2, 6, 10, 0.3);
}

.stat-number {
    display: block;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 6px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.stat-label {
    font-size: 14px;
    opacity: 0.95;
    font-weight: 500;
}

.filtros-section {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto 20px auto;
    background: white;
    padding: 25px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(0, 0, 0, 0.05);
}

.filtros-container {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
}

.btn-filtro {
    padding: 12px 20px;
    border: 2px solid #079ac7;
    border-radius: 8px;
    background: white;
    color: #079ac7;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(7, 154, 199, 0.1);
}

.btn-filtro:hover:not(.ativo) {
    background: #079ac7;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(7, 154, 199, 0.3);
}

.btn-filtro.ativo {
    background: #079ac7;
    color: white;
    box-shadow: 0 4px 12px rgba(7, 154, 199, 0.4);
    transform: translateY(-1px);
}

.pedidos-section {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(0, 0, 0, 0.05);
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
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #02060af5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(2, 6, 10, 0.2);
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
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    padding: 25px;
    width: 100%;
    box-sizing: border-box;
}

.pedido-card {
    border: 2px solid #e9ecef;
    border-radius: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pedido-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #dee2e6;
}

.pedido-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 2px solid #dee2e6;
}

.pedido-info h3 {
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.3rem;
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
    padding: 12px 20px;
    background: #079ac7;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(7, 154, 199, 0.3);
}

.btn-detalhes:hover {
    background: #067aa0;
    box-shadow: 0 2px 10px rgba(7, 154, 199, 0.4);
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
    border-radius: 16px;
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    border: 3px solid #02060af5;
    position: relative;
}

.modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
    border-radius: 16px 16px 0 0;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px;
    border-bottom: 2px solid #e9ecef;
}

.modal-header h2 {
    margin: 0;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.5rem;
    font-weight: 700;
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
    padding: 12px 24px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-fechar-modal:hover {
    background: #5a6268;
}

/* Responsividade Aprimorada */
@media (max-width: 1024px) {
    .admin-pedidos {
        padding: 25px;
    }
    
    .header-section,
    .filtros-section,
    .pedidos-section {
        padding: 20px;
    }
    
    .header-section h1 {
        font-size: 2rem;
    }
    
    .stats-container {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
    }
    
    .pedidos-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 15px;
        padding: 20px;
    }
}

@media (max-width: 768px) {
    .admin-pedidos {
        padding: 20px;
    }
    
    .header-section,
    .filtros-section,
    .pedidos-section {
        padding: 15px;
        border-radius: 12px;
    }
    
    .header-section h1 {
        font-size: 1.8rem;
    }
    
    .stats-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
    
    .filtros-container {
        flex-direction: column;
        gap: 12px;
    }
    
    .btn-filtro {
        width: 100%;
        text-align: center;
        padding: 10px 16px;
    }
    
    .pedidos-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 15px;
    }
    
    .pedido-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }
    
    .pedido-acoes {
        flex-direction: column;
        gap: 15px;
        width: 100%;
    }
    
    .status-selector {
        width: 100%;
        flex-direction: column;
        gap: 8px;
    }
    
    .status-selector select {
        width: 100%;
    }
    
    .btn-detalhes {
        width: 100%;
        text-align: center;
    }
    
    .produto-detalhe {
        flex-direction: column;
        text-align: center;
        gap: 12px;
    }
    
    .modal-content {
        margin: 20px;
        max-width: calc(100% - 40px);
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 20px;
    }
}

@media (max-width: 480px) {
    .admin-pedidos {
        padding: 15px;
    }
    
    .header-section,
    .filtros-section,
    .pedidos-section {
        padding: 12px;
        border-radius: 8px;
    }
    
    .header-section h1 {
        font-size: 1.5rem;
    }
    
    .stats-container {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .stat-card {
        padding: 15px;
    }
    
    .stat-number {
        font-size: 24px;
    }
    
    .stat-label {
        font-size: 12px;
    }
    
    .pedidos-grid {
        gap: 12px;
        padding: 12px;
    }
    
    .pedido-card {
        padding: 15px;
        border-radius: 12px;
    }
    
    .pedido-info h3 {
        font-size: 1.1rem;
    }
    
    .pedido-data {
        font-size: 12px;
    }
    
    .pedido-user {
        font-size: 11px;
    }
    
    .status-selector label {
        font-size: 12px;
    }
    
    .status-selector select {
        font-size: 12px;
        padding: 6px 10px;
    }
    
    .btn-detalhes {
        font-size: 13px;
        padding: 10px 16px;
    }
    
    .btn-filtro {
        padding: 8px 14px;
        font-size: 12px;
    }
    
    .modal-content {
        margin: 15px;
        border-radius: 12px;
    }
    
    .modal-header h2 {
        font-size: 1.2rem;
    }
    
    .btn-fechar-modal {
        padding: 10px 20px;
        font-size: 12px;
    }
}

@media (max-width: 360px) {
    .admin-pedidos {
        padding: 10px;
    }
    
    .header-section,
    .filtros-section,
    .pedidos-section {
        padding: 10px;
    }
    
    .header-section h1 {
        font-size: 1.3rem;
    }
    
    .stat-card {
        padding: 12px;
    }
    
    .stat-number {
        font-size: 20px;
    }
    
    .stat-label {
        font-size: 11px;
    }
    
    .pedidos-grid {
        padding: 10px;
        gap: 10px;
    }
    
    .pedido-card {
        padding: 12px;
    }
    
    .pedido-info h3 {
        font-size: 1rem;
    }
    
    .btn-filtro {
        padding: 6px 12px;
        font-size: 11px;
    }
    
    .btn-detalhes {
        padding: 8px 12px;
        font-size: 12px;
    }
}
</style>