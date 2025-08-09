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
                        
                        <div v-if="cupomAplicado" class="revisao-secao">
                            <h3>Cupom Aplicado</h3>
                            <div class="cupom-revisao">
                                <p><strong>{{ cupomAplicado.code }}</strong></p>
                                <p>Desconto de {{ cupomAplicado.discount_percentage }}%</p>
                            </div>
                        </div>
                    </div>

                    <div class="itens-pedido-section">
                        <h3>Itens do Pedido</h3>
                        <div id="itens-revisao" class="revisao-secao">
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
                    <div v-if="cupomAplicado" class="resumo-linha desconto">
                        <span>Desconto ({{ cupomAplicado.code }})</span>
                        <span>-R$ {{ formatarPreco(descontoCupom) }}</span>
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
    criarPedido
} from '../services/api'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()

// Estados
const etapa = ref(1)
const carregandoEnderecos = ref(true)
const enderecos = ref([])
const enderecoSelecionado = ref(null)
const formaPagamentoSelecionada = ref(null)
const finalizando = ref(false)

// Carrinho - usando o store
const itensCarrinho = computed(() => cartStore.itensCarrinho)

// Estados do formulário
const mostrarFormEndereco = ref(false)
const editandoEndereco = ref(false)
const salvandoEndereco = ref(false)
const cupomAplicado = ref(null)
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
        icone: '/src/components/img/creditoomaga.png'
    },
    {
        id: 'boleto',
        nome: 'Boleto Bancário',
        descricao: 'Vencimento em 3 dias úteis',
        icone: '/src/components/img/boletomedonho.png'
    }
])

// Computed
const subtotal = computed(() => {
    return itensCarrinho.value.reduce((total, item) => {
        return total + (item.unit_price * item.quantity)
    }, 0)
})

const descontoCupom = computed(() => {
    if (!cupomAplicado.value) return 0
    return (subtotal.value * cupomAplicado.value.discount_percentage) / 100
})

const total = computed(() => subtotal.value - descontoCupom.value)

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

// Função para carregar cupom do localStorage
function carregarCupom() {
    const cupomSalvo = localStorage.getItem('cupomAplicado')
    if (cupomSalvo) {
        try {
            cupomAplicado.value = JSON.parse(cupomSalvo)
        } catch (error) {
            console.error('Erro ao carregar cupom:', error)
            localStorage.removeItem('cupomAplicado')
        }
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
            coupon_id: cupomAplicado.value?.id || null
        })
        
        toast.success('Pedido finalizado com sucesso!')
        
        // Limpar cupom após finalizar pedido
        localStorage.removeItem('cupomAplicado')
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
        cartStore.carregarCarrinho()
    ])
    carregarCupom()
})
</script>

<style scoped>
/* Layout principal */
.checkout-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 30px;
    overflow-y: auto;
}

/* Header do checkout */
.checkout-header {
    max-width: 1400px;
    margin: 0 auto 20px;
    background: white;
    border-radius: 16px;
    padding: 30px 40px;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
}

.voltar-btn {
    color: #02060af5;
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 15px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.voltar-btn:hover {
    color: #079ac7;
    transform: translateX(-3px);
}

.checkout-header h1 {
    font-size: 2.2rem;
    color: #333;
    margin: 0 0 25px 0;
    text-align: center;
    font-weight: 600;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Progress Bar Modernizada */
.progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 20px 0;
}

.progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    opacity: 0.4;
    transition: all 0.4s ease;
    transform: scale(0.95);
}

.progress-step.active {
    opacity: 1;
    transform: scale(1);
}

.step-number {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.4s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.progress-step.active .step-number {
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    box-shadow: 0 6px 20px rgba(2, 6, 10, 0.3);
    transform: scale(1.1);
}

.step-text {
    font-size: 1rem;
    color: #6c757d;
    font-weight: 500;
    transition: all 0.3s ease;
}

.progress-step.active .step-text {
    color: #02060af5;
    font-weight: 600;
}

.progress-line {
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #e9ecef 0%, #dee2e6 100%);
    border-radius: 2px;
    transition: all 0.4s ease;
}

.progress-line.active {
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
    box-shadow: 0 2px 8px rgba(2, 6, 10, 0.2);
}

.checkout-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    gap: 40px;
    min-height: 70vh;
}

.checkout-step {
    flex: 1;
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border: 2px solid #f8f9fa;
    transition: all 0.3s ease;
}

.checkout-step:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: #e9ecef;
}

.checkout-step h2 {
    font-size: 1.8rem;
    color: #333;
    margin: 0 0 30px 0;
    text-align: center;
    font-weight: 600;
    border-bottom: 3px solid #02060af5;
    padding-bottom: 15px;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
}

.loading p {
    font-size: 1.2rem;
    color: #666;
    margin: 0;
    font-weight: 500;
}

.spinner {
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

.sem-enderecos {
    text-align: center;
    padding: 60px 40px;
    max-width: 500px;
    margin: 0 auto;
}

.sem-enderecos img {
    width: 120px;
    height: auto;
    opacity: 0.7;
    margin-bottom: 25px;
    filter: grayscale(20%);
}

.sem-enderecos h3 {
    font-size: 1.5rem;
    color: #333;
    margin: 0 0 15px 0;
    font-weight: 600;
}

.sem-enderecos p {
    color: #666;
    margin: 0 0 30px 0;
    font-size: 1.1rem;
    line-height: 1.5;
}

.btn-adicionar {
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(2, 6, 10, 0.3);
}

.btn-adicionar:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(2, 6, 10, 0.4);
}

.enderecos-lista {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.endereco-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 25px;
    border: 2px solid #e9ecef;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.endereco-item:hover {
    border-color: #02060af5;
    box-shadow: 0 8px 25px rgba(2, 6, 10, 0.1);
    transform: translateY(-2px);
}

.endereco-item.selecionado {
    border-color: #02060af5;
    background: linear-gradient(135deg, rgba(2, 6, 10, 0.05) 0%, rgba(7, 154, 199, 0.05) 100%);
    box-shadow: 0 8px 25px rgba(2, 6, 10, 0.15);
}

.radio {
    width: 28px;
    height: 28px;
    border: 3px solid #dee2e6;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.radio.checked {
    border-color: #02060af5;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    box-shadow: 0 4px 12px rgba(2, 6, 10, 0.3);
}

.radio.checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.endereco-info {
    flex: 1;
}

.endereco-info h4 {
    font-size: 1.2rem;
    color: #333;
    margin: 0 0 8px 0;
    font-weight: 600;
}

.endereco-info p {
    font-size: 1rem;
    color: #666;
    margin: 0 0 4px 0;
    line-height: 1.4;
}

.btn-editar {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    transition: all 0.3s ease;
    color: #666;
}

.btn-editar:hover {
    background: #e9ecef;
    color: #02060af5;
    transform: scale(1.1);
}

.btn-novo {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border: none;
    padding: 18px 30px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.btn-novo:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.formas-pagamento {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.forma-pagamento {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 25px;
    border: 2px solid #e9ecef;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.forma-pagamento:hover {
    border-color: #02060af5;
    box-shadow: 0 8px 25px rgba(2, 6, 10, 0.1);
    transform: translateY(-2px);
}

.forma-pagamento.selecionada {
    border-color: #02060af5;
    background: linear-gradient(135deg, rgba(2, 6, 10, 0.05) 0%, rgba(7, 154, 199, 0.05) 100%);
    box-shadow: 0 8px 25px rgba(2, 6, 10, 0.15);
}

.forma-icone {
    width: 50px;
    height: 50px;
    object-fit: contain;
    border-radius: 10px;
    background: white;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.forma-info h4 {
    font-size: 1.2rem;
    color: #333;
    margin: 0 0 8px 0;
    font-weight: 600;
}

.forma-info p {
    font-size: 1rem;
    color: #666;
    margin: 0;
    line-height: 1.4;
}

.revisao {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.revisao-info-pedido {
    display: flex;
    gap: 30px;
}

.revisao-info-pedido .revisao-secao {
    flex: 1;
}

.pagamento-revisao {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    border: 2px solid #e9ecef;
}

.pagamento-icone {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 8px;
    background: white;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagamento-info p {
    margin: 0 0 6px 0;
    font-size: 1rem;
    font-weight: 500;
}

.pagamento-info p:last-child {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

.revisao-secao {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 16px;
    padding: 25px;
    overflow-y: auto;
    border: 2px solid #e9ecef;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

 #itens-revisao {
     max-height: 35vh;
     overflow-y: auto;
 }

 .itens-pedido-section h3 {
     font-size: 1.3rem;
     color: #333;
     margin: 0 0 20px 0;
     font-weight: 600;
     border-bottom: 2px solid #dee2e6;
     padding-bottom: 10px;
 }
 
 .revisao-secao h3 {
     font-size: 1.3rem;
     color: #333;
     margin: 0 0 20px 0;
     font-weight: 600;
     border-bottom: 2px solid #dee2e6;
     padding-bottom: 10px;
 }

.revisao-secao p {
    margin: 0 0 6px 0;
    color: #666;
    font-size: 1rem;
    line-height: 1.4;
}

.item-revisao {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 20px;
    background: white;
    border-radius: 12px;
    margin-bottom: 16px;
    border: 2px solid #f8f9fa;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.item-revisao:hover {
    border-color: #e9ecef;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-revisao img {
    width: 70px;
    height: 90px;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-revisao .item-info {
    flex: 1;
}

.item-revisao h4 {
    font-size: 1rem;
    color: #333;
    margin: 0 0 6px 0;
    font-weight: 600;
    line-height: 1.3;
}

.item-revisao p {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
}

.item-revisao span {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
}

.checkout-resumo {
    width: 400px;
    background: white;
    border-radius: 16px;
    padding: 30px;
    height: fit-content;
    max-height: 80vh;
    position: sticky;
    top: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    border: 2px solid #f8f9fa;
}

.checkout-resumo h3 {
    font-size: 1.5rem;
    color: #333;
    margin: 0 0 25px 0;
    text-align: center;
    font-weight: 600;
    flex-shrink: 0;
    border-bottom: 3px solid #02060af5;
    padding-bottom: 15px;
}

.resumo-itens {
    margin-bottom: 25px;
    flex: 1;
    max-height: 300px;
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
    padding: 16px 0;
    border-bottom: 1px solid #e9ecef;
}

.resumo-item:last-child {
    border-bottom: none;
}

.resumo-item img {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resumo-item h4 {
    font-size: 1rem;
    color: #333;
    margin: 0 0 6px 0;
    font-weight: 600;
    line-height: 1.3;
}

.resumo-item p {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
}

.resumo-item span {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
}

.resumo-totais {
    margin-bottom: 30px;
    flex-shrink: 0;
}

.resumo-linha {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 1rem;
    color: #666;
    font-weight: 500;
}

.resumo-linha.desconto {
    color: #28a745;
    font-weight: 600;
}

.resumo-total {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    border-top: 3px solid #02060af5;
    margin-top: 15px;
    font-size: 1.4rem;
    font-weight: 600;
    color: #333;
    background: rgba(2, 6, 10, 0.02);
    margin-left: -30px;
    margin-right: -30px;
    padding-left: 30px;
    padding-right: 30px;
    border-radius: 0 0 16px 16px;
}

.resumo-acoes {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.btn-continuar,
.btn-finalizar {
    padding: 18px 24px;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(2, 6, 10, 0.3);
    letter-spacing: 0.5px;
}

.btn-continuar:hover:not(:disabled),
.btn-finalizar:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(2, 6, 10, 0.4);
}

.btn-continuar:disabled,
.btn-finalizar:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.btn-voltar {
    padding: 14px 20px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-voltar:hover {
    background: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

/* Modal Modernizado */
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

.modal {
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    border: 3px solid #02060af5;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #f8f9fa;
    padding-bottom: 15px;
}

.modal-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.4rem;
    font-weight: 600;
}

.btn-fechar {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.btn-fechar:hover {
    background: #f8f9fa;
    color: #dc3545;
    transform: scale(1.1);
}

.form-endereco {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: flex;
    gap: 20px;
}

.form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-group label {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
}

.form-group input {
    padding: 14px 16px;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.form-group input:focus {
    outline: none;
    border-color: #02060af5;
    background: white;
    box-shadow: 0 0 0 3px rgba(2, 6, 10, 0.1);
}

.form-actions {
    display: flex;
    gap: 16px;
    margin-top: 30px;
    border-top: 2px solid #f8f9fa;
    padding-top: 20px;
}

.btn-cancelar {
    flex: 1;
    padding: 14px 20px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-cancelar:hover {
    background: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.btn-salvar {
    flex: 1;
    padding: 14px 20px;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(2, 6, 10, 0.3);
}

.btn-salvar:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(2, 6, 10, 0.4);
}

.btn-salvar:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

@media (max-width: 1024px) {
    .checkout-content {
        flex-direction: column;
        gap: 30px;
    }
    
    .checkout-resumo {
        width: 100%;
        position: static;
        max-width: 600px;
        margin: 0 auto;
    }
    
    .revisao-info-pedido {
        flex-direction: column;
        gap: 20px;
    }
}

@media (max-width: 768px) {
    .checkout-container {
        padding: 20px;
    }
    
    .checkout-header {
        padding: 25px 30px;
    }
    
    .checkout-header h1 {
        font-size: 1.8rem;
    }
    
    .voltar-btn {
        font-size: 1rem;
        margin-bottom: 12px;
    }
    
    .progress-bar {
        gap: 20px;
    }
    
    .step-number {
        width: 45px;
        height: 45px;
        font-size: 1rem;
    }
    
    .step-text {
        font-size: 0.9rem;
    }
    
    .progress-line {
        width: 60px;
    }
    
    .checkout-step {
        padding: 30px;
    }
    
    .checkout-step h2 {
        font-size: 1.5rem;
        margin-bottom: 25px;
    }
    
    .endereco-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        padding: 20px;
    }
    
    .forma-pagamento {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        padding: 20px;
    }
    
    .form-row {
        flex-direction: column;
        gap: 16px;
    }
    
    .modal {
        width: 95%;
        padding: 25px;
        max-width: 500px;
    }
    
    .modal-header h3 {
        font-size: 1.2rem;
    }
    
    .item-revisao {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        padding: 15px;
    }
    
    .resumo-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 0;
    }
    
    .checkout-resumo {
        padding: 25px;
    }
    
    .checkout-resumo h3 {
        font-size: 1.3rem;
    }
    
    .resumo-total {
        font-size: 1.2rem;
        margin-left: -25px;
        margin-right: -25px;
        padding-left: 25px;
        padding-right: 25px;
    }
    
    .btn-continuar,
    .btn-finalizar {
        font-size: 1rem;
        padding: 16px 20px;
    }
    
    .btn-voltar {
        font-size: 0.95rem;
        padding: 12px 16px;
    }
}

@media (max-width: 480px) {
    .checkout-container {
        padding: 15px;
    }
    
    .checkout-header {
        padding: 20px 25px;
    }
    
    .checkout-header h1 {
        font-size: 1.5rem;
    }
    
    .voltar-btn {
        font-size: 0.95rem;
    }
    
    .progress-bar {
        gap: 15px;
        padding: 15px 0;
    }
    
    .step-number {
        width: 40px;
        height: 40px;
        font-size: 0.9rem;
    }
    
    .step-text {
        font-size: 0.8rem;
    }
    
    .progress-line {
        width: 40px;
    }
    
    .checkout-step {
        padding: 25px;
    }
    
    .checkout-step h2 {
        font-size: 1.3rem;
        margin-bottom: 20px;
    }
    
    .sem-enderecos {
        padding: 40px 20px;
    }
    
    .sem-enderecos img {
        width: 100px;
    }
    
    .sem-enderecos h3 {
        font-size: 1.3rem;
    }
    
    .sem-enderecos p {
        font-size: 1rem;
    }
    
    .btn-adicionar {
        padding: 14px 28px;
        font-size: 1rem;
    }
    
    .endereco-item,
    .forma-pagamento {
        padding: 20px;
        gap: 15px;
    }
    
    .endereco-info h4,
    .forma-info h4 {
        font-size: 1.1rem;
    }
    
    .endereco-info p,
    .forma-info p {
        font-size: 0.95rem;
    }
    
    .forma-icone {
        width: 45px;
        height: 45px;
    }
    
    .radio {
        width: 25px;
        height: 25px;
    }
    
    .btn-novo {
        padding: 16px 26px;
        font-size: 1rem;
    }
    
    .revisao-secao {
        padding: 20px;
    }
    
    .revisao-secao h3 {
        font-size: 1.2rem;
    }
    
    .item-revisao {
        padding: 14px 16px;
        gap: 12px;
    }
    
    .item-revisao img {
        width: 60px;
        height: 80px;
    }
    
    .checkout-resumo {
        padding: 20px;
    }
    
    .checkout-resumo h3 {
        font-size: 1.2rem;
        margin-bottom: 20px;
    }
    
    .resumo-item {
        padding: 12px 0;
    }
    
    .resumo-item img {
        width: 50px;
        height: 70px;
    }
    
    .resumo-item h4 {
        font-size: 0.95rem;
    }
    
    .resumo-item p {
        font-size: 0.85rem;
    }
    
    .resumo-linha {
        font-size: 0.95rem;
        padding: 10px 0;
    }
    
    .resumo-total {
        font-size: 1.1rem;
        padding: 16px 0;
        margin-left: -20px;
        margin-right: -20px;
        padding-left: 20px;
        padding-right: 20px;
    }
    
    .btn-continuar,
    .btn-finalizar {
        font-size: 1rem;
        padding: 16px 20px;
    }
    
    .btn-voltar {
        font-size: 0.9rem;
        padding: 12px 16px;
    }
    
    .modal {
        padding: 20px;
        max-width: 90%;
    }
    
    .modal-header h3 {
        font-size: 1.1rem;
    }
    
    .form-group input {
        padding: 12px 14px;
        font-size: 0.95rem;
    }
    
    .btn-cancelar,
    .btn-salvar {
        font-size: 0.95rem;
        padding: 12px 18px;
    }
}
</style> 