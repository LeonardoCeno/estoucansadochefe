<template>

<div class="tudo" >
<div class="comercial" >
    <img src="./img/CEHGAAAAA-Photoroom.png" alt="">
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
        <router-link :to="`/produto/${produto.id}`" class="produto-link">
        <img :src="produto.image_path" alt="Imagem do produto" class="produto-imagem" />
        <img :src="produto.stock >= 1 ? DISPONIVELREAL : INDISPONIVELREAL" :alt="produto.stock >= 1 ? 'Disponível' : 'Indisponível'" class="disponivel-selo" />
        <h4>{{ produto.name }}</h4>
        <p>R$ {{ produto.price }}</p>
        </router-link>
        </div>
        <div class="add">
        <button @click="cartStore.toggleCarrinho(produto)">
            <img :src="MAISUMCARRINHO" alt="">
            <p>{{ cartStore.produtoEstaNoCarrinho(produto.id) ? 'Remover' : 'Adicionar' }}</p>
        </button>
        <img :src="favoritesStore.estaNosFavoritos(produto.id) ? CORACAOFAV : CORACAOVAZIO" alt="" @click="favoritesStore.toggleFavorito(produto.id)" style="cursor: pointer;" :class="{ 'coracao-favorito': favoritesStore.estaNosFavoritos(produto.id) }">
        </div>
    </div>
    </div>
    <div class="borda-mostrar" >
    <button class="mostrar-mais" @click="irParaMangás">
        Mostrar mais
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
        <router-link :to="`/produto/${produto.id}`" class="produto-link">
        <img :src="produto.image_path" alt="Imagem do produto" class="produto-imagem" />
        <img :src="produto.stock >= 1 ? DISPONIVELREAL : INDISPONIVELREAL" :alt="produto.stock >= 1 ? 'Disponível' : 'Indisponível'" class="disponivel-selo" />
        <h4>{{ produto.name }}</h4>
        <p>R$ {{ produto.price }}</p>
        </router-link>
        </div>
        <div class="add" >
        <button @click="cartStore.toggleCarrinho(produto)">
            <img :src="MAISUMCARRINHO" alt="">
            <p>{{ cartStore.produtoEstaNoCarrinho(produto.id) ? 'Remover' : 'Adicionar' }}</p>
        </button>
        <img :src="favoritesStore.estaNosFavoritos(produto.id) ? CORACAOFAV : CORACAOVAZIO" alt="" @click="favoritesStore.toggleFavorito(produto.id)" style="cursor: pointer;" :class="{ 'coracao-favorito': favoritesStore.estaNosFavoritos(produto.id) }">
        </div>
    </div>
    </div>
    <div class="borda-mostrar">
    <button class="mostrar-mais" @click="irParaLivros">
        Mostrar mais
    </button>
    </div>
</div>
</div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'
import { useFavoritesStore } from '../stores/favorites'
import { useRouter } from 'vue-router'

import DISPONIVELREAL from './img/DISPONIVELREAL.png'
import INDISPONIVELREAL from './img/INDISPONIVELREAL.png'
import CORACAOFAV from './img/coraçaofav.png'
import CORACAOVAZIO from './img/coraçaovazio.png'
import MAISUMCARRINHO from './img/maisumcarrinho.png'

const apiBase = 'http://35.196.79.227:8000'
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const produtos = ref([])
const carregando = ref(true)
const erro = ref(null)

// Verificar se o usuário está logado (usando o store)
const isLoggedIn = computed(() => userStore.isAuthenticated)

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
            await cartStore.carregarCarrinho()
        }
    } catch (e) {
        erro.value = 'Erro ao carregar produtos'
    } finally {
        carregando.value = false
    }
})

const produtosVisiveisObras = computed(() => {
    return produtos.value.slice(0, 10)
})

const produtosVisiveisOfertas = computed(() => {
    return produtos.value.slice(0, 10)
})

function irParaMangás() {
    router.push({ path: '/pesquisas', query: { categoriaId: 318 } })
}

function irParaLivros() {
    router.push({ path: '/pesquisas', query: { categoriaId: 316 } })
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
    background: linear-gradient(to right,  hsl(194, 100%, 38%),  #4f96a3);
    height: 4.5rem;
    width: 100%;
    max-width: 1250px;
    margin-bottom: 30px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

#cord {
    background: linear-gradient(to right, hsl(145, 100%, 38%), #4fa36c);
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
    left: 10px;
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
    
    /* Botões sempre visíveis no tablet - sem hover */
    .add {
        opacity: 1 !important;
        pointer-events: auto !important;
    }
    
    /* Reduzir margin-top do título em tablets */
    .titulo {
        margin-top: 12px !important;
    }
}
@media (max-width: 700px) {
    .lista {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 8px;
    }
    .produto {
        width: 100%;
        margin-top: 2vh;
        padding: 8px;
    }
    .titulo, .soumdetalhe, .comercial img, .produtos {
        max-width: 98vw;
    }
    
    /* Reduzir margin-top do título em mobile grande */
    .titulo {
        margin-top: 8px !important;
    }
    
    .nome-preco-imagem img {
        height: 200px;
        width: 140px;
    }
    .produto h4 {
        font-size: 13px;
        height: 35px;
    }
    .nome-preco-imagem p {
        font-size: 18px;
    }
    .add button {
        width: 120px;
        padding: 6px;
        gap: 5px;
    }
    .add button p {
        font-size: 12px;
    }
    .add button img {
        width: 16px;
    }
    .add img {
        width: 22px;
    }
    .disponivel-selo {
        width: 95px !important;
        bottom: 65px !important;
        left: 40px !important;
        height: 25px !important;
    }
    
    /* Botões sempre visíveis no mobile - sem hover */
    .add {
        opacity: 1 !important;
        pointer-events: auto !important;
        margin-top: 8px !important;
        margin-bottom: 8px !important;
    }
    
    /* Remover hover effect no mobile para melhor UX touch */
    .produto:hover .add {
        opacity: 1;
    }
    
    /* Melhorar espaçamento dos botões no mobile */
    .add button {
        min-height: 40px;
        touch-action: manipulation;
    }
    
    .add img {
        width: 24px !important;
        height: 24px !important;
    }
}
@media (max-width: 480px) {
    .lista {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 8px;
    }
    .produto {
        width: 100%;
        margin-top: 2vh;
        padding: 6px;
    }
    .titulo, .soumdetalhe, .comercial img, .produtos {
        max-width: 100vw;
    }
    
    /* Reduzir margin-top do título em mobile pequeno */
    .titulo {
        margin-top: 3px !important;
    }
    
    .nome-preco-imagem img {
        height: 180px !important;
        width: 125px !important;
    }
    .produto h4 {
        font-size: 12px !important;
        height: 30px !important;
        margin-top: 8px !important;
    }
    .nome-preco-imagem p {
        font-size: 16px !important;
    }
    .add button {
        width: 100px !important;
        padding: 5px !important;
        gap: 4px !important;
    }
    .add button p {
        font-size: 11px !important;
    }
    .add button img {
        width: 14px !important;
    }
    .add img {
        width: 20px !important;
        height: 20px !important;
    }
    .disponivel-selo {
        width: 75px !important;
        bottom: 65px !important;
        left: 8px !important;
        height: 20px !important;
        max-width: 75px !important;
        max-height: 20px !important;
    }
    
    /* Botões sempre visíveis no mobile pequeno - sem hover */
    .add {
        opacity: 1 !important;
        pointer-events: auto !important;
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