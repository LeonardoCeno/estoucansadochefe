<template>
    <div class="tudo">
        <div class="pedidos-container">
            <div class="titulo-secao">
                <h2>MEUS PEDIDOS</h2>
            </div>
            
            <!-- Botões de Filtro -->
            <div class="filtros-container">
                <div class="btn-filtro-wrapper">
                    <button 
                        @click="filtroAtivo = 'PENDING'"
                        :class="['btn-filtro', { 'ativo': filtroAtivo === 'PENDING' }]">
                        PENDENTES
                    </button>
                    <span v-if="contadorPendentes > 0" class="filtro-badge">{{ contadorPendentes }}</span>
                </div>
                <div class="btn-filtro-wrapper">
                    <button 
                        @click="filtroAtivo = 'PROCESSING'"
                        :class="['btn-filtro', { 'ativo': filtroAtivo === 'PROCESSING' }]">
                        PROCESSANDO
                    </button>
                    <span v-if="contadorProcessando > 0" class="filtro-badge">{{ contadorProcessando }}</span>
                </div>
                <div class="btn-filtro-wrapper">
                    <button 
                        @click="filtroAtivo = 'SHIPPED'"
                        :class="['btn-filtro', { 'ativo': filtroAtivo === 'SHIPPED' }]">
                        ENVIADOS
                    </button>
                    <span v-if="contadorEnviados > 0" class="filtro-badge">{{ contadorEnviados }}</span>
                </div>
                <div class="btn-filtro-wrapper">
                    <button 
                        @click="filtroAtivo = 'COMPLETED'"
                        :class="['btn-filtro', { 'ativo': filtroAtivo === 'COMPLETED' }]">
                        ENTREGUES
                    </button>
                    <span v-if="contadorEntregues > 0" class="filtro-badge">{{ contadorEntregues }}</span>
                </div>
                <div class="btn-filtro-wrapper">
                    <button 
                        @click="filtroAtivo = 'CANCELED'"
                        :class="['btn-filtro', { 'ativo': filtroAtivo === 'CANCELED' }]">
                        CANCELADOS
                    </button>
                    <span v-if="contadorCancelados > 0" class="filtro-badge">{{ contadorCancelados }}</span>
                </div>
            </div>
            
            <div class="soumdetalhe"></div>
            
            <div class="pedidos-content">
                <div v-if="carregando" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Carregando pedidos...</p>
                </div>

                <div v-else-if="!pedidosFiltrados.length" class="estado-pedidos">
                    <div class="pedidos-vazio">
                        <img src="../components/img/listafinal.png" alt="Nenhum pedido" class="pedidos-vazio-img">
                        <h3>Nenhum pedido por aqui</h3>
                        <p>Por que não aumentar sua coleção?</p>
                        <router-link to="/pesquisas" class="btn-comprar-agora">
                            Comprar Agora
                        </router-link>
                    </div>
                </div>

                <!-- Lista de Pedidos -->
                <div v-else class="pedidos-lista">
                    <div v-for="pedido in pedidosFiltrados" :key="pedido.id" class="pedido-card">
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

                        <div class="pedido-total">
                            <p class="total-label">Total do Pedido:</p>
                            <p class="total-valor">R$ {{ formatarPreco(calcularTotalPedido(pedido)) }}</p>
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

const carregando = ref(true)
const pedidos = ref([])
const cancelando = ref(false)
const filtroAtivo = ref('PENDING')

const modalCancelamento = ref({
    ativo: false,
    pedidoId: null
})

const pedidosFiltrados = computed(() => {
    return pedidos.value.filter(pedido => pedido.status === filtroAtivo.value)
})

// Contadores para cada status
const contadorPendentes = computed(() => {
    return pedidos.value.filter(pedido => pedido.status === 'PENDING').length
})

const contadorProcessando = computed(() => {
    return pedidos.value.filter(pedido => pedido.status === 'PROCESSING').length
})

const contadorEnviados = computed(() => {
    return pedidos.value.filter(pedido => pedido.status === 'SHIPPED').length
})

const contadorEntregues = computed(() => {
    return pedidos.value.filter(pedido => pedido.status === 'COMPLETED').length
})

const contadorCancelados = computed(() => {
    return pedidos.value.filter(pedido => pedido.status === 'CANCELED' || pedido.status === 'CANCELLED').length
})

// Funções
function formatarData(data) {
    // cria a data sabendo q vem em UTC
    const dataObj = new Date(data + 'Z')
    return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo' // Força o fuso BR
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

function calcularTotalPedido(pedido) {
    if (!pedido.products || pedido.products.length === 0) return 0
    
    return pedido.products.reduce((total, produto) => {
        const preco = parseFloat(produto.price) || 0
        return total + preco
    }, 0)
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
            // Forçar reatividade criando uma nova referência do array
            pedidos.value = [...pedidos.value]
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
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 30px;
    box-sizing: border-box;
}

.pedidos-container {
    width: 100%;
    max-width: 1400px;
    min-height: 85vh;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(2, 6, 10, 0.1);
}

.titulo-secao {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    height: 5rem;
    width: 100%;
    box-shadow: 0 8px 25px rgba(2, 6, 10, 0.2);
    border-radius: 16px;
    margin-bottom: 30px;
    position: relative;
    overflow: hidden;
}

.titulo-secao::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
}

.titulo-secao h2 {
    font-size: 2rem;
    color: white;
    margin: 0;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
}

.filtros-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    padding: 20px 0;
}

.btn-filtro {
    padding: 14px 24px;
    border: 2px solid #007bff;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    color: #007bff;
    min-width: 140px;
}

.btn-filtro:hover:not(.ativo) {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
}

.btn-filtro.ativo {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
}

.btn-filtro-wrapper {
    position: relative;
    display: inline-block;
}

.filtro-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 11px;
    font-weight: 700;
    min-width: 22px;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 2;
}

.pedidos-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 15px;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.pedidos-content::-webkit-scrollbar {
    width: 8px;
}

.pedidos-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.pedidos-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.pedidos-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
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
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    padding: 16px 32px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: background-color 0.3s ease;
    border: none;
}

.btn-comprar-agora:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
}

.pedidos-lista {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.pedido-card {
    background: white;
    border-radius: 20px;
    border: 2px solid #f1f5f9;
    padding: 30px;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
}

.pedido-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.pedido-card:hover {
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
    border-color: #e2e8f0;
}

.pedido-card:hover::before {
    opacity: 1;
}

.pedido-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f1f5f9;
    position: relative;
}

.pedido-header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
}

.pedido-info h4 {
    font-size: 1.4rem;
    color: #1e293b;
    margin: 0 0 8px 0;
    font-weight: 700;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.pedido-data {
    font-size: 0.95rem;
    color: #64748b;
    margin: 0;
    font-weight: 500;
}



.pedido-produtos {
    margin-bottom: 20px;
}

.produto-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: #fafbfc;
}

.produto-item:last-child {
    border-bottom: none;
}

.produto-item:hover {
    background: #f8fafc;
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.produto-imagem {
    flex-shrink: 0;
}

.produto-imagem img {
    width: 70px;
    height: 95px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.produto-item:hover .produto-imagem img {
    transform: scale(1.05);
    border-color: #02060af5;
}

.produto-info {
    flex: 1;
}

.produto-info h5 {
    font-size: 1.1rem;
    color: #1e293b;
    margin: 0 0 8px 0;
    font-weight: 600;
    line-height: 1.4;
}

.produto-preco {
    font-size: 1rem;
    color: #02060af5;
    margin: 0;
    font-weight: 600;
}

.pedido-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 25px 0;
    padding: 20px 25px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    position: relative;
    overflow: hidden;
}

.pedido-total::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
}

.total-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: #334155;
    margin: 0;
    letter-spacing: 0.3px;
}

.total-valor {
    font-size: 1.4rem;
    font-weight: 700;
    color: #02060af5;
    margin: 0;
    text-shadow: 0 1px 3px rgba(2, 6, 10, 0.1);
}

.pedido-acoes {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn-cancelar-pedido {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
}

.btn-cancelar-pedido:hover:not(:disabled) {
    background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
}

.btn-cancelar-pedido:disabled {
    background: #ccc;
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
    background: white;
    border-radius: 20px;
    padding: 30px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    border: 3px solid #02060af5;
    position: relative;
    overflow: hidden;
}

.modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
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
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.btn-cancelar:hover {
    background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
}

.btn-confirmar {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.btn-confirmar:hover:not(:disabled) {
    background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
}

.btn-confirmar:disabled {
    background: #ccc;
    cursor: not-allowed;
}

/* Responsividade */
@media (max-width: 1024px) {
    .pedidos-container {
        max-width: 95%;
        padding: 30px;
    }
    
    .filtros-container {
        gap: 12px;
    }
    
    .btn-filtro {
        min-width: 120px;
        padding: 12px 20px;
    }
}

@media (max-width: 768px) {
    .tudo {
        padding: 15px;
    }
    
    .pedidos-container {
        padding: 25px;
        border-radius: 16px;
    }
    
    .titulo-secao {
        height: 4rem;
    }
    
    .titulo-secao h2 {
        font-size: 1.6rem;
    }
    
    .filtros-container {
        flex-direction: column;
        gap: 10px;
        padding: 15px 0;
    }

    .btn-filtro {
        width: 100%;
        text-align: center;
        min-width: auto;
    }
    
    .filtro-badge {
        top: -8px;
        right: -8px;
        width: 18px;
        height: 18px;
        font-size: 10px;
        min-width: 18px;
    }
    
    .pedido-card {
        padding: 20px;
        border-radius: 16px;
    }
    
    .pedido-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 15px;
    }
    
    .produto-item {
        gap: 15px;
        padding: 12px 16px;
    }
    
    .produto-imagem img {
        width: 60px;
        height: 80px;
    }
    
    .pedido-total {
        flex-direction: column;
        gap: 12px;
        text-align: center;
        padding: 16px 20px;
    }
    
    .pedido-acoes {
        flex-direction: column;
        gap: 10px;
    }
    
    .btn-cancelar-pedido {
        width: 100%;
        padding: 14px;
    }
    
    .modal-content {
        padding: 25px;
        max-width: 95%;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 10px;
    }
    
    .pedidos-container {
        padding: 20px;
        border-radius: 12px;
    }
    
    .titulo-secao {
        height: 3.5rem;
        margin-bottom: 20px;
    }
    
    .titulo-secao h2 {
        font-size: 1.3rem;
    }
    
    .filtros-container {
        padding: 10px 0;
    }
    
    .btn-filtro {
        padding: 10px 16px;
        font-size: 0.9rem;
    }
    
    .filtro-badge {
        width: 16px;
        height: 16px;
        font-size: 9px;
        min-width: 16px;
    }
    
    .pedido-card {
        padding: 16px;
        gap: 15px;
    }
    
    .pedido-info h4 {
        font-size: 1.2rem;
    }
    
    .produto-item {
        gap: 12px;
        padding: 10px 12px;
    }
    
    .produto-imagem img {
        width: 50px;
        height: 70px;
    }
    
    .produto-info h5 {
        font-size: 1rem;
    }
    
    .produto-preco {
        font-size: 0.9rem;
    }
    
    .pedido-total {
        padding: 14px 16px;
    }
    
    .total-label {
        font-size: 1rem;
    }
    
    .total-valor {
        font-size: 1.2rem;
    }
    
    .btn-cancelar-pedido {
        font-size: 0.9rem;
        padding: 12px;
    }
    
    .modal-content {
        padding: 20px;
        border-radius: 16px;
    }
    
    .btn-cancelar,
    .btn-confirmar {
        padding: 10px 16px;
        font-size: 0.9rem;
    }
}
</style>