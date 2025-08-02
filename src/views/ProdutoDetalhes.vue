<template>
    <div class="produto-detalhes">
        <Header></Header>
        
        <div class="container">
            <div v-if="carregando" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando produto...</p>
            </div>
            
            <div v-else-if="erro" class="erro-container">
                <h2>Erro ao carregar produto</h2>
                <p>{{ erro }}</p>
                <router-link to="/pesquisas" class="btn-voltar">Voltar para Produtos</router-link>
            </div>
            
            <div v-else-if="produto" class="produto-content">
                <!-- Breadcrumb -->
                <div class="breadcrumb">
                    <button @click="voltarPaginaAnterior" class="btn-voltar-breadcrumb">
                        ← Voltar
                    </button>
                    <span class="separator">|</span>
                    <router-link to="/pesquisas">Produtos</router-link>
                    <span class="separator">/</span>
                    <span>{{ produto.name }}</span>
                </div>
                
                <div class="produto-grid">
                    <!-- Área da Imagem do Produto -->
                    <div class="produto-imagem-area">
                        <!-- Imagem Principal -->
                        <div class="produto-imagem-container">
                            <img :src="imagemAtiva === 1 ? produto.image_path : produto.image_path" 
                                 :alt="produto.name" 
                                 :class="['produto-imagem', { 'invertida': imagemAtiva === 1 }]" />
                            <div class="status-produto">
                                <img :src="produto.stock >= 1 ? DISPONIVELREAL : INDISPONIVELREAL" 
                                    :alt="produto.stock >= 1 ? 'Disponível' : 'Indisponível'" 
                                    class="status-selo" />
                            </div>
                        </div>
                        
                        <!-- Miniaturas Abaixo -->
                        <div class="miniaturas-container">
                            <div class="miniatura-item" 
                                 :class="{ 'ativo': imagemAtiva === 0 }"
                                 @click="selecionarImagem(0)">
                                <img :src="produto.image_path" :alt="produto.name" class="miniatura-img" />
                            </div>
                            <div class="miniatura-item" 
                                 :class="{ 'ativo': imagemAtiva === 1 }"
                                 @click="selecionarImagem(1)">
                                <img :src="produto.image_path" :alt="produto.name" class="miniatura-img invertida" />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Informações do Produto -->
                    <div class="produto-info">
                        <h1 class="produto-titulo">{{ produto.name }}</h1>
                        
                        <div class="produto-preco-container">
                            <span class="produto-preco">R$ {{ formatarPreco(produto.price) }}</span>
                            <div v-if="produto.discounts && produto.discounts.length > 0" class="descontos">
                                <span v-for="desconto in produto.discounts" :key="desconto.id" class="desconto-badge">
                                    -{{ desconto.discount_percentage }}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="produto-categoria">
                            <span class="categoria-label">Categoria:</span>
                            <span class="categoria-nome">{{ produto.category?.name || 'Sem categoria' }}</span>
                        </div>
                        
                        <div class="produto-estoque">
                            <span class="estoque-label">Estoque:</span>
                            <span :class="['estoque-quantidade', { 'baixo': produto.stock <= 5 }]">
                                {{ produto.stock }} unidades
                            </span>
                        </div>
                        
                        <div v-if="produto.description" class="produto-descricao">
                            <h3>Descrição</h3>
                            <p>{{ produto.description }}</p>
                        </div>
                        
                        <!-- Seletor de Quantidade -->
                        <div class="quantidade-container">
                            <label for="quantidade" class="quantidade-label">Quantidade:</label>
                            <div class="quantidade-controles">
                                <button 
                                    @click="diminuirQuantidade" 
                                    :disabled="quantidade <= 1"
                                    class="btn-quantidade">
                                    -
                                </button>
                                <input 
                                    id="quantidade"
                                    v-model.number="quantidade" 
                                    type="number" 
                                    min="1" 
                                    :max="produto.stock"
                                    class="quantidade-input"
                                    @input="validarQuantidade"
                                />
                                <button 
                                    @click="aumentarQuantidade" 
                                    :disabled="quantidade >= produto.stock"
                                    class="btn-quantidade">
                                    +
                                </button>
                            </div>
                        </div>
                        
                        <!-- Ações do Produto -->
                        <div class="produto-acoes">
                            <div class="acoes-principais">
                                <button 
                                    v-if="!produtoEstaNoCarrinho(produto.id)" 
                                    @click="adicionarAoCarrinho(produto)"
                                    class="btn-adicionar"
                                    :disabled="produto.stock < 1">
                                    <img src="../components/img/maisumcarrinho.png" alt="" class="carrinho-icon">
                                    <span>Adicionar ao Carrinho</span>
                                </button>
                                <button 
                                    v-else 
                                    @click="removerDoCarrinho(produto)" 
                                    class="btn-remover">
                                    <img src="../components/img/maisumcarrinho.png" alt="" class="carrinho-icon">
                                    <span>Remover do Carrinho</span>
                                </button>
                                
                                <button 
                                    @click="toggleFavorito(produto.id)"
                                    class="btn-favorito"
                                    :class="{ 'ativo': produtoEstaNosFavoritos(produto.id) }">
                                    <img :src="produtoEstaNosFavoritos(produto.id) ? CORACAOFAV : CORACAOVAZIO" alt="">
                                    <span>{{ produtoEstaNosFavoritos(produto.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Botão Voltar -->
                <div class="voltar-container">
                    <router-link to="/pesquisas" class="btn-voltar">
                        ← Voltar para Produtos
                    </router-link>
                </div>
            </div>
        </div>
        
        <Footer></Footer>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Header from '../components/Headercomponent.vue'
import Footer from '../components/Footercomponent.vue'
import api, { getProduto, adicionarItemCarrinho, removerItemCarrinho, getItensCarrinho } from '../services/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Estados
const carregando = ref(true)
const erro = ref(null)
const produto = ref(null)
const itensCarrinho = ref([])
const quantidade = ref(1)

// Verificação de login
const isLoggedIn = computed(() => !!api.defaults.headers.common['Authorization'])

// Variável reativa para forçar atualização dos favoritos
const favoritosAtualizados = ref(0)

// Estado da galeria de imagens
const imagemAtiva = ref(0)

// Imagens
import DISPONIVELREAL from '../components/img/DISPONIVELREAL.png'
import INDISPONIVELREAL from '../components/img/INDISPONIVELREAL.png'
import CORACAOFAV from '../components/img/coraçaofav.png'
import CORACAOVAZIO from '../components/img/coraçaovazio.png'

// Funções
function formatarPreco(preco) {
    return parseFloat(preco).toFixed(2).replace('.', ',')
}

// Função para verificar se um produto está no carrinho
const produtoEstaNoCarrinho = (produtoId) => {
    return itensCarrinho.value.some(item => item.product_id === produtoId)
}

// Função para verificar se um produto está nos favoritos
const produtoEstaNosFavoritos = (produtoId) => {
    // Usar a variável reativa para forçar recálculo
    favoritosAtualizados.value
    
    const favoritosStorage = localStorage.getItem('favoritos')
    if (favoritosStorage) {
        const favoritosIds = JSON.parse(favoritosStorage)
        return favoritosIds.includes(produtoId)
    }
    return false
}

function diminuirQuantidade() {
    if (quantidade.value > 1) {
        quantidade.value--
    }
}

function aumentarQuantidade() {
    if (quantidade.value < produto.value.stock) {
        quantidade.value++
    }
}

function validarQuantidade() {
    if (quantidade.value < 1) {
        quantidade.value = 1
    } else if (quantidade.value > produto.value.stock) {
        quantidade.value = produto.value.stock
    }
}

async function carregarProduto() {
    try {
        carregando.value = true
        const produtoId = route.params.id
        const dados = await getProduto(produtoId)
        produto.value = dados
    } catch (error) {
        console.error('Erro ao carregar produto:', error)
        erro.value = 'Erro ao carregar detalhes do produto'
    } finally {
        carregando.value = false
    }
}

// Função para carregar carrinho
async function carregarCarrinho() {
    if (!isLoggedIn.value) return
    
    try {
        const dadosCarrinho = await getItensCarrinho()
        itensCarrinho.value = dadosCarrinho.items || []
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
        itensCarrinho.value = []
    }
}

// Função para adicionar produto ao carrinho
async function adicionarAoCarrinho(produto) {
    if (!isLoggedIn.value) {
        toast.error('Faça login para adicionar produtos ao carrinho.')
        return
    }
    
    if (produto.stock < 1) {
        toast.error('Produto indisponível no momento.')
        return
    }
    
    // Verificar se produto já está no carrinho
    if (produtoEstaNoCarrinho(produto.id)) {
        toast.error('Produto já está no carrinho.')
        return
    }
    
    try {
        // Primeiro, garantir que o carrinho existe
        try {
            await api.post('/cart/')
        } catch (cartError) {
            // Carrinho já existe
        }
        
        // Converter preço para número se for string
        const precoUnitario = typeof produto.price === 'string' ? parseFloat(produto.price) : produto.price
        
        await adicionarItemCarrinho(produto.id, quantidade.value, precoUnitario)
        toast.success(`Produto adicionado ao carrinho! (${quantidade.value} unidade${quantidade.value > 1 ? 's' : ''})`, { timeout: 3500 })
        await carregarCarrinho() // Recarregar carrinho
        
        // Notificar outros componentes sobre a mudança no carrinho
        window.dispatchEvent(new Event('carrinho-atualizado'))
    } catch (error) {
        console.error('Erro ao adicionar produto:', error)
        toast.error('Erro ao adicionar produto ao carrinho.')
    }
}

// Função para remover produto do carrinho
async function removerDoCarrinho(produto) {
    try {
        await removerItemCarrinho(produto.id)
        toast.success('Produto removido do carrinho!', { timeout: 3500 })
        await carregarCarrinho() // Recarregar carrinho
        
        // Notificar outros componentes sobre a mudança no carrinho
        window.dispatchEvent(new Event('carrinho-atualizado'))
    } catch (error) {
        console.error('Erro ao remover produto:', error)
        toast.error('Erro ao remover produto do carrinho.')
    }
}

// Função para adicionar/remover dos favoritos
function toggleFavorito(produtoId) {
    const favoritosStorage = localStorage.getItem('favoritos')
    let favoritosIds = []
    
    if (favoritosStorage) {
        favoritosIds = JSON.parse(favoritosStorage)
    }
    
    if (produtoEstaNosFavoritos(produtoId)) {
        // Remover dos favoritos
        favoritosIds = favoritosIds.filter(id => id !== produtoId)
        toast.success('Produto removido dos favoritos!', { timeout: 3500 })
    } else {
        // Adicionar aos favoritos
        favoritosIds.push(produtoId)
        toast.success('Produto adicionado aos favoritos!', { timeout: 3500 })
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritosIds))
    
    // Forçar atualização da interface
    favoritosAtualizados.value++
}

// Função para selecionar imagem na galeria
function selecionarImagem(index) {
    imagemAtiva.value = index
}

// Função para voltar à página anterior
function voltarPaginaAnterior() {
    if (window.history.length > 1) {
        router.go(-1)
    } else {
        // Se não há histórico, vai para a página de produtos
        router.push('/pesquisas')
    }
}

onMounted(async () => {
    await Promise.all([
        carregarProduto(),
        carregarCarrinho()
    ])
})
</script>

<style scoped>
.produto-detalhes {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
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

.erro-container {
    text-align: center;
    padding: 60px;
}

.erro-container h2 {
    color: #e11d48;
    margin-bottom: 16px;
}

.breadcrumb {
    margin-bottom: 30px;
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-voltar-breadcrumb {
    background: #6c757d;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    gap: 4px;
}

.btn-voltar-breadcrumb:hover {
    background: #5a6268;
}

.breadcrumb a {
    color: #4f79a3;
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

.separator {
    margin: 0 4px;
    color: #999;
}

.produto-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
}

.produto-imagem-area {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.miniaturas-container {
    display: flex;
    gap: 12px;
    justify-content: start;
}

.miniatura-item {
    width: 80px;
    height: 80px;
    border: 2px solid #eee;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    background: white;
}

.miniatura-item:hover {
    border-color: #4f79a3;
    transform: scale(1.05);
}

.miniatura-item.ativo {
    border-color: #4f79a3;
    box-shadow: 0 0 0 2px rgba(79, 121, 163, 0.2);
}

.miniatura-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
}

.miniatura-img.invertida {
    transform: scaleX(-1);
}

.produto-imagem-container {
    position: relative;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex: 1;
}

.produto-imagem {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.produto-imagem.invertida {
    transform: scaleX(-1);
}

.status-produto {
    position: absolute;
    bottom: 10px;
    left: 10px;
}

.status-produto img {
    width: 200px;
    height: auto;
    border-radius: 7px;
}

.status-selo {
    width: 60px;
    height: auto;
}

.produto-info {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.produto-titulo {
    font-size: 28px;
    color: #333;
    margin: 0 0 20px 0;
    font-weight: bold;
}

.produto-preco-container {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.produto-preco {
    font-size: 32px;
    font-weight: bold;
    color: #4f79a3;
}

.descontos {
    display: flex;
    gap: 8px;
}

.desconto-badge {
    background: #e11d48;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

.produto-categoria, .produto-estoque {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.categoria-label, .estoque-label {
    font-weight: bold;
    color: #666;
    min-width: 80px;
}

.categoria-nome {
    color: #333;
}

.estoque-quantidade {
    color: #28a745;
    font-weight: bold;
}

.estoque-quantidade.baixo {
    color: #ffc107;
}

.produto-descricao {
    margin: 24px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.produto-descricao h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 18px;
}

.produto-descricao p {
    margin: 0;
    color: #666;
    line-height: 1.6;
}

/* Seletor de Quantidade */
.quantidade-container {
    margin: 24px 0;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.quantidade-label {
    display: block;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
}

.quantidade-controles {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
}

.btn-quantidade {
    width: 40px;
    height: 40px;
    border: 2px solid #4f79a3;
    background: white;
    color: #4f79a3;
    border-radius: 50%;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-quantidade:hover:not(:disabled) {
    background: #4f79a3;
    color: white;
}

.btn-quantidade:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
}

.quantidade-input {
    width: 80px;
    height: 40px;
    text-align: center;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.quantidade-input:focus {
    outline: none;
    border-color: #4f79a3;
}

.produto-acoes {
    margin: 30px 0;
}

.acoes-principais {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn-adicionar, .btn-remover, .btn-favorito {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    justify-content: center;
}

.btn-adicionar {
    background: #4f79a3;
    color: white;
}

.btn-adicionar:hover:not(:disabled) {
    background: #3a5a7a;
    transform: translateY(-1px);
}

.btn-adicionar:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.btn-remover {
    background: #dc3545;
    color: white;
}

.btn-remover:hover {
    background: #c82333;
    transform: translateY(-1px);
}

.btn-favorito {
    background: transparent;
    color: #666;
    border: 2px solid #ddd;
}

.btn-favorito:hover {
    border-color: #4f79a3;
    color: #4f79a3;
}

.btn-favorito.ativo {
    border-color: #e11d48;
    color: #e11d48;
}

.btn-adicionar img, .btn-remover img, .btn-favorito img {
    width: 20px;
    height: 20px;
}

/* Inverter cor do ícone do carrinho */
.carrinho-icon {
    filter: brightness(0) invert(1);
}

.voltar-container {
    text-align: center;
    margin-top: 40px;
}

.btn-voltar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #6c757d;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    transition: background 0.3s;
}

.btn-voltar:hover {
    background: #5a6268;
}

/* Responsividade */
@media (max-width: 768px) {
    .produto-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .produto-imagem-area {
        gap: 16px;
    }
    
    .miniaturas-container {
        justify-content: center;
    }
    
    .miniatura-item {
        width: 60px;
        height: 60px;
    }
    
    .produto-titulo {
        font-size: 24px;
    }
    
    .produto-preco {
        font-size: 28px;
    }
    
    .acoes-principais {
        gap: 8px;
    }
    
    .btn-adicionar, .btn-remover, .btn-favorito {
        padding: 10px 16px;
        font-size: 14px;
    }
    
    .quantidade-controles {
        gap: 8px;
    }
    
    .btn-quantidade {
        width: 36px;
        height: 36px;
        font-size: 16px;
    }
    
    .quantidade-input {
        width: 70px;
        height: 36px;
        font-size: 14px;
    }
}
</style> 
