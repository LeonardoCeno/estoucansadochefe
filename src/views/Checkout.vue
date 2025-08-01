<template>
    <div class="checkout-container">

        <div class="checkout-header">
            <router-link to="/carrinho" class="voltar-btn">← Voltar ao Carrinho</router-link>
            <h1>Finalizar Compra</h1>
            <div class="progress-bar">
                <div class="progress-step" :class="{ active: etapa >= 1 }">
                    <span class="step-number">1</span>
                    <span class="step-text">Endereço</span>
                </div>
                <div class="progress-line" :class="{ active: etapa >= 2 }"></div>
                <div class="progress-step" :class="{ active: etapa >= 2 }">
                    <span class="step-number">2</span>
                    <span class="step-text">Pagamento</span>
                </div>
                <div class="progress-line" :class="{ active: etapa >= 3 }"></div>
                <div class="progress-step" :class="{ active: etapa >= 3 }">
                    <span class="step-number">3</span>
                    <span class="step-text">Revisão</span>
                </div>
            </div>
        </div>

        <div class="checkout-content">
            <!-- Etapa 1: Endereço -->
            <div v-if="etapa === 1" class="checkout-step">
                <h2>Selecione o Endereço de Entrega</h2>
                
                <div v-if="carregandoEnderecos" class="loading">
                    <div class="spinner"></div>
                    <p>Carregando endereços...</p>
                </div>

                <div v-else-if="!enderecos.length" class="sem-enderecos">
                    <img src="../components/img/usuariofinal.png" alt="Sem endereços">
                    <h3>Nenhum endereço cadastrado</h3>
                    <p>Adicione um endereço para continuar</p>
                    <button @click="mostrarFormEndereco = true" class="btn-adicionar">
                        + Adicionar Endereço
                    </button>
                </div>

                <div v-else class="enderecos-lista">
                    <div 
                        v-for="endereco in enderecos" 
                        :key="endereco.id"
                        class="endereco-item"
                        :class="{ selecionado: enderecoSelecionado?.id === endereco.id }"
                        @click="selecionarEndereco(endereco)"
                    >
                        <div class="radio" :class="{ checked: enderecoSelecionado?.id === endereco.id }"></div>
                        <div class="endereco-info">
                            <h4>{{ endereco.street }}, {{ endereco.number }}</h4>
                            <p>{{ endereco.city }} - {{ endereco.state }}</p>
                            <p>CEP: {{ endereco.zip }}</p>
                        </div>
                        <button @click.stop="editarEndereco(endereco)" class="btn-editar">✏️</button>
                    </div>
                    <button @click="mostrarFormEndereco = true" class="btn-novo">
                        + Adicionar Novo Endereço
                    </button>
                </div>
            </div>

            <!-- Etapa 2: Pagamento -->
            <div v-if="etapa === 2" class="checkout-step">
                <h2>Escolha a Forma de Pagamento</h2>
                
                <div class="formas-pagamento">
                    <div 
                        v-for="forma in formasPagamento" 
                        :key="forma.id"
                        class="forma-pagamento"
                        :class="{ selecionada: formaPagamentoSelecionada?.id === forma.id }"
                        @click="selecionarFormaPagamento(forma)"
                    >
                        <div class="radio" :class="{ checked: formaPagamentoSelecionada?.id === forma.id }"></div>
                        <img :src="forma.icone" :alt="forma.nome" class="forma-icone">
                        <div class="forma-info">
                            <h4>{{ forma.nome }}</h4>
                            <p>{{ forma.descricao }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Etapa 3: Revisão -->
            <div v-if="etapa === 3" class="checkout-step">
                <h2>Revisar Pedido</h2>
                
                <div class="revisao">
                    <div class="revisao-info-pedido">
                        <div class="revisao-secao">
                            <h3>Endereço de Entrega</h3>
                            <p>{{ enderecoSelecionado?.street }}, {{ enderecoSelecionado?.number }}</p>
                            <p>{{ enderecoSelecionado?.city }} - {{ enderecoSelecionado?.state }}</p>
                            <p>CEP: {{ enderecoSelecionado?.zip }}</p>
                        </div>

                        <div class="revisao-secao">
                            <h3>Forma de Pagamento</h3>
                            <div class="pagamento-revisao">
                                <img :src="formaPagamentoSelecionada?.icone" :alt="formaPagamentoSelecionada?.nome" class="pagamento-icone">
                                <div class="pagamento-info">
                                    <p><strong>{{ formaPagamentoSelecionada?.nome }}</strong></p>
                                    <p>{{ formaPagamentoSelecionada?.descricao }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="itens-revisao" class="revisao-secao">
                        <h3>Itens do Pedido</h3>
                        <div v-for="item in itensCarrinho" :key="item.id" class="item-revisao">
                            <img :src="item.image_path" :alt="item.name">
                            <div class="item-info">
                                <h4>{{ item.name }}</h4>
                                <p>Qtd: {{ item.quantity }}</p>
                            </div>
                            <span>R$ {{ formatarPreco(item.unit_price * item.quantity) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumo Lateral -->
            <div class="checkout-resumo">
                <h3>Resumo do Pedido</h3>
                
                <div class="resumo-itens">
                    <div v-for="item in itensCarrinho" :key="item.id" class="resumo-item">
                        <img :src="item.image_path" :alt="item.name">
                        <div>
                            <h4>{{ item.name }}</h4>
                            <p>Qtd: {{ item.quantity }}</p>
                        </div>
                        <span>R$ {{ formatarPreco(item.unit_price * item.quantity) }}</span>
                    </div>
                </div>

                <div class="resumo-totais">
                    <div class="resumo-linha">
                        <span>Subtotal</span>
                        <span>R$ {{ formatarPreco(subtotal) }}</span>
                    </div>
                    <div class="resumo-linha">
                        <span>Frete</span>
                        <span>Grátis</span>
                    </div>
                    <div class="resumo-total">
                        <span>Total</span>
                        <span>R$ {{ formatarPreco(total) }}</span>
                    </div>
                </div>

                <div class="resumo-acoes">
                    <button 
                        v-if="etapa < 3" 
                        @click="proximaEtapa" 
                        :disabled="!podeAvancar"
                        class="btn-continuar"
                    >
                        {{ etapa === 1 ? 'Continuar para Pagamento' : 'Revisar Pedido' }}
                    </button>
                    
                    <button 
                        v-if="etapa === 3" 
                        @click="finalizarPedido" 
                        :disabled="finalizando"
                        class="btn-finalizar"
                    >
                        {{ finalizando ? 'Finalizando...' : 'Finalizar Pedido' }}
                    </button>
                    
                    <button 
                        v-if="etapa > 1" 
                        @click="etapaAnterior" 
                        class="btn-voltar"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Endereço -->
        <div v-if="mostrarFormEndereco" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>{{ editandoEndereco ? 'Editar' : 'Adicionar' }} Endereço</h3>
                    <button @click="fecharFormEndereco" class="btn-fechar">✕</button>
                </div>
                
                <form @submit.prevent="salvarEndereco" class="form-endereco">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Rua</label>
                            <input v-model="formEndereco.street" type="text" required>
                        </div>
                        <div class="form-group">
                            <label>Número</label>
                            <input v-model="formEndereco.number" type="number" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cidade</label>
                            <input v-model="formEndereco.city" type="text" required>
                        </div>
                        <div class="form-group">
                            <label>Estado</label>
                            <input v-model="formEndereco.state" type="text" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>CEP</label>
                            <input v-model="formEndereco.zip" type="text" required>
                        </div>
                        <div class="form-group">
                            <label>País</label>
                            <input v-model="formEndereco.country" type="text" required>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" @click="fecharFormEndereco" class="btn-cancelar">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="salvandoEndereco" class="btn-salvar">
                            {{ salvandoEndereco ? 'Salvando...' : 'Salvar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { 
    getEnderecos, 
    criarEndereco, 
    atualizarEndereco,
    getItensCarrinho,
    criarPedido
} from '../services/api'

const router = useRouter()
const toast = useToast()

// Estados
const etapa = ref(1)
const carregandoEnderecos = ref(true)
const enderecos = ref([])
const enderecoSelecionado = ref(null)
const formaPagamentoSelecionada = ref(null)
const itensCarrinho = ref([])
const finalizando = ref(false)

// Estados do formulário
const mostrarFormEndereco = ref(false)
const editandoEndereco = ref(false)
const salvandoEndereco = ref(false)
const formEndereco = ref({
    street: '',
    number: '',
    city: '',
    state: '',
    zip: '',
    country: ''
})

// Formas de pagamento
const formasPagamento = ref([
    {
        id: 'pix',
        nome: 'PIX',
        descricao: 'Pagamento instantâneo',
        icone: '/src/components/img/pixisano.png'
    },
    {
        id: 'cartao',
        nome: 'Cartão de Crédito',
        descricao: 'Visa, Mastercard, Elo',
        icone: '/src/components/img/cartao.png'
    },
    {
        id: 'boleto',
        nome: 'Boleto Bancário',
        descricao: 'Vencimento em 3 dias úteis',
        icone: '/src/components/img/cartao.png'
    }
])

// Computed
const subtotal = computed(() => {
    return itensCarrinho.value.reduce((total, item) => {
        return total + (item.unit_price * item.quantity)
    }, 0)
})

const total = computed(() => subtotal.value)

const podeAvancar = computed(() => {
    if (etapa.value === 1) return enderecoSelecionado.value !== null
    if (etapa.value === 2) return formaPagamentoSelecionada.value !== null
    return true
})

// Funções
function formatarPreco(preco) {
    return preco.toFixed(2).replace('.', ',')
}

async function carregarEnderecos() {
    try {
        carregandoEnderecos.value = true
        const dados = await getEnderecos()
        enderecos.value = dados
    } catch (error) {
        console.error('Erro ao carregar endereços:', error)
        toast.error('Erro ao carregar endereços')
    } finally {
        carregandoEnderecos.value = false
    }
}

async function carregarCarrinho() {
    try {
        const dadosCarrinho = await getItensCarrinho()
        itensCarrinho.value = (dadosCarrinho.items || []).map(item => ({
            ...item,
            image_path: item.image_path && !item.image_path.startsWith('http')
                ? `http://35.196.79.227:8000${item.image_path}`
                : item.image_path
        }))
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
        toast.error('Erro ao carregar carrinho')
    }
}

function selecionarEndereco(endereco) {
    enderecoSelecionado.value = endereco
}

function selecionarFormaPagamento(forma) {
    formaPagamentoSelecionada.value = forma
}

function proximaEtapa() {
    if (etapa.value < 3) etapa.value++
}

function etapaAnterior() {
    if (etapa.value > 1) etapa.value--
}

function editarEndereco(endereco) {
    editandoEndereco.value = true
    formEndereco.value = { ...endereco }
    mostrarFormEndereco.value = true
}

function fecharFormEndereco() {
    mostrarFormEndereco.value = false
    editandoEndereco.value = false
    formEndereco.value = {
        street: '',
        number: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    }
}

async function salvarEndereco() {
    try {
        salvandoEndereco.value = true
        
        if (editandoEndereco.value) {
            await atualizarEndereco(formEndereco.value.id, formEndereco.value)
            toast.success('Endereço atualizado!')
        } else {
            const novoEndereco = await criarEndereco(formEndereco.value)
            enderecos.value.push(novoEndereco)
            toast.success('Endereço adicionado!')
        }
        
        fecharFormEndereco()
        await carregarEnderecos()
    } catch (error) {
        console.error('Erro ao salvar endereço:', error)
        toast.error('Erro ao salvar endereço')
    } finally {
        salvandoEndereco.value = false
    }
}

async function finalizarPedido() {
    if (!enderecoSelecionado.value || !formaPagamentoSelecionada.value) {
        toast.error('Selecione endereço e forma de pagamento')
        return
    }
    
    try {
        finalizando.value = true
        
        await criarPedido({
            address_id: enderecoSelecionado.value.id,
            coupon_id: null // Pode ser implementado depois
        })
        
        toast.success('Pedido finalizado com sucesso!')
        router.push('/pedidos')
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error)
        toast.error('Erro ao finalizar pedido')
    } finally {
        finalizando.value = false
    }
}

onMounted(async () => {
    await Promise.all([
        carregarEnderecos(),
        carregarCarrinho()
    ])
})
</script>

<style scoped>
.checkout-container {
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
    overflow-y: hidden;
}

.checkout-header {
    max-width: 1200px;
    margin: 0 auto 13px;
    background: white;
    border-radius: 12px;
    padding: 10px 18px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.voltar-btn {
    color: #4f79a3;
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 6px;
    display: inline-block;
}

.voltar-btn:hover {
    color: #3a5a7a;
}

.checkout-header h1 {
    font-size: 32px;
    color: #333;
    margin: 0 0 10px 0;
    text-align: center;
}

.progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

.progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.5;
    transition: opacity 0.3s;
}

.progress-step.active {
    opacity: 1;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e9ecef;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: all 0.3s;
}

.progress-step.active .step-number {
    background: #4f79a3;
    color: white;
}

.step-text {
    font-size: 14px;
    color: #6c757d;
    font-weight: 500;
}

.progress-step.active .step-text {
    color: #4f79a3;
}

.progress-line {
    width: 60px;
    height: 2px;
    background: #e9ecef;
    transition: background 0.3s;
}

.progress-line.active {
    background: #4f79a3;
}

.checkout-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 30px;
    height: 77%;
}

.checkout-step {
    height: 100%;
    flex: 1;
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.checkout-step h2 {
    font-size: 24px;
    color: #333;
    margin: 0 0 24px 0;
    text-align: center;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.spinner {
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

.sem-enderecos {
    text-align: center;
    padding: 40px 20px;
}

.sem-enderecos img {
    width: 80px;
    height: auto;
    opacity: 0.6;
    margin-bottom: 20px;
}

.sem-enderecos h3 {
    font-size: 20px;
    color: #333;
    margin: 0 0 12px 0;
}

.sem-enderecos p {
    color: #666;
    margin: 0 0 24px 0;
}

.btn-adicionar {
    background: #4f79a3;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-adicionar:hover {
    background: #3a5a7a;
}

.enderecos-lista {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.endereco-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.endereco-item:hover {
    border-color: #4f79a3;
    box-shadow: 0 4px 12px rgba(79, 122, 163, 0.1);
}

.endereco-item.selecionado {
    border-color: #4f79a3;
    background: rgba(79, 122, 163, 0.05);
}

.radio {
    width: 24px;
    height: 24px;
    border: 2px solid #dee2e6;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s;
}

.radio.checked {
    border-color: #4f79a3;
    background: #4f79a3;
}

.radio.checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
}

.endereco-info {
    flex: 1;
}

.endereco-info h4 {
    font-size: 16px;
    color: #333;
    margin: 0 0 4px 0;
    font-weight: 600;
}

.endereco-info p {
    font-size: 14px;
    color: #666;
    margin: 0 0 2px 0;
}

.btn-editar {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background 0.3s;
}

.btn-editar:hover {
    background: #f8f9fa;
}

.btn-novo {
    background: #28a745;
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
    margin-top: 16px;
}

.btn-novo:hover {
    background: #218838;
}

.formas-pagamento {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.forma-pagamento {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.forma-pagamento:hover {
    border-color: #4f79a3;
    box-shadow: 0 4px 12px rgba(79, 122, 163, 0.1);
}

.forma-pagamento.selecionada {
    border-color: #4f79a3;
    background: rgba(79, 122, 163, 0.05);
}

.forma-icone {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 6px;
    background: #f8f9fa;
    padding: 4px;
}

.forma-info h4 {
    font-size: 16px;
    color: #333;
    margin: 0 0 4px 0;
    font-weight: 600;
}

.forma-info p {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.revisao {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.revisao-info-pedido {
    display: flex;
    gap: 24px;
}

.revisao-info-pedido .revisao-secao {
    flex: 1;
}

.pagamento-revisao {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
}

.pagamento-icone {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 4px;
    background: white;
    padding: 2px;
}

.pagamento-info p {
    margin: 0 0 4px 0;
    font-size: 14px;
}

.pagamento-info p:last-child {
    margin: 0;
    color: #666;
    font-size: 12px;
}

.revisao-secao {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    overflow-y: auto;
}

#itens-revisao {
    height: 28vh;
    overflow-y: auto;
}

.revisao-secao h3 {
    font-size: 18px;
    color: #333;
    margin: 0 0 16px 0;
    font-weight: 600;
}

.revisao-secao p {
    margin: 0 0 4px 0;
    color: #666;
}

.item-revisao {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    margin-bottom: 12px;
}

.item-revisao img {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
}

.item-revisao .item-info {
    flex: 1;
}

.item-revisao h4 {
    font-size: 14px;
    color: #333;
    margin: 0 0 4px 0;
    font-weight: 600;
}

.item-revisao p {
    font-size: 12px;
    color: #666;
    margin: 0;
}

.checkout-resumo {
    width: 350px;
    background: white;
    border-radius: 12px;
    padding: 24px;
    height: 100%;
    position: sticky;
    top: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
}

.checkout-resumo h3 {
    font-size: 20px;
    color: #333;
    margin: 0 0 20px 0;
    text-align: center;
    font-weight: 600;
    flex-shrink: 0;
}

.resumo-itens {
    margin-bottom: 20px;
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.resumo-itens::-webkit-scrollbar {
    width: 6px;
}

.resumo-itens::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.resumo-itens::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.resumo-itens::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.resumo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e9ecef;
}

.resumo-item img {
    width: 50px;
    height: 70px;
    object-fit: cover;
    border-radius: 6px;
}

.resumo-item h4 {
    font-size: 14px;
    color: #333;
    margin: 0 0 4px 0;
    font-weight: 600;
}

.resumo-item p {
    font-size: 12px;
    color: #666;
    margin: 0;
}

.resumo-totais {
    margin-bottom: 24px;
    flex-shrink: 0;
}

.resumo-linha {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
    color: #666;
}

.resumo-total {
    display: flex;
    justify-content: space-between;
    padding: 16px 0;
    border-top: 2px solid #dee2e6;
    margin-top: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.resumo-acoes {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn-continuar,
.btn-finalizar {
    padding: 16px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-continuar:hover:not(:disabled),
.btn-finalizar:hover:not(:disabled) {
    background: #218838;
}

.btn-continuar:disabled,
.btn-finalizar:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.btn-voltar {
    padding: 12px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-voltar:hover {
    background: #5a6268;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.btn-fechar {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.3s;
}

.btn-fechar:hover {
    background: #f8f9fa;
}

.form-endereco {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.form-group input {
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 16px;
    transition: border 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #4f79a3;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn-cancelar {
    flex: 1;
    padding: 12px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-cancelar:hover {
    background: #5a6268;
}

.btn-salvar {
    flex: 1;
    padding: 12px;
    background: #4f79a3;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-salvar:hover:not(:disabled) {
    background: #3a5a7a;
}

.btn-salvar:disabled {
    background: #ccc;
    cursor: not-allowed;
}

@media (max-width: 1024px) {
    .checkout-content {
        flex-direction: column;
    }
    
    .checkout-resumo {
        width: 100%;
        position: static;
    }
}

@media (max-width: 768px) {
    .checkout-container {
        padding: 10px;
    }
    
    .checkout-header {
        padding: 16px;
    }
    
    .checkout-header h1 {
        font-size: 24px;
    }
    
    .progress-bar {
        gap: 12px;
    }
    
    .step-number {
        width: 32px;
        height: 32px;
        font-size: 14px;
    }
    
    .step-text {
        font-size: 12px;
    }
    
    .progress-line {
        width: 40px;
    }
    
    .checkout-step {
        padding: 20px;
    }
    
    .checkout-step h2 {
        font-size: 20px;
    }
    
    .endereco-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .forma-pagamento {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .form-row {
        flex-direction: column;
        gap: 12px;
    }
    
    .modal {
        width: 95%;
        padding: 16px;
    }
    
    .item-revisao {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .resumo-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .revisao-info-pedido {
        flex-direction: column;
        gap: 16px;
    }
    
    .pagamento-revisao {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .checkout-header h1 {
        font-size: 20px;
    }
    
    .progress-bar {
        gap: 8px;
    }
    
    .step-number {
        width: 28px;
        height: 28px;
        font-size: 12px;
    }
    
    .step-text {
        font-size: 10px;
    }
    
    .progress-line {
        width: 30px;
    }
    
    .checkout-step {
        padding: 16px;
    }
    
    .checkout-step h2 {
        font-size: 18px;
    }
    
    .endereco-item {
        padding: 16px;
    }
    
    .forma-pagamento {
        padding: 16px;
    }
    
    .checkout-resumo {
        padding: 16px;
    }
    
    .checkout-resumo h3 {
        font-size: 18px;
    }
    
    .btn-continuar,
    .btn-finalizar {
        font-size: 14px;
        padding: 14px;
    }
}
</style> 