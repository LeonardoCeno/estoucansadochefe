<template>
    <div class="tudo">
        <div class="carrinho-container">
                <div class="titulo-secao">
                    <h2>MEU CARRINHO</h2>
                </div>
                <div class="soumdetalhe"></div>
            <div class="carrinho-content">
                <div v-if="carregando" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Carregando carrinho...</p>
                </div>

                <div v-else-if="!itensCarrinho.length" class="estado-carrinho">
                    <div class="carrinho-vazio">
                        <img src="../components/img/carrinhofinal.png" alt="Carrinho vazio" class="carrinho-vazio-img">
                        <h3>Seu carrinho está vazio</h3>
                        <p>Adicione alguns produtos para começar suas compras!</p>
                        <router-link to="/pesquisas" class="btn-continuar-comprando">
                            Continuar Comprando
                        </router-link>
                    </div>
                </div>

                <!-- Itens do Carrinho -->
                <div v-else class="carrinho-com-itens">
                    <div class="itens-container">
                        <div class="itens-lista">
                            <div v-for="item in itensCarrinho" :key="item.id" class="item-carrinho">
                                <div class="item-imagem">
                                    <img :src="item.image_path" :alt="item.name" />
                                </div>
                                <div class="item-info">
                                    <h4>{{ item.name }}</h4>
                                    <p class="item-preco">R$ {{ formatarPreco(item.unit_price) }}</p>
                                </div>
                                <div class="item-quantidade">
                                    <div class="quantidade-controles">
                                        <button 
                                            @click="cartStore.diminuirQuantidade(item)" 
                                            :disabled="item.quantity <= 1"
                                            class="btn-quantidade">
                                            -
                                        </button>
                                        <span class="quantidade-valor">{{ item.quantity }}</span>
                                        <button 
                                            @click="cartStore.aumentarQuantidade(item)" 
                                            class="btn-quantidade">
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div class="item-subtotal">
                                    <p class="subtotal-valor">R$ {{ formatarPreco(item.unit_price * item.quantity) }}</p>
                                </div>
                                <div class="item-acoes">
                                    <button @click="cartStore.removerItemDoCarrinho(item)" class="btn-remover">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Resumo do Carrinho -->
                    <div class="resumo-carrinho">
                        <div class="resumo-header">
                            <h3>Resumo do Pedido</h3>
                        </div>
                        <div class="resumo-itens">
                            <div class="resumo-item">
                                <span>Subtotal ({{ totalItens }} {{ totalItens === 1 ? 'item' : 'itens' }})</span>
                                <span>R$ {{ formatarPreco(subtotal) }}</span>
                            </div>
                                                    <div class="resumo-item">
                            <span>Frete</span>
                            <span>Grátis</span>
                        </div>
                        
                        <!-- Seção de Cupom -->
                        <div class="cupom-section">
                            <div v-if="!cupomAplicado" class="cupom-input">
                                <input 
                                    v-model="codigoCupom"
                                    type="text" 
                                    placeholder="Código do cupom"
                                    @keyup.enter="aplicarCupomCodigo"
                                    :disabled="aplicandoCupom"
                                />
                                <button 
                                    @click="aplicarCupomCodigo"
                                    :disabled="aplicandoCupom || !codigoCupom.trim()"
                                    class="btn-aplicar-cupom">
                                    {{ aplicandoCupom ? 'Aplicando...' : 'Aplicar' }}
                                </button>
                            </div>
                            <div v-else class="cupom-aplicado">
                                <div class="cupom-info">
                                    <span class="cupom-codigo">{{ cupomAplicado.code }}</span>
                                    <span class="cupom-desconto">-{{ cupomAplicado.discount_percentage }}%</span>
                                </div>
                                <button @click="removerCupom" class="btn-remover-cupom">
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div v-if="cupomAplicado" class="resumo-item desconto-item">
                            <span>Desconto ({{ cupomAplicado.code }})</span>
                            <span>-R$ {{ formatarPreco(descontoCupom) }}</span>
                        </div>
                        
                        <div class="resumo-total">
                            <span>Total</span>
                            <span>R$ {{ formatarPreco(total) }}</span>
                        </div>
                        </div>
                        <div class="resumo-acoes">
                            <button @click="abrirModalLimparCarrinho" class="btn-limpar-carrinho">
                                Limpar Carrinho
                            </button>
                            <button @click="finalizarCompra" class="btn-finalizar-compra">
                                Finalizar Compra
                            </button>
                        </div>
                        <div class="resumo-continuar">
                            <router-link to="/pesquisas" class="link-continuar-comprando">
                                ← Continuar Comprando
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Confirmação para Limpar Carrinho -->
        <div v-if="modalLimparCarrinho.ativo" class="modal-overlay" @click="fecharModalLimparCarrinho">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Limpar Carrinho?</h3>
                </div>
                <div class="modal-body">
                    <p>Tem certeza que deseja remover todos os itens do carrinho?</p>
                    <p>Esta ação não pode ser desfeita.</p>
                </div>
                <div class="modal-footer">
                    <button @click="fecharModalLimparCarrinho" class="btn-cancelar">Cancelar</button>
                    <button 
                        @click="confirmarLimparCarrinho" 
                        class="btn-confirmar"
                        :disabled="limpandoCarrinho">
                        {{ limpandoCarrinho ? 'Limpando...' : 'Confirmar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useCartStore } from '../stores/cart'
import { aplicarCupom } from '../services/api'

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()

// Estados
const cupomAplicado = ref(null)
const codigoCupom = ref('')
const aplicandoCupom = ref(false)
const limpandoCarrinho = ref(false)

const modalLimparCarrinho = ref({
    ativo: false
})

// Computed - usando o store
const carregando = computed(() => cartStore.carregando)
const itensCarrinho = computed(() => cartStore.itensCarrinho)
const totalItens = computed(() => cartStore.totalItens)
const subtotal = computed(() => cartStore.totalPreco)

const descontoCupom = computed(() => {
    if (!cupomAplicado.value) return 0
    return (subtotal.value * cupomAplicado.value.discount_percentage) / 100
})

const total = computed(() => {
    return subtotal.value - descontoCupom.value // Frete grátis
})

// Funções
function formatarPreco(preco) {
    return preco.toFixed(2).replace('.', ',')
}



async function aplicarCupomCodigo() {
    if (!codigoCupom.value.trim()) {
        toast.error('Digite um código de cupom!')
        return
    }
    
    try {
        aplicandoCupom.value = true
        const resultado = await aplicarCupom(codigoCupom.value.trim())
        cupomAplicado.value = resultado
        localStorage.setItem('cupomAplicado', JSON.stringify(resultado))
        codigoCupom.value = ''
        toast.success(`Cupom aplicado! Desconto de ${resultado.discount_percentage}%`)
    } catch (error) {
        console.error('Erro ao aplicar cupom:', error)
        toast.error(error.message || 'Erro ao aplicar cupom')
    } finally {
        aplicandoCupom.value = false
    }
}

function removerCupom() {
    cupomAplicado.value = null
    localStorage.removeItem('cupomAplicado')
    toast.success('Cupom removido!')
}

function finalizarCompra() {
    if (itensCarrinho.value.length === 0) {
        toast.error('Carrinho vazio!')
        return
    }
    
    // Salvar cupom no localStorage para persistir no checkout
    if (cupomAplicado.value) {
        localStorage.setItem('cupomAplicado', JSON.stringify(cupomAplicado.value))
    } else {
        localStorage.removeItem('cupomAplicado')
    }
    
    router.push('/checkout')
}

function abrirModalLimparCarrinho() {
    modalLimparCarrinho.value.ativo = true
}

function fecharModalLimparCarrinho() {
    modalLimparCarrinho.value.ativo = false
    limpandoCarrinho.value = false
}

async function confirmarLimparCarrinho() {
    try {
        limpandoCarrinho.value = true
        await cartStore.limparCarrinho()
        toast.success('Carrinho limpo com sucesso!')
        fecharModalLimparCarrinho()
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error)
        toast.error('Erro ao limpar carrinho')
    } finally {
        limpandoCarrinho.value = false
    }
}

onMounted(async () => {
    await cartStore.carregarCarrinho()
})
</script>

<style scoped>

/* Layout principal */
.tudo {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 30px;
    box-sizing: border-box;
}

.carrinho-container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* Header do carrinho */
.titulo-secao {
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    padding: 30px 40px;
    text-align: center;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    border-radius: 0;
}

.titulo-secao h2 {
    font-size: 2rem;
    color: white;
    margin: 0;
    font-weight: 600;
    letter-spacing: 1px;
}

.soumdetalhe {
    display: none;
}

.carrinho-content {
    flex: 1;
    display: flex;
    gap: 40px;
    padding: 40px;
    overflow: hidden;
}

.estado-carrinho {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 400px;
    text-align: center;
    padding: 60px 40px;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    text-align: center;
    width: 100%;
    min-height: 400px;
}

.loading-container p {
    font-size: 1.2rem;
    color: #666;
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

.carrinho-vazio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    max-width: 500px;
    margin: 0 auto;
}

.carrinho-vazio-img {
    width: 150px;
    height: auto;
    opacity: 0.7;
    filter: grayscale(20%);
}

.carrinho-vazio h3 {
    font-size: 1.8rem;
    color: #333;
    margin: 0;
    font-weight: 600;
}

.carrinho-vazio p {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
    line-height: 1.5;
}

.btn-continuar-comprando {
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    padding: 16px 32px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(2, 6, 10, 0.3);
}

.btn-continuar-comprando:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(2, 6, 10, 0.4);
}

.carrinho-com-itens {
    display: flex;
    gap: 40px;
    width: 100%;
    min-height: 500px;
}

.itens-container {
    flex: 1;
    overflow-y: auto;
    padding-right: 20px;
    min-width: 0;
}

.itens-lista {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.item-carrinho {
    display: flex;
    align-items: center;
    gap: 25px;
    padding: 30px;
    background: #f8f9fa;
    border-radius: 16px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
}

.item-carrinho:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(2, 6, 10, 0.1);
}

.item-imagem {
    flex-shrink: 0;
}

.item-imagem img {
    width: 120px;
    height: 160px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #dee2e6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-info {
    flex: 1;
    min-width: 0;
}

.item-info h4 {
    font-size: 1.3rem;
    color: #333;
    margin: 0 0 12px 0;
    font-weight: 600;
    line-height: 1.3;
}

.item-preco {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
    font-weight: 500;
}

.item-quantidade {
    flex-shrink: 0;
}

.quantidade-controles {
    display: flex;
    align-items: center;
    gap: 16px;
    background-color: white;
    border-radius: 12px;
    padding: 12px 16px;
    border: 2px solid #dee2e6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-quantidade {
    width: 40px;
    height: 40px;
    border: none;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    border-radius: 10px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(2, 6, 10, 0.2);
}

.btn-quantidade:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(2, 6, 10, 0.3);
}

.btn-quantidade:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.quantidade-valor {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    min-width: 35px;
    text-align: center;
}

.item-subtotal {
    flex-shrink: 0;
    text-align: right;
}

.subtotal-valor {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.item-acoes {
    flex-shrink: 0;
}

.btn-remover {
    width: 45px;
    height: 45px;
    border: none;
    background-color: #dc3545;
    color: white;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-remover:hover {
    background-color: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.resumo-carrinho {
    width: 400px;
    background: #f8f9fa;
    border-radius: 16px;
    border: 2px solid #e9ecef;
    padding: 30px;
    height: fit-content;
    position: sticky;
    top: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.resumo-header h3 {
    font-size: 1.5rem;
    color: #333;
    margin: 0 0 25px 0;
    font-weight: 600;
    text-align: center;
    border-bottom: 2px solid #02060af5;
    padding-bottom: 15px;
}

.resumo-itens {
    margin-bottom: 30px;
}

.resumo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #e9ecef;
    font-size: 1.1rem;
    color: #666;
    font-weight: 500;
}

.resumo-item:last-of-type {
    border-bottom: none;
}

.resumo-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-top: 3px solid #02060af5;
    margin-top: 20px;
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

/* Estilos para Cupom */
.cupom-section {
    margin: 20px 0;
    padding: 20px 0;
    border-top: 2px solid #e9ecef;
    border-bottom: 2px solid #e9ecef;
}

.cupom-input {
    display: flex;
    gap: 12px;
}

.cupom-input input {
    flex: 1;
    max-width: 180px;
    padding: 14px 16px;
    border: 2px solid #dee2e6;
    border-radius: 10px;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;
    background: white;
}

.cupom-input input:focus {
    border-color: #02060af5;
    box-shadow: 0 0 0 3px rgba(2, 6, 10, 0.1);
}

.cupom-input input:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
}

.btn-aplicar-cupom {
    padding: 14px 20px;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(2, 6, 10, 0.2);
}

.btn-aplicar-cupom:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(2, 6, 10, 0.3);
}

.btn-aplicar-cupom:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.cupom-aplicado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    border: 2px solid #c3e6cb;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(21, 87, 36, 0.1);
}

.cupom-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.cupom-codigo {
    font-size: 1rem;
    font-weight: 600;
    color: #155724;
}

.cupom-desconto {
    font-size: 0.9rem;
    color: #155724;
    font-weight: 500;
}

.btn-remover-cupom {
    background: none;
    border: none;
    color: #dc3545;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.btn-remover-cupom:hover {
    background-color: #f8d7da;
    transform: scale(1.1);
}

.desconto-item {
    color: #28a745 !important;
    font-weight: 600 !important;
    font-size: 1.1rem !important;
}

.resumo-acoes {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 25px;
}

.btn-limpar-carrinho {
    padding: 16px 24px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-limpar-carrinho:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.btn-finalizar-compra {
    padding: 20px 24px;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(2, 6, 10, 0.3);
    letter-spacing: 0.5px;
}

.btn-finalizar-compra:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(2, 6, 10, 0.4);
}

.resumo-continuar {
    text-align: center;
    margin-top: 15px;
}

.link-continuar-comprando {
    color: #02060af5;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.link-continuar-comprando:hover {
    color: #079ac7;
    text-decoration: underline;
    transform: translateX(-3px);
}

@media (max-width: 1024px) {
    .carrinho-com-itens {
        flex-direction: column;
        gap: 30px;
    }
    .resumo-carrinho {
        width: 100%;
        position: static;
        max-width: 600px;
        margin: 0 auto;
    }
    .itens-container {
        padding-right: 0;
    }
    .carrinho-content {
        padding: 30px;
    }
}

@media (max-width: 768px) {
    .tudo {
        padding: 20px;
    }
    
    .titulo-secao {
        padding: 25px 30px;
    }
    
    .titulo-secao h2 {
        font-size: 1.6rem;
    }
    
    .carrinho-content {
        padding: 30px;
    }
    
    .item-carrinho {
        flex-direction: column;
        text-align: center;
        gap: 20px;
        padding: 25px;
    }
    
    .item-imagem img {
        width: 100px;
        height: 140px;
    }
    
    .item-info h4 {
        font-size: 1.2rem;
    }
    
    .item-preco {
        font-size: 1rem;
    }
    
    .quantidade-controles {
        justify-content: center;
    }
    
    .item-subtotal {
        text-align: center;
    }
    
    .subtotal-valor {
        font-size: 1.2rem;
    }
    
    .resumo-carrinho {
        padding: 25px;
    }
    
    .resumo-header h3 {
        font-size: 1.3rem;
    }
    
    .resumo-item {
        font-size: 1rem;
        padding: 14px 0;
    }
    
    .resumo-total {
        font-size: 1.2rem;
        padding: 18px 0;
        margin-left: -25px;
        margin-right: -25px;
        padding-left: 25px;
        padding-right: 25px;
    }
    
    .cupom-input {
        flex-direction: column;
        gap: 12px;
    }
    
    .cupom-input input {
        max-width: 100%;
    }
    
    .btn-aplicar-cupom {
        width: 100%;
    }
    
    .btn-finalizar-compra {
        font-size: 1.1rem;
        padding: 18px 20px;
    }
    
    .btn-limpar-carrinho {
        font-size: 1rem;
        padding: 14px 20px;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 15px;
    }
    
    .titulo-secao {
        padding: 20px 25px;
    }
    
    .titulo-secao h2 {
        font-size: 1.4rem;
    }
    
    .carrinho-content {
        gap: 25px;
        padding: 25px;
    }
    
    .carrinho-vazio {
        padding: 40px 20px;
    }
    
    .carrinho-vazio-img {
        width: 120px;
    }
    
    .carrinho-vazio h3 {
        font-size: 1.5rem;
    }
    
    .carrinho-vazio p {
        font-size: 1rem;
    }
    
    .btn-continuar-comprando {
        padding: 14px 28px;
        font-size: 1rem;
    }
    
    .item-carrinho {
        padding: 20px;
        gap: 18px;
    }
    
    .item-imagem img {
        width: 80px;
        height: 112px;
    }
    
    .item-info h4 {
        font-size: 1.1rem;
    }
    
    .item-preco {
        font-size: 0.95rem;
    }
    
    .subtotal-valor {
        font-size: 1.1rem;
    }
    
    .quantidade-controles {
        gap: 12px;
        padding: 10px 14px;
    }
    
    .btn-quantidade {
        width: 35px;
        height: 35px;
        font-size: 16px;
    }
    
    .quantidade-valor {
        font-size: 1rem;
    }
    
    .btn-remover {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
    
    .resumo-carrinho {
        padding: 20px;
    }
    
    .resumo-header h3 {
        font-size: 1.2rem;
        margin-bottom: 20px;
        padding-bottom: 12px;
    }
    
    .resumo-item {
        font-size: 0.95rem;
        padding: 12px 0;
    }
    
    .resumo-total {
        font-size: 1.1rem;
        padding: 16px 0;
        margin-left: -20px;
        margin-right: -20px;
        padding-left: 20px;
        padding-right: 20px;
    }
    
    .btn-limpar-carrinho {
        font-size: 1rem;
        padding: 14px 18px;
    }
    
    .btn-finalizar-compra {
        font-size: 1.1rem;
        padding: 16px 18px;
    }
    
    .link-continuar-comprando {
        font-size: 1rem;
    }
    
    .cupom-input input {
        font-size: 0.95rem;
        padding: 12px 14px;
    }
    
    .btn-aplicar-cupom {
        font-size: 0.95rem;
        padding: 12px 16px;
    }
    
    .cupom-codigo {
        font-size: 0.95rem;
    }
    
    .cupom-desconto {
        font-size: 0.85rem;
    }
}

@media (max-width: 360px) {
    .tudo {
        padding: 10px;
    }
    
    .titulo-secao {
        padding: 18px 20px;
    }
    
    .titulo-secao h2 {
        font-size: 1.2rem;
    }
    
    .carrinho-content {
        padding: 20px;
    }
    
    .item-carrinho {
        padding: 18px;
        gap: 15px;
    }
    
    .item-imagem img {
        width: 70px;
        height: 98px;
    }
    
    .item-info h4 {
        font-size: 1rem;
    }
    
    .item-preco {
        font-size: 0.9rem;
    }
    
    .btn-quantidade {
        width: 32px;
        height: 32px;
        font-size: 14px;
    }
    
    .quantidade-valor {
        font-size: 0.95rem;
    }
    
    .subtotal-valor {
        font-size: 1rem;
    }
    
    .btn-remover {
        width: 38px;
        height: 38px;
        font-size: 14px;
    }
    
    .resumo-carrinho {
        padding: 18px;
    }
    
    .resumo-header h3 {
        font-size: 1.1rem;
    }
    
    .resumo-item {
        font-size: 0.9rem;
    }
    
    .resumo-total {
        font-size: 1rem;
        margin-left: -18px;
        margin-right: -18px;
        padding-left: 18px;
        padding-right: 18px;
    }
    
    .btn-limpar-carrinho,
    .btn-finalizar-compra {
        font-size: 0.95rem;
        padding: 12px 16px;
    }
}

/* Estilos do Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    border: 3px solid #02060af5;
    text-align: center;
}

.modal-header {
    margin-bottom: 20px;
}

.modal-header h3 {
    color: #e11d48;
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
}

.modal-body {
    margin-bottom: 25px;
}

.modal-body p {
    color: #666;
    font-size: 1rem;
    margin: 8px 0;
    line-height: 1.5;
}

.modal-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.btn-cancelar {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-cancelar:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.btn-confirmar {
    background-color: #e11d48;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(225, 29, 72, 0.3);
}

.btn-confirmar:hover:not(:disabled) {
    background-color: #c81e3a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);
}

.btn-confirmar:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Responsividade do Modal */
@media (max-width: 768px) {
    .modal-overlay {
        padding: 15px;
    }
    
    .modal-content {
        padding: 25px;
        max-width: 450px;
    }
    
    .modal-header h3 {
        font-size: 1.2rem;
    }
    
    .modal-body p {
        font-size: 0.95rem;
    }
    
    .modal-footer {
        gap: 12px;
        flex-direction: column;
    }
    
    .btn-cancelar,
    .btn-confirmar {
        padding: 10px 20px;
        font-size: 0.95rem;
        width: 100%;
    }
}

@media (max-width: 480px) {
    .modal-overlay {
        padding: 10px;
    }
    
    .modal-content {
        padding: 20px;
        max-width: 100%;
    }
    
    .modal-header h3 {
        font-size: 1.1rem;
    }
    
    .modal-body p {
        font-size: 0.9rem;
    }
    
    .btn-cancelar,
    .btn-confirmar {
        padding: 10px 18px;
        font-size: 0.9rem;
    }
}
</style>