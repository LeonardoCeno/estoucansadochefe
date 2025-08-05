<template>
    <TopBar />
    <header>
        <router-link class="logo" to="/">
            <img src="../components/img/agrsimtabao-Photoroom.png" alt="" />
        </router-link>
        
        <div class="input" style="position:relative;">
            <input type="text" :placeholder="placeholderText" v-model="busca" @input="onInputBusca" @focus="onFocusBusca" @blur="onBlurBusca" @keyup.enter="pesquisarEnter" />
            <img src="../components/img/LupaFinal.png" alt="" />
            <div v-if="mostrarSugestoes && sugestoes.length > 0 && busca.length > 0" class="autocomplete-sugestoes" @mousedown.prevent>
                <div class="autocomplete-titulo">
                    Resultados para "{{ busca }}"
                </div>
                <div v-for="produto in sugestoes.slice(0, 3)" :key="produto.id" class="sugestao-item" @mousedown.prevent="irParaProduto(produto.id)">
                    <img v-if="produto.image_path" :src="produto.image_path.startsWith('http') ? produto.image_path : apiBase + produto.image_path" alt="imagem" />
                    <div class="sugestao-info">
                        <span class="disponivel">
                            <img :src="produto.stock >= 1 ? DISPONIVELREAL : INDISPONIVELREAL" :alt="produto.stock >= 1 ? 'Disponível' : 'Indisponível'" />
                        </span>
                        <span class="sugestao-nome">{{ produto.name }}</span>
                        <span class="sugestao-preco">R$ {{ produto.price }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="botoes">
            <div class="carrinho-dropdown-wrapper" style="position: relative; display: inline-block;">
                <button @click.stop="toggleCarrinhoDropdown">
                    <p>Carrinho</p>
                    <img src="../components/img/carrinhofinal.png" alt="" />
                    <span v-if="totalItensCarrinho > 0" class="carrinho-badge">{{ totalItensCarrinho }}</span>
                </button>
                <div v-if="showCarrinhoDropdown" class="carrinho-dropdown-menu" @click.stop>
                    <div class="carrinho-header">
                        <div class="carrinho-header-left">
                            <button @click="toggleCarrinhoDropdown" class="carrinho-close-btn">×</button>
                            <h4>Seu Carrinho</h4>
                        </div>
                        <span v-if="totalItensCarrinho > 0" class="carrinho-total">{{ totalItensCarrinho }} item{{ totalItensCarrinho > 1 ? 's' : '' }}</span>
                    </div>
                    
                    <div v-if="carregandoCarrinho" class="carrinho-carregando">
                        <p>Carregando...</p>
                    </div>
                    
                    <div v-else-if="!itensCarrinho || itensCarrinho.length === 0" class="carrinho-vazio">
                        <img src="../components/img/carrinhofinal.png" alt="Carrinho vazio" />
                        <p>Seu carrinho está vazio</p>
                        <span>Adicione produtos para começar</span>
                    </div>
                    
                                            <div v-else class="carrinho-itens">
                        <div v-for="item in itensCarrinho.slice(0, 4)" :key="item.id" class="carrinho-item">
                            <img v-if="item.image_path" :src="item.image_path.startsWith('http') ? item.image_path : apiBase + item.image_path" alt="Produto" />
                            <div class="carrinho-item-info">
                                <span class="carrinho-item-nome">{{ item.name }}</span>
                                <span class="carrinho-item-preco">R$ {{ item.unit_price }}</span>
                                <div class="carrinho-item-quantidade">
                                    <span>Qtd: {{ item.quantity }}</span>
                                </div>
                            </div>
                            <button @click="cartStore.removerItemDoCarrinho(item)" class="carrinho-remover">
                                ×
                            </button>
                        </div>
                        
                        <div v-if="itensCarrinho.length > 4" class="carrinho-mais-itens">
                            <span>+{{ itensCarrinho.length - 4 }} mais</span>
                        </div>
                        
                        <div class="carrinho-footer">
                            <div class="carrinho-total-preco">
                                <span>Total: R$ {{ totalPrecoCarrinho }}</span>
                            </div>
                            <div class="carrinho-botoes">
                                <button @click="verCarrinhoCompleto" class="btn-ver-carrinho">Ver Carrinho</button>
                                <button @click="finalizarCompra" class="btn-finalizar">Finalizar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <router-link to="/pedidos">
                <button>
                    <p>Pedidos</p>
                    <img src="../components/img/listafinal.png" alt="" />
                </button>
            </router-link>
            
            <router-link v-if="!isLoggedIn" to="/login">   
                <button>
                    <p>Entrar</p>
                    <img src="../components/img/usuariofinal.png" alt="" />
                </button>
            </router-link>
            
            <div v-else class="conta-dropdown-wrapper" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false" style="position: relative; display: inline-block;">
                <button>
                    <p>Conta</p>
                    <img src="../components/img/usuariofinal.png" alt="" />
                </button>
                <div v-if="showDropdown" class="conta-dropdown-menu">
                    <button @click="goToPainel">Dados</button>
                    <button @click="goToFavoritos">Favoritos</button>
                    <button @click="logout">Sair</button>
                </div>
            </div>
        </div>
    </header>

    <div v-if="!esconderCategorias" class="Categorias">
        <div class="categorias-dropdown-wrapper" @mouseenter="showCategoriasDropdown = true" @mouseleave="showCategoriasDropdown = false" style="position: relative; display: inline-block;">
            <button href="#">
                <img src="../components/img/listafinal.png" alt=""> <p>Categorias</p>
            </button>
            <div v-if="showCategoriasDropdown" class="categorias-dropdown-menu">
                <div v-for="cat in categorias" :key="cat.id">
                    <button @click="irParaCategoria(cat.id)"> {{ cat.name }} </button>
                </div>
                <router-link to="/pesquisas">
                    <button>Tudo</button>
                </router-link>
            </div>
        </div>
        <router-link to="/pesquisas?lancamentos=1">
            <button> <img src="../components/img/Lancamentofinal-Photoroom.png" alt=""> <p>Lançamentos</p></button>
        </router-link>
        <router-link to="/pesquisas?categoriaId=316">
            <button> <img src="../components/img//Livrofinalverdadeiro-Photoroom.png" alt=""> <p>Livros</p></button>
        </router-link>
        <router-link to="/pesquisas?categoriaId=318">
            <button> <img src="../components/img/mangáfinal.png" alt=""> <p>Mangás</p></button>
        </router-link>
        <router-link to="/pesquisas?categoriaId=320">
            <button> <img src="../components/img/pincel.png" alt=""> <p>Artbooks</p></button>
        </router-link>
        <router-link to="/pesquisas?categoriaId=320">
            <button> <img src="../components/img/ofertasfinal.png" alt=""> <p>Ofertas</p></button>
        </router-link>
        <router-link to="/pesquisas">
            <button> <img src="../components/img/Tudofinal-Photoroom.png" alt=""> <p>Tudo</p></button>
        </router-link>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { buscarProdutosAdmin228 } from '../services/api'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'
import DISPONIVELREAL from './img/DISPONIVELREAL.png'
import INDISPONIVELREAL from './img/INDISPONIVELREAL.png'
import { getCategoriasPorUsuario228 } from '../services/api'
import TopBar from './TopBar.vue'

const apiBase = 'http://35.196.79.227:8000'
const userStore = useUserStore()
const cartStore = useCartStore()
// Função para checar se o usuário ta logado (usando o store)
const isLoggedIn = computed(() => userStore.isAuthenticated)
const showDropdown = ref(false)
const showCategoriasDropdown = ref(false)
const showCarrinhoDropdown = ref(false)
const router = useRouter()
const route = useRoute()
const categorias = ref([])

// Carrinho - usando o store
const itensCarrinho = computed(() => cartStore.itensCarrinho)
const carregandoCarrinho = computed(() => cartStore.carregando)
const totalItensCarrinho = computed(() => cartStore.totalItens)
const totalPrecoCarrinho = computed(() => cartStore.totalPrecoFormatado)

// isso carrega as categorias criadas para que atualize o "categorias" do header automaticamente ao o admin criar um nova
async function carregarCategorias() {
    try {
        categorias.value = await getCategoriasPorUsuario228()
    } catch (error) {
        console.error('Erro ao carregar categorias:', error)
    }
}

onMounted(() => {
    carregarCategorias()
    
    // Função para atualizar placeholder baseado no tamanho da tela
    const atualizarPlaceholder = () => {
        if (window.innerWidth <= 768) {
            placeholderText.value = 'Pesquisar'
        } else {
            placeholderText.value = 'Livros, Mangás, novos olhares...'
        }
    }
    
    // Atualizar placeholder inicial
    atualizarPlaceholder()
    
    // Escutar mudanças no tamanho da tela
    window.addEventListener('resize', atualizarPlaceholder)
    
    // Escutar logout do usuário
    window.addEventListener('user-logout', () => {
        cartStore.limparCarrinhoLocal()
        showCarrinhoDropdown.value = false
        showDropdown.value = false
    })
    
    // Event listener para fechar carrinho ao clicar fora
    document.addEventListener('click', (event) => {
        const carrinhoWrapper = document.querySelector('.carrinho-dropdown-wrapper')
        const carrinhoMenu = document.querySelector('.carrinho-dropdown-menu')
        
        if (showCarrinhoDropdown.value && 
            carrinhoWrapper && 
            !carrinhoWrapper.contains(event.target) &&
            carrinhoMenu &&
            !carrinhoMenu.contains(event.target)) {
            showCarrinhoDropdown.value = false
        }
    })
})

onUnmounted(() => {
    // Remover event listeners
    window.removeEventListener('user-logout', () => {
        cartStore.limparCarrinhoLocal()
        showCarrinhoDropdown.value = false
        showDropdown.value = false
    })
    
    // Remover event listener do resize
    window.removeEventListener('resize', () => {})
})

// Watcher para limpar carrinho quando o usuário fizer logout
watch(isLoggedIn, (novoValor) => {
    if (!novoValor) {
        cartStore.limparCarrinhoLocal()
    }
})

// Watcher para recarregar carrinho quando necessário
watch(itensCarrinho, async (novosItens, itensAnteriores) => {
    // Se o carrinho estava vazio e agora tem itens, mas os itens não têm imagem
    if (itensAnteriores && itensAnteriores.length === 0 && novosItens.length > 0) {
        const itensSemImagem = novosItens.filter(item => !item.image_path || item.image_path === null)
        if (itensSemImagem.length > 0) {
            await cartStore.carregarCarrinho()
        }
    }
})

// isso aqui é pra que se o usuario estiver no painel a parte das categorias abaixo do header não aparecer (sim, é uma soluçao pra nao ter que separar ele do header pq fiz os 2 junto num outro componente 👍)
const painelChildrenRoutes = [
    'Dados', 'Cupons', 'Pedidos', 'Favoritos', 'Enderecos', 'Carrinho',
    'ADMcategorias', 'ADMprodutos', 'ADMpedidos', 'ADMcupons', 'ADMmoderadores'
]
const esconderCategorias = computed(() => {
    return painelChildrenRoutes.includes(route.name)
})

// aqui cuida da parte das sugestoes que aparece ao você digitar algo no input do header, ele só te sugere se no input tiver 1 letra ou mais (e funciona bem 👍)
const busca = ref('')
const sugestoes = ref([])
const mostrarSugestoes = ref(false)
const placeholderText = ref('Livros, Mangás, novos olhares...')
let todosProdutosAdmin = []

// simples, carrega os itens do ADM (eu)
async function carregarProdutosAdmin() {
    if (todosProdutosAdmin.length === 0) {
        todosProdutosAdmin = await buscarProdutosAdmin228()
    }
}

// função async que faz o input funcionar, buscando os produtos que mais batem com o que você pesquisou
async function onInputBusca() {
    await carregarProdutosAdmin()
    setTimeout(() => {
        const termo = busca.value.toLowerCase()
        sugestoes.value = todosProdutosAdmin
            .filter(p => p.name && p.name.toLowerCase().includes(termo))
            .map(p => ({
                ...p,
                matchIndex: p.name.toLowerCase().indexOf(termo)
            }))
            .sort((a, b) => {
                // Prioriza nomes que tem o termo mais "próximo" do início, mas não só no início
                if (a.matchIndex !== b.matchIndex) return a.matchIndex - b.matchIndex
                // Se o índice for igual, prioriza nomes mais curtos
                return a.name.length - b.name.length
            })
            .slice(0, 5)
        mostrarSugestoes.value = sugestoes.value.length > 0
    }, 100)
}

// aqui que faz aparecer só se tem uma ou mais letras👍
function onFocusBusca() {
    if (sugestoes.value.length > 0) {
        mostrarSugestoes.value = true
    }
}

// limpa
function onBlurBusca() {
    setTimeout(() => {
        mostrarSugestoes.value = false
        busca.value = ''
    }, 120)
}

//to fazendo ainda, mas aqui vai te legar pra pagina do produto q se clico
function irParaProduto(id) {
    router.push(`/produto/${id}`)
    mostrarSugestoes.value = false
    busca.value = ''
}

// função que faz o usuario deslogar e perde a permissao de certas areás q só pode se tiver logado
function logout() {
    userStore.logout()
    showDropdown.value = false
    showCarrinhoDropdown.value = false
    router.push('/')
}

//daqui pra baixo é funçoes que levam as coisas q tao escrita abaixo do header
function goToPainel() {
    showDropdown.value = false
    router.push('/dados')
}

function goToFavoritos() {
    showDropdown.value = false
    router.push('/favoritos')
}

function irParaCategoria(id) {
    router.push({ path: '/pesquisas', query: { categoriaId: id } })
}
// isso aqui é o que te leva pro pesquisas.vue com base no que voce pesquisou
function pesquisarEnter() {
    if (busca.value.trim().length > 0) {
        router.push({ path: '/pesquisas', query: { termo: busca.value.trim() } })
        busca.value = ''
        mostrarSugestoes.value = false
    }
}

// Funções do Carrinho
function toggleCarrinhoDropdown() {
    if (!isLoggedIn.value) {
        router.push('/login')
        return
    }
    
    if (!showCarrinhoDropdown.value) {
        // Abrindo
        showCarrinhoDropdown.value = true
        if (itensCarrinho.value.length === 0) {
            cartStore.carregarCarrinho()
        }
        // Adiciona a classe show após um pequeno delay para a animação funcionar
        setTimeout(() => {
            const carrinho = document.querySelector('.carrinho-dropdown-menu')
            if (carrinho) {
                carrinho.classList.add('show')
            }
        }, 10)
    } else {
        // Fechando com animação
        const carrinho = document.querySelector('.carrinho-dropdown-menu')
        if (carrinho) {
            carrinho.classList.remove('show')
            setTimeout(() => {
                showCarrinhoDropdown.value = false
            }, 300)
        } else {
            showCarrinhoDropdown.value = false
        }
    }
}

function verCarrinhoCompleto() {
    showCarrinhoDropdown.value = false
    router.push('/carrinho')
}

function finalizarCompra() {
    showCarrinhoDropdown.value = false
    router.push('/carrinho')
}

</script>

<style scoped>

header {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    min-height: 12vh;
    gap: 6vw;
    flex-wrap: wrap;
    padding: 15px 20px;
}

.logo {
    position: relative;
    justify-content: center;
    left: 20px;
    width: 12%;
    display: flex;
}

.logo img {
    width: auto;
    height: 95px;
    filter: brightness(75%);
    transform: rotate(-9deg);
}

.logo img:hover{
    transition: 0.1s;
    filter: brightness(95%);
}

.input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 15px;
    padding: 0 20px;
    width: 41vw;
    max-width: 720px;
    height: 50px;
    flex-shrink: 1;
    border: 1px solid #6d6d6d;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.input:focus-within {
    border: 1.8px solid #03040cf5;
}

.input img {
    width: auto;
    height: 30px;
    filter: brightness(20%);
}

input {
    width: 32vw;
    border: none;
    outline: none;
    background-color: transparent;
    min-width: 100px;
    font-size: 16px;
    color: #2c3e50;
    font-weight: 500;
}

input::placeholder {
    color: #95a5a6;
    font-style: italic;
    font-weight: 400;
}

.botoes {
    display: flex;
    gap: 10px;
    font-size: 15px;
    flex-wrap: wrap;
    justify-content: center;
    position: relative;
    right: 15px;
}

.botoes p {
    font-family: helvetica;
    font-weight: bold;
    font-size: 16px;
}

button {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #000000;
    white-space: nowrap;
    background: transparent;
    border: none;
    padding: 6px 12px;
    cursor: pointer;
    transition: color 0.1s;
    font-weight: 500;
    font-size: 15px;
    height: 55px;
}

.botoes button:hover {
    background: linear-gradient(to right, #4e759c, #00c3ff);
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

button img {
    width: auto;
    height: 3vh;
    transition: 0.1s;
}

button:hover img {
    filter: invert(45%) sepia(65%) saturate(1000%) hue-rotate(160deg) brightness(105%) contrast(100%);
}

.botoes img {
    width: 24px;
    height: 24px;
}


.Categorias {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 6vh;
    background: linear-gradient(120deg, #0d4d3dda 0%, #000000 12% ,#000000 88%, #25768ada 100%);
    font-size: 14px;
    gap: 70px;
}

.Categorias img {
    width: 1.1vw;
    min-width: 12px;
    height: auto;
    filter: brightness(0) invert(1);
    transition: all 0.3s ease;
}

.Categorias button {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 10px;
    border-radius: 10px;
    transition: color 0.2s ease;
    color: white;
    height: 55px;
    font-weight: bold;
    background: transparent;
}

.Categorias button:hover {
    background: linear-gradient(to right, #4e759c, #00c3ff);
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.Categorias button:hover img {
    transition: 0s;
    filter: brightness(0) invert(45%) sepia(65%) saturate(1050%) hue-rotate(160deg) brightness(115%) contrast(100%);
}

.conta-dropdown-menu {
    position: absolute;
    top: 51px;
    background: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    min-width: 100px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    margin-top: 4px;
    border: 1px, solid #000000;
}

.conta-dropdown-menu button {
    color: #000000;
    padding: 10px 18px;
    text-align: left;
    width: 160px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s;
}

.conta-dropdown-menu button:hover {
    color: #079ac7;
    border-top: 0.5px solid grey;
    border-bottom: 0.5px solid grey;
}

.categorias-dropdown-menu {
    position: absolute;
    top: 51px;
    background: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    min-width: 150px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    margin-top: 4px;
    border: 1px, solid #000000;
}
.categorias-dropdown-menu button {
    color: #000000;
    padding: 10px 18px;
    text-align: left;
    width: 200px;
    font-size: 15px;
    cursor: pointer;
    border-radius: 0px;
}
.categorias-dropdown-menu button:hover {
    background: linear-gradient(to right, #4e759c, #00c3ff);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: 0s;
    border-top: 0.5px solid grey;
    border-bottom: 0.5px solid grey;
}

/* Estilos do Carrinho */
.carrinho-dropdown-wrapper {
    position: relative;
    display: inline-block;
}

.carrinho-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #e74c3c;
    border: 1px solid #ffffff;
    color: #ffffff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    min-width: 20px;
}

.carrinho-dropdown-menu {
    position: fixed;
    top: 80px;
    right: 20px;
    background: #fff;
    border: 1px solid #0000007e;
    border-radius: 8px;
    min-width: 320px;
    max-width: 400px;
    height: auto;
    min-height: 500px;
    z-index: 1000;
    padding: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transform: translateX(110%);
    transition: transform 0.3s ease;
}

.carrinho-dropdown-menu.show {
    transform: translateX(0);
}


.carrinho-header {
    background: #f8f9fa;
    padding: 16px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.carrinho-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.carrinho-close-btn {
    background: none;
    border: none;
    color: #646464;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    line-height: 1;
    min-width: auto;
    height: auto;
}

.carrinho-close-btn:hover {
    background-color: #fdf2f2;
}

.carrinho-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.carrinho-total {
    font-size: 12px;
    color: #666;
    background: #e9ecef;
    padding: 4px 8px;
    border-radius: 12px;
}

.carrinho-carregando {
    padding: 20px;
    text-align: center;
    color: #666;
}

.carrinho-vazio {
    padding: 24px 16px;
    text-align: center;
    color: #666;
}

.carrinho-vazio img {
    width: 48px;
    height: 48px;
    opacity: 0.5;
    margin-bottom: 12px;
}

.carrinho-vazio p {
    margin: 8px 0 4px 0;
    font-weight: 500;
    color: #333;
}

.carrinho-vazio span {
    font-size: 12px;
    color: #999;
}

.carrinho-itens {
    flex: 1;
    overflow-y: hidden;
}

.carrinho-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f4;
    position: relative;
    transition: background-color 0.2s;
}

.carrinho-item:hover {
    background-color: #f8f9fa;
}

.carrinho-dropdown-menu .carrinho-item img {
    width: 60px;
    height: 80px;
    border-radius: 4px;
    margin-right: 12px;
    border: 1px solid #e9ecef;
}

.carrinho-item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.carrinho-item-nome {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    line-height: 1.3;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.carrinho-item-preco {
    font-size: 12px;
    font-weight: 600;
    color: #2c3e50;
}

.carrinho-item-quantidade {
    font-size: 11px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
}



.carrinho-remover {
    background: none;
    border: none;
    color: #e74c3c;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
    margin-left: 8px;
}

.carrinho-remover:hover {
    background-color: #fdf2f2;
}

.carrinho-mais-itens {
    padding: 8px 16px;
    text-align: center;
    font-size: 12px;
    color: #666;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.carrinho-footer {
    background: #f8f9fa;
    padding: 16px;
    border-top: 1px solid #e9ecef;
    flex-shrink: 0;
}

.carrinho-total-preco {
    margin-bottom: 12px;
    text-align: right;
}

.carrinho-total-preco span {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
}

.carrinho-botoes {
    display: flex;
    gap: 8px;
}

.btn-ver-carrinho,
.btn-finalizar {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-ver-carrinho {
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #dee2e6;
}

.btn-ver-carrinho:hover {
    background: #e9ecef;
    color: #495057;
}

.btn-finalizar {
    background: #02060af5;
    color: white;
}

.btn-finalizar:hover {
    background: #02060ac2;
}

/* ===== RESPONSIVIDADE SIMPLES ===== */

/* Tablet e Mobile (768px e abaixo) */
@media (max-width: 768px) {
    header {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
    }
    
    .logo {
        position: static;
        left: 0;
    }
    
    .logo img {
        height: 60px;
    }
    
    .input {
        width: 90vw;
        max-width: 600px;
    }
    
    input {
        width: 75vw;
    }
    
    .botoes {
        gap: 15px;
        right: 0;
    }
    
    .botoes p {
        font-size: 14px;
    }
    
    .botoes img {
        width: 20px;
        height: 20px;
    }
    
    .Categorias {
        gap: 40px;
        padding: 0 10px;
    }
    
    .Categorias button {
        font-size: 13px;
        padding: 4px 8px;
    }
    
    .Categorias img {
        width: 10px;
        min-width: 10px;
    }
    
    /* Carrinho */
    .carrinho-dropdown-menu {
        right: 10px;
        min-width: 280px;
        max-width: calc(100vw - 20px);
    }
    
    .carrinho-item-nome {
        max-width: 140px;
    }
    
    .carrinho-botoes {
        flex-direction: column;
    }
    
    /* Dropdowns */
    .conta-dropdown-menu,
    .categorias-dropdown-menu {
        min-width: 140px;
    }
    
    .conta-dropdown-menu button,
    .categorias-dropdown-menu button {
        width: 140px;
        font-size: 14px;
    }
}

/* Mobile Pequeno (480px e abaixo) */
@media (max-width: 480px) {
    .logo {
        display: none;
    }
    
    header {
        gap: 10px;
        padding: 10px 15px;
    }
    
    .botoes {
        gap: 10px;
    }
    
    .botoes p {
        font-size: 12px;
    }
    
    .botoes img {
        width: 18px;
        height: 18px;
    }
    
    .input {
        width: 92vw;
    }
    
    input {
        width: 70vw;
        font-size: 14px;
    }
    
    .Categorias {
        gap: 25px;
        padding: 0 5px;
    }
    
    .Categorias button {
        font-size: 12px;
        padding: 3px 6px;
    }
    
    .Categorias img {
        width: 8px;
        min-width: 8px;
    }
    
    /* Carrinho */
    .carrinho-dropdown-menu {
        right: 5px;
        left: 5px;
        min-width: auto;
        max-width: none;
        width: calc(100vw - 10px);
    }
    
    .carrinho-item-nome {
        max-width: 120px;
    }
    
    .carrinho-header {
        padding: 12px;
    }
    
    .carrinho-item {
        padding: 10px 12px;
    }
    
    .carrinho-footer {
        padding: 12px;
    }
    
    /* Dropdowns */
    .conta-dropdown-menu,
    .categorias-dropdown-menu {
        min-width: 120px;
    }
    
    .conta-dropdown-menu button,
    .categorias-dropdown-menu button {
        width: 120px;
        font-size: 13px;
    }
}

/* Mobile Muito Pequeno (320px e abaixo) */
@media (max-width: 320px) {
    header {
        gap: 8px;
        padding: 8px 10px;
    }
    
    .botoes {
        gap: 8px;
    }
    
    .botoes p {
        font-size: 11px;
    }
    
    .botoes img {
        width: 16px;
        height: 16px;
    }
    
    .input {
        width: 95vw;
    }
    
    input {
        width: 65vw;
        font-size: 13px;
    }
    
    .Categorias {
        gap: 20px;
        padding: 0 3px;
    }
    
    .Categorias button {
        font-size: 11px;
        padding: 2px 4px;
    }
    
    .Categorias img {
        width: 6px;
        min-width: 6px;
    }
    
    /* Dropdowns */
    .conta-dropdown-menu,
    .categorias-dropdown-menu {
        min-width: 100px;
    }
    
    .conta-dropdown-menu button,
    .categorias-dropdown-menu button {
        width: 100px;
        font-size: 12px;
    }
}

.autocomplete-sugestoes {
    position: absolute;
    top: 45px;
    left: 0;
    width: 100%;
    background: #fff;
    border: 1.5px solid #979797;
    border-radius: 0 0 12px 12px;
    z-index: 100;
    padding: 4px 0;
}

.sugestao-item {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 10px 18px;
    cursor: pointer;
    border-bottom: 1px solid #e9e9e9;
}

.sugestao-item img {
    width: 80px;
    height: 108px;
    filter: none;
}

.sugestao-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.sugestao-info .disponivel img{
    width: 90px;
    height: auto;
    border-radius: 7px;
}

.sugestao-nome {
    font-size: 1.08rem;
    font-weight: 600;
    color: #222;
    text-overflow: ellipsis;
    margin-bottom: 2px;
}

.sugestao-preco {
    font-weight: Bold;
    font-size: 1.2rem;
    color: #414141;
}

.sugestao-item:hover {
    background: #dfdfdf;
}

.autocomplete-titulo {
    color: #888;
    font-size: 0.98rem;
    font-weight: 500;
    padding: 10px 18px 4px 18px;
    margin-bottom: 2px;
    margin-top: 2px;
    text-align: left;
    letter-spacing: 0.01em;
}

</style>
