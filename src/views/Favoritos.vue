<template>
    <div class="tudo">
        <div class="titulo">
            <h3>MEUS FAVORITOS</h3>
        </div>
        <div class="soumdetalhe"></div>
        <div v-if="favoritos.length > 0" class="botao-remover-todos">
            <button @click="mostrarConfirmacao" class="btn-remover-todos">
                <span style="font-size: 16px; font-weight: bold; color: white;">✕</span>
                <span>Remover Todos</span>
            </button>
        </div>
        <div v-if="mostrarModal" class="modal-overlay" @click="fecharModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Excluir TODOS os favoritos?</h3>
                </div>
                <div class="modal-body">
                    <p>Tem certeza que deseja remover todos os produtos dos seus favoritos?</p>
                    <p>Esta ação não pode ser desfeita.</p>
                </div>
                <div class="modal-footer">
                    <button @click="fecharModal" class="btn-cancelar">Cancelar</button>
                    <button @click="confirmarRemocao" class="btn-confirmar">Confirmar</button>
                </div>
            </div>
        </div>
        <div class="produtos">
            <div v-if="carregando" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando favoritos...</p>
            </div>
            <div v-else-if="erro" class="erro">{{ erro }}</div>
            <div v-else-if="favoritos.length === 0" class="nenhum-favorito">
                <h2>Nenhum favorito encontrado</h2>
                <p>Adicione produtos aos seus favoritos para vê-los aqui!</p>
            </div>
            <div class="lista" v-else>
                <div class="produto" v-for="produto in favoritos" :key="produto.id">
                    <div class="nome-preco-imagem" style="position:relative;">
                        <img :src="produto.image_path" alt="Imagem do produto" class="produto-imagem" />
                        <img :src="produto.stock >= 1 ? DISPONIVELREAL : INDISPONIVELREAL" :alt="produto.stock >= 1 ? 'Disponível' : 'Indisponível'" class="disponivel-selo" />
                        <h4>{{ produto.name }}</h4>
                        <p>R$ {{ produto.price }}</p>
                    </div>
                    <div class="add">
                        <button v-if="!produtoEstaNoCarrinho(produto.id)" @click="adicionarAoCarrinho(produto)">
                            <img src="../components/img/maisumcarrinho.png" alt="">
                            <p>Adicionar</p>
                        </button>
                        <button v-else @click="removerDoCarrinho(produto)" class="remover-btn">
                            <img src="../components/img/maisumcarrinho.png" alt="">
                            <p>Remover</p>
                        </button>
                        <img src="../components/img/coraçaofav.png" alt="" @click="removerDosFavoritos(produto.id)" style="cursor: pointer;">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api, { adicionarItemCarrinho, removerItemCarrinho, getItensCarrinho } from '../services/api'
import { useToast } from 'vue-toastification'
import DISPONIVELREAL from '../components/img/DISPONIVELREAL.png'
import INDISPONIVELREAL from '../components/img/INDISPONIVELREAL.png'

const toast = useToast()

// Estados reativos
const favoritos = ref([])
const carregando = ref(true)
const erro = ref('')
const itensCarrinho = ref([])
const mostrarModal = ref(false)

// Verificar se o usuário está logado
const isLoggedIn = computed(() => {
    const token = localStorage.getItem('token')
    return !!token && !!api.defaults.headers.common['Authorization']
})

// Carregar dados
onMounted(async () => {
    await carregarFavoritos()
    if (isLoggedIn.value) {
        await carregarCarrinho()
    }
})

// Funções
async function carregarFavoritos() {
    carregando.value = true
    erro.value = ''
    
    try {
        // Simular favoritos usando localStorage
        const favoritosStorage = localStorage.getItem('favoritos')
        if (favoritosStorage) {
            const favoritosIds = JSON.parse(favoritosStorage)
            
            // Buscar produtos da API
            const response = await api.get('/products/user/228')
            const todosProdutos = response.data.map(produto => ({
                ...produto,
                image_path: produto.image_path && !produto.image_path.startsWith('http')
                    ? 'http://35.196.79.227:8000' + produto.image_path
                    : produto.image_path
            }))
            
            // Filtrar apenas os produtos que estão nos favoritos
            favoritos.value = todosProdutos.filter(produto => 
                favoritosIds.includes(produto.id)
            )
        } else {
            favoritos.value = []
        }
    } catch (error) {
        erro.value = 'Erro ao carregar favoritos: ' + error.message
        toast.error('Erro ao carregar favoritos')
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

// Função para verificar se um produto está no carrinho
const produtoEstaNoCarrinho = (produtoId) => {
    return itensCarrinho.value.some(item => item.product_id === produtoId)
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

// Função para remover dos favoritos
function removerDosFavoritos(produtoId) {
    try {
        const favoritosStorage = localStorage.getItem('favoritos')
        let favoritosIds = []
        
        if (favoritosStorage) {
            favoritosIds = JSON.parse(favoritosStorage)
        }
        
        // Remover o produto dos favoritos
        favoritosIds = favoritosIds.filter(id => id !== produtoId)
        localStorage.setItem('favoritos', JSON.stringify(favoritosIds))
        
        // Atualizar a lista de favoritos
        favoritos.value = favoritos.value.filter(produto => produto.id !== produtoId)
        
        toast.success('Produto removido dos favoritos!', { timeout: 3500 })
    } catch (error) {
        console.error('Erro ao remover dos favoritos:', error)
        toast.error('Erro ao remover dos favoritos.')
    }
}

// Função para mostrar modal de confirmação
function mostrarConfirmacao() {
    mostrarModal.value = true
}

// Função para fechar modal
function fecharModal() {
    mostrarModal.value = false
}

// Função para confirmar remoção de todos os favoritos
function confirmarRemocao() {
    try {
        // Limpar todos os favoritos do localStorage
        localStorage.removeItem('favoritos')
        
        // Limpar a lista de favoritos
        favoritos.value = []
        
        // Fechar modal
        mostrarModal.value = false
        
        toast.success('Todos os favoritos foram removidos!', { timeout: 3500 })
    } catch (error) {
        console.error('Erro ao remover todos os favoritos:', error)
        toast.error('Erro ao remover todos os favoritos.')
    }
}
</script>

<style scoped>

.tudo {
    display: flex;
    justify-content: start;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    padding: 20px;
    overflow: hidden;
    box-sizing: border-box;
}

.titulo {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e11d48;
    height: 4.5rem;
    width: 100%;
    max-width: 1250px;
    margin-bottom: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    flex-shrink: 0;
}

.titulo h3 {
    font-size: 26px;
    color: rgb(255, 255, 255);
    margin: 0;
    font-weight: bold;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
}

/* Estilos para o botão remover todos */
.botao-remover-todos {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 5px;
    width: 100%;
    max-width: 1250px;
    padding-left: 20px;
}

.btn-remover-todos {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #02060af5;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.btn-remover-todos:hover {
    background-color: #010203ec;
}

.btn-remover-todos:active {
    transform: scale(0.98);
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
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid #02060af5;
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
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.btn-cancelar:hover {
    background-color: #5a6268;
}

.btn-confirmar {
    background-color: #e11d48;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.btn-confirmar:hover {
    background-color: #c81e3a;
}

.produtos {
    width: 100%;
    max-width: 1250px;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
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
    max-width: 100%;
    border: 0.1px solid rgb(212, 212, 212);
    filter: contrast(100%);
    object-fit: cover;
}

.nome-preco-imagem .disponivel-selo {
    width: 95px;
    height: auto;
    border: none;
    position: absolute;
    left: 0px;
    bottom: 80px;
    z-index: 2;
    border-radius: 9px;
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
    width: 120px;
    max-width: 100%;
    border: none;
    cursor: pointer;
    color: white;
    font-size: 14px;
}

.add button:hover {
    background-color: #02060ade;
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
    width: 27px;
    height: auto;
    filter: invert(6%) sepia(50%) saturate(200%) hue-rotate(160deg) brightness(100%) contrast(100%);
}

.add img:hover {
    opacity: 0.9;
}

/* Filtro para deixar o coração vermelho quando estiver nos favoritos */
.add img[src*="coraçaofav"] {
    filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}

.produto {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    width: 100%;
    max-width: 250px;
    min-width: 0;
    height: auto;
    margin-top: 3vh;
    padding: 10px;
    border-radius: 5px;
    border: 0.5px solid transparent;
    box-sizing: border-box;
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
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    line-height: 1.2;
    max-height: 2.4em;
    word-wrap: break-word;
    white-space: nowrap;
}

.lista {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    justify-items: center;
    padding: 20px;
    position: relative;
    gap: 15px;
    border: 1px solid #e2e2e2;
    background-color: white;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(100vh - 200px);
    min-height: 400px;
    width: 100%;
    box-sizing: border-box;
}

.soumdetalhe {
    width: 100%;
    max-width: 1250px;
    height: 1px;
    background-color: #838383;
    margin-bottom: 5px;
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

.carregando,
.erro,
.nenhum-favorito {
    text-align: center;
    padding: 40px;
    color: #666;
    width: 100%;
    max-width: 1250px;
}

.erro {
    color: #dc3545;
}

.nenhum-favorito h2 {
    color: #333;
    margin-bottom: 10px;
}

.nenhum-favorito p {
    color: #666;
    font-size: 16px;
}

@media (max-width: 1200px) {
    .lista {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        padding: 15px;
    }
    .produto {
        max-width: 220px;
    }
    .nome-preco-imagem img {
        width: 140px;
        height: 200px;
    }
}

@media (max-width: 950px) {
    .lista {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 10px;
        padding: 12px;
    }
    .produto {
        max-width: 200px;
    }
    .nome-preco-imagem img {
        width: 120px;
        height: 180px;
    }
    .add button {
        width: 100px;
        font-size: 12px;
    }
}

@media (max-width: 768px) {
    .lista {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        padding: 10px;
    }
    .produto {
        max-width: 180px;
        padding: 8px;
    }
    .nome-preco-imagem img {
        width: 100px;
        height: 150px;
    }
    .titulo, .soumdetalhe, .produtos {
        max-width: 100%;
    }
    .titulo h3 {
        font-size: 20px;
    }
    .tudo {
        padding: 15px;
    }
    .add button {
        width: 90px;
        font-size: 11px;
        padding: 6px;
    }
    .add {
        gap: 8px;
    }
    .add img {
        width: 22px;
    }
}

@media (max-width: 480px) {
    .lista {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 6px;
        padding: 8px;
    }
    .produto {
        max-width: 160px;
        padding: 6px;
        margin-top: 2vh;
    }
    .nome-preco-imagem img {
        width: 80px;
        height: 120px;
    }
    .titulo, .soumdetalhe, .produtos {
        max-width: 100%;
    }
    .titulo {
        height: 3.5rem;
        margin-bottom: 10px;
    }
    .titulo h3 {
        font-size: 16px;
    }
    .btn-remover-todos {
        font-size: 12px;
        padding: 6px 12px;
    }
    .botao-remover-todos {
        margin-bottom: 15px;
        padding-left: 10px;
    }
    .tudo {
        padding: 10px;
    }
    .add button {
        width: 80px;
        font-size: 10px;
        padding: 5px;
    }
    .add {
        gap: 6px;
    }
    .add img {
        width: 20px;
    }
    .produto h4 {
        font-size: 13px;
        height: 35px;
    }
    .nome-preco-imagem p {
        font-size: 18px;
    }
}

@media (max-width: 360px) {
    .lista {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 5px;
        padding: 5px;
    }
    .produto {
        max-width: 140px;
        padding: 5px;
    }
    .nome-preco-imagem img {
        width: 70px;
        height: 100px;
    }
    .add button {
        width: 70px;
        font-size: 9px;
        padding: 4px;
    }
    .add {
        gap: 5px;
    }
    .add img {
        width: 18px;
    }
    .produto h4 {
        font-size: 12px;
        height: 30px;
    }
    .nome-preco-imagem p {
        font-size: 16px;
    }
}
</style>