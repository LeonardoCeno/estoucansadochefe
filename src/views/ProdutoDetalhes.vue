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
                    <span>Início</span>
                    <span class="separator">></span>
                    <span>{{ produto.name }}</span>
                </div>
                
                <div class="produto-grid">
                    <!-- Área da Imagem do Produto -->
                    <div class="produto-imagem-area">
                        <div class="produto-imagem-container">
                            <img :src="produto.image_path" 
                                    :alt="produto.name" 
                                    class="produto-imagem" />
                        </div>
                    </div>
                    
                    <!-- Informações do Produto -->
                    <div class="produto-info">
                        <h1 class="produto-titulo">{{ produto.name }}</h1>
                        
                        <div class="produto-preco-container">
                            <span class="produto-preco-atual">R$ {{ produto.price }}</span>
                            <div class="parcela-info">1X de R$ {{ produto.price }} sem juros</div>
                        </div>
                        
                        <div class="estoque-info">
                            <span class="estoque-status">EM ESTOQUE</span>
                            <span class="estoque-quantidade">{{ produto.stock }} itens</span>
                        </div>
                        
                        <!-- Seletor de Quantidade -->
                        <div class="quantidade-container">
                            <div class="quantidade-controles">
                                <button 
                                    @click="diminuirQuantidade" 
                                    :disabled="quantidade <= 1"
                                    class="btn-quantidade">
                                    -
                                </button>
                                <input 
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
                            <div class="add">
                                <button 
                                    @click="toggleCarrinhoComLogin(produto)"
                                    :disabled="produto.stock < 1">
                                    <img :src="MAISUMCARRINHO" alt="">
                                    <p>{{ cartStore.produtoEstaNoCarrinho(produto.id) ? 'Remover' : 'Adicionar' }}</p>
                                </button>
                                
                                <img :src="favoritesStore.estaNosFavoritos(produto.id) ? CORACAOFAV : CORACAOVAZIO" 
                                     alt="" 
                                     @click="favoritesStore.toggleFavorito(produto.id)" 
                                     :class="{ 'coracao-favorito': favoritesStore.estaNosFavoritos(produto.id) }">
                            </div>
                        </div>
                        

                    </div>
                </div>
                
                <!-- Descrição Separada -->
                <div v-if="produto.description" class="descricao-separada">
                    <h3>Descrição do Produto</h3>
                    <p>{{ produto.description }}</p>
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
import api, { getProduto } from '../services/api'
import { useCartStore } from '../stores/cart'
import { useFavoritesStore } from '../stores/favorites'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Estados
const carregando = ref(true)
const erro = ref(null)
const produto = ref(null)

const quantidade = ref(1)

// Verificação de login otimizada
const isLoggedIn = computed(() => {
    const token = localStorage.getItem('token')
    return !!token && !!api.defaults.headers.common['Authorization']
})



// Imagens
import CORACAOFAV from '../components/img/coraçaofav.png'
import CORACAOVAZIO from '../components/img/coraçaovazio.png'
import MAISUMCARRINHO from '../components/img/maisumcarrinho.png'

// Stores
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

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

// Função para adicionar/remover do carrinho com verificação de login
async function toggleCarrinhoComLogin(produto) {
    if (!isLoggedIn.value) {
        toast.error('Faça login para adicionar produtos ao carrinho.')
        return
    }
    
    // Se o produto não está no carrinho, adicionar com a quantidade selecionada
    if (!cartStore.produtoEstaNoCarrinho(produto.id)) {
        const precoUnitario = typeof produto.price === 'string' ? parseFloat(produto.price) : produto.price
        await cartStore.adicionarItem(produto.id, quantidade.value, precoUnitario, produto.image_path)
    } else {
        // Se já está no carrinho, remover usando a função específica
        await cartStore.removerItemDoCarrinho({product_id: produto.id})
    }
}







onMounted(async () => {
    // Fazer scroll para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Carregar produto primeiro (prioridade)
    await carregarProduto()
    
    // Carregar carrinho apenas se usuário estiver logado
    if (isLoggedIn.value) {
        await cartStore.carregarCarrinho()
    }
    
    // Carregar favoritos
    favoritesStore.carregarFavoritos()
})


</script>

<style scoped>
.produto-detalhes {
    min-height: 100vh;
    background-image: url(../components/img/fundaogeral.jpg);
    background-size: cover;
    background: linear-gradient(to bottom, #fcfcfc50 0%, #7fbbce59 60%, #4e46e548 100%);
    background-repeat: no-repeat;
    background-blend-mode: overlay;
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
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
}

.separator {
    margin: 0 4px;
    color: #666;
}

.produto-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 30px;
}

.produto-imagem-area {
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.produto-imagem-container {
    width: 100%;
    max-width: 350px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.produto-imagem {
    width: 100%;
    height: auto;
    display: block;
}

.produto-info {
    padding: 15px 0;
}

.produto-titulo {
    font-size: 40px;
    color: #333;
    margin: 0 0 15px 0;
    font-weight: 600;
    line-height: 1.3;
}

.produto-preco-container {
    margin-bottom: 15px;
}

.produto-preco-atual {
    display: block;
    font-size: 30px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}

.parcela-info {
    font-size: 14px;
    color: #666;
}

.estoque-info {
    margin-bottom: 15px;
}

.estoque-status {
    display: block;
    font-size: 14px;
    color: #333;
    font-weight: 600;
    margin-bottom: 5px;
}

.estoque-quantidade {
    font-size: 14px;
    color: #707070;
}

.quantidade-container {
    margin-bottom: 15px;
}

.quantidade-controles {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-start;
}

.btn-quantidade {
    width: 35px;
    height: 35px;
    border: 1px solid #ddd;
    background: white;
    color: #333;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-quantidade:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #999;
}

.btn-quantidade:disabled {
    border-color: #eee;
    color: #ccc;
    cursor: not-allowed;
}

.quantidade-input {
    width: 60px;
    height: 35px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
}

.quantidade-input:focus {
    outline: none;
    border-color: #007bff;
}

.produto-acoes {
    margin-bottom: 20px;
}

.add {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: flex-start;
    gap: 15px;
    margin-top: 15px;
    margin-bottom: 15px;
}

.add button {
    display: flex;
    align-items: center;
    background-color: #030a11f5;
    justify-content: center;
    padding: 15px 20px;
    border-radius: 7px;
    gap: 8px;
    width: 180px;
    border: none;
    cursor: pointer;
}

.add button:hover {
    background-color: #02060ac2;
}

.add button p {
    color: white;
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}

.add button img {
    width: 20px;
    height: 20px;
    border: none;
    filter: invert(1);
}

.add img {
    width: 40px;
    height: 40px;
    filter: invert(6%) sepia(50%) saturate(200%) hue-rotate(160deg) brightness(100%) contrast(100%);
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.add img:hover {
    opacity: 0.8;
}

/* Estilo para coração vermelho quando está nos favoritos */
.add img.coracao-favorito {
    filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}



.descricao-separada {
    margin-top: 30px;
    padding: 25px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.descricao-separada h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #333;
    font-weight: 600;
}

.descricao-separada p {
    margin: 0;
    color: #666;
    line-height: 1.6;
    font-size: 14px;
}

/* Responsividade */
@media (max-width: 768px) {
    .produto-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .produto-titulo {
        font-size: 20px;
    }
    
    .produto-preco-atual {
        font-size: 24px;
    }
    

}
</style> 