<template>

<div class="tudo" >
<div class="comercial" >
    <img src="./img/bannerbaguazera.png" alt="">
</div>
<div class="titulo" >
    <div class="linebranca" ></div>
<h3>PRINCIPAIS OBRAS</h3>
    <div class="linebranca" ></div>
</div>
<div class="soumdetalhe"></div>
<div class="produtos" >
    <div v-if="carregando" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando produtos...</p>
    </div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div class="lista" v-else>
        <div class="produto" v-for="produto in produtosVisiveisObras" :key="produto.id">
        <div class="nome-preco-imagem" style="position:relative;">
        <img :src="produto.image_path" alt="Imagem do produto" class="produto-imagem" />
        <img :src="produto.stock >= 1 ? DISPONIVELREAL : INDISPONIVELREAL" :alt="produto.stock >= 1 ? 'Disponível' : 'Indisponível'" class="disponivel-selo" />
        <h4>{{ produto.name }}</h4>
        <p>R$ {{ produto.price }}</p>
        </div>
        <div class="add">
        <button v-if="!produtoEstaNoCarrinho(produto.id)" @click="adicionarAoCarrinho(produto)">
            <img src="./img/maisumcarrinho.png" alt="">
            <p>Adicionar</p>
        </button>
        <button v-else @click="removerDoCarrinho(produto)" class="remover-btn">
            <img src="./img/maisumcarrinho.png" alt="">
            <p>Remover</p>
        </button>
        <img :src="produtoEstaNosFavoritos(produto.id) ? CORACAOFAV : CORACAOVAZIO" alt="" @click="toggleFavorito(produto.id)" style="cursor: pointer;" :class="{ 'coracao-favorito': produtoEstaNosFavoritos(produto.id) }">
        </div>
    </div>
    </div>
    <div class="borda-mostrar" >
    <button v-if="produtos.length > 10" class="mostrar-mais" @click="alternarObras">
        {{ estadoBotaoObras === 'mais' ? 'Mostrar mais' : 'Mostrar menos' }}
    </button>
    </div>
</div>
<div class="comercial" >
    <img src="./img/bannerbaguazera3.png" alt="">
</div>
<div id="cord" class="titulo" >
    <div class="linebranca" ></div>
<h3>OFERTAS</h3>
<div class="linebranca" ></div>
</div>
<div class="soumdetalhe"></div>
<div class="produtos" >
    <div v-if="carregando" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando produtos...</p>
    </div>
    <div v-else-if="erro" class="erro">{{ erro }}</div>
    <div class="lista" v-else>
        <div class="produto" v-for="produto in produtosVisiveisOfertas" :key="produto.id">
        <div class="nome-preco-imagem" style="position:relative;">
        <img :src="produto.image_path" alt="Imagem do produto" class="produto-imagem" />
        <img :src="produto.stock >= 1 ? DISPONIVELREAL : INDISPONIVELREAL" :alt="produto.stock >= 1 ? 'Disponível' : 'Indisponível'" class="disponivel-selo" />
        <h4>{{ produto.name }}</h4>
        <p>R$ {{ produto.price }}</p>
        </div>
        <div class="add" >
        <button v-if="!produtoEstaNoCarrinho(produto.id)" @click="adicionarAoCarrinho(produto)">
            <img src="./img/maisumcarrinho.png" alt="">
            <p>Adicionar</p>
        </button>
        <button v-else @click="removerDoCarrinho(produto)" class="remover-btn">
            <img src="./img/maisumcarrinho.png" alt="">
            <p>Remover</p>
        </button>
        <img :src="produtoEstaNosFavoritos(produto.id) ? CORACAOFAV : CORACAOVAZIO" alt="" @click="toggleFavorito(produto.id)" style="cursor: pointer;" :class="{ 'coracao-favorito': produtoEstaNosFavoritos(produto.id) }">
        </div>
    </div>
    </div>
    <div class="borda-mostrar">
    <button v-if="produtos.length > 10" class="mostrar-mais" @click="alternarOfertas">
        {{ estadoBotaoOfertas === 'mais' ? 'Mostrar mais' : 'Mostrar menos' }}
    </button>
    </div>
</div>
</div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api, { adicionarItemCarrinho, removerItemCarrinho, getItensCarrinho } from '../services/api'
import { useToast } from 'vue-toastification'

import DISPONIVELREAL from './img/DISPONIVELREAL.png'
import INDISPONIVELREAL from './img/INDISPONIVELREAL.png'
import CORACAOFAV from './img/coraçaofav.png'
import CORACAOVAZIO from './img/coraçaovazio.png'

const apiBase = 'http://35.196.79.227:8000'
const produtos = ref([])
const carregando = ref(true)
const erro = ref(null)
const mostrarQuantidadeObras = ref(10)
const mostrarQuantidadeOfertas = ref(10)
const estadoBotaoObras = ref('mais') // 'mais' ou 'menos'
const estadoBotaoOfertas = ref('mais')
const toast = useToast()

// Variável reativa para forçar atualização dos favoritos
const favoritosAtualizados = ref(0)

// Verificar se o usuário está logado
const isLoggedIn = computed(() => {
    const token = localStorage.getItem('token')
    return !!token && !!api.defaults.headers.common['Authorization']
})

// Carrinho
const itensCarrinho = ref([])

// Função para verificar se um produto está no carrinho
const produtoEstaNoCarrinho = (produtoId) => {
    return itensCarrinho.value.some(item => item.product_id === produtoId)
}

// Função para obter quantidade de um produto no carrinho
const getQuantidadeNoCarrinho = (produtoId) => {
    const item = itensCarrinho.value.find(item => item.product_id === produtoId)
    return item ? item.quantity : 0
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

onMounted(async () => {
    try {
        const resposta = await api.get('/products/user/228')
        produtos.value = resposta.data.map(produto => ({
            ...produto,
            image_path: produto.image_path && !produto.image_path.startsWith('http')
                ? apiBase + produto.image_path
                : produto.image_path
        }))
        
        // Carregar carrinho se usuário estiver logado
        if (isLoggedIn.value) {
            await carregarCarrinho()
        }
    } catch (e) {
        erro.value = 'Erro ao carregar produtos'
    } finally {
        carregando.value = false
    }
})

const produtosVisiveisObras = computed(() => {
    return produtos.value.slice(0, mostrarQuantidadeObras.value)
})

const produtosVisiveisOfertas = computed(() => {
    return produtos.value.slice(0, mostrarQuantidadeOfertas.value)
})

function alternarObras() {
    if (estadoBotaoObras.value === 'mais') {
        mostrarQuantidadeObras.value = Math.min(produtos.value.length, mostrarQuantidadeObras.value + 10)
        estadoBotaoObras.value = 'menos'
    } else {
        mostrarQuantidadeObras.value = Math.max(10, mostrarQuantidadeObras.value - 10)
        if (mostrarQuantidadeObras.value === 10) {
            estadoBotaoObras.value = 'mais'
        }
    }
}

function alternarOfertas() {
    if (estadoBotaoOfertas.value === 'mais') {
        mostrarQuantidadeOfertas.value = Math.min(produtos.value.length, mostrarQuantidadeOfertas.value + 10)
        estadoBotaoOfertas.value = 'menos'
    } else {
        mostrarQuantidadeOfertas.value = Math.max(10, mostrarQuantidadeOfertas.value - 10)
        if (mostrarQuantidadeOfertas.value === 10) {
            estadoBotaoOfertas.value = 'mais'
        }
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
        
        await adicionarItemCarrinho(produto.id, 1, precoUnitario)
        toast.success('Produto adicionado ao carrinho!', { timeout: 3500 })
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

</script>


<style scoped>

.borda-mostrar {
    display: flex;
    justify-content: center;
    position: relative;
    height: 50px;
    width: 159px;
    border: 1px solid #e2e2e2;
    border-top: 2px solid white;
    background: white;
    margin-bottom: 40px;
    z-index: 1000;
    bottom: 1px;
}

.borda-mostrar button {
    height: 40px;
    min-width: 135px;
    display: block;
    padding: 6px 18px;
    background-color: #010203ec;
    color: #e4e4e4;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: bold;
    cursor: pointer;
}

.linebranca {
    width: 20vw;
    height: 1px;
    background-color: #ffffff;
}

.tudo {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.titulo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    background-color: #4f79a3;
    height: 4.5rem;
    width: 100%;
    max-width: 1250px;
    margin-bottom: 30px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

#cord {
    background-color: #3a9c73;
}

.titulo h3 {
    font-size: 26px;
    color: rgb(255, 255, 255);
}

.produtos {
    width: 100%;
    max-width: 1250px;
}

.nome-preco-imagem {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.nome-preco-imagem p {
    font-size: 22px;
    color: rgb(37, 37, 37);
    font-weight: bold;
}

.nome-preco-imagem img {
    margin-top: 10px;
    height: 225px;
    width: 160px;
    border: 0.1px solid rgb(212, 212, 212);
    filter: contrast(100%);
}

.nome-preco-imagem .disponivel-selo {
    width: 95px;
    height: auto;
    border: none;
}

.add {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 12px;
    opacity: 0;
    pointer-events: none;
    margin-top: 5px;
    margin-bottom: 10px;
    padding-bottom: 10px;
}

.add button {
    display: flex;
    align-items: center;
    background-color: #030a11f5;
    justify-content: center;
    padding: 8px;
    border-radius: 7px;
    gap: 7px;
    width: 150px;
}

.add button:hover {
    background-color: #02060ac2;
}



.add button p {
    color: white;
}

.add button img {
    width: 20px;
    height: auto;
    border: none;
    filter: invert(1);
}

.add img {
    width: 28px;
    height: auto;
    filter: invert(6%) sepia(50%) saturate(200%) hue-rotate(160deg) brightness(100%) contrast(100%);
}

.add img:hover {
    opacity: 0.8;
}

/* Estilo para coração vermelho quando está nos favoritos */
.add img.coracao-favorito {
    filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}

.produto {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    width: 230px;
    height: 92%;
    margin-top: 3vh;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 5px;
    border: 0.5px solid transparent;
}

.produto:hover .add {
    opacity: 1;
    pointer-events: auto;
}

.produto:hover {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.116);
    border-color: rgba(0, 0, 0, 0.555);
}

.produto h4 {
    font-family: sans-serif;
    font-size: 15px;
    color: rgb(65, 65, 65);
    margin-top: 10px;
    height: 40px;
}

.lista {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    justify-items: center;
    padding: 4px;
    position: relative;
    gap: 10px;
    border: 1px solid #e2e2e2;
    border-top: none;
    background-color: white;
}

.mostrar-mais:hover {
    background-color: #02060acc;
    text-decoration: underline;
}

.soumdetalhe {
    width: 100%;
    max-width: 1250px;
    height: 1px;
    background-color: #838383;
    margin: 0 auto;
}

.comercial img {
    width: 100%;
    max-width: 1250px;
    height: auto;
    display: block;
    margin: 0 auto;
    transform: translateY(-3px);
}

.disponivel-selo {
    position: absolute;
    left: 0px;
    bottom: 80px;
    width: 80px;
    height: auto;
    z-index: 2;
    border-radius: 9px;
}

@media (max-width: 1200px) {
    .lista {
        grid-template-columns: repeat(4, 1fr);
    }
}
@media (max-width: 950px) {
    .lista {
        grid-template-columns: repeat(3, 1fr);
    }
}
@media (max-width: 700px) {
    .lista {
        grid-template-columns: repeat(2, 1fr);
    }
    .titulo, .soumdetalhe, .comercial img, .produtos {
        max-width: 98vw;
    }
}
@media (max-width: 480px) {
    .lista {
        grid-template-columns: 1fr;
    }
    .produto {
        width: 95vw;
        min-width: 0;
        padding-left: 2vw;
        padding-right: 2vw;
    }
    .titulo, .soumdetalhe, .comercial img, .produtos {
        max-width: 100vw;
    }
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

</style>