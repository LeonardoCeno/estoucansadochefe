<template>
    <TopBar />
    <header>
        <a class="logo desktop" href="/">
        <img src="../components/img/agrsimtabao-Photoroom.png" alt="" />
        </a>
        <div class="input desktop" style="position:relative;">
            <input type="text" placeholder="Livros, Mangás, novos olhares..." v-model="busca" @input="onInputBusca" @focus="onFocusBusca" @blur="onBlurBusca" @keyup.enter="pesquisarEnter" />
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
        <div class="botoes desktop">
            <div class="carrinho-dropdown-wrapper" style="position: relative; display: inline-block;">
                <button @click.stop="toggleCarrinhoDropdown">
                    <p>Carrinho</p>
                    <img src="../components/img/carrinhofinal.png" alt="" />
                    <span v-if="totalItensCarrinho > 0" class="carrinho-badge">{{ totalItensCarrinho }}</span>
                </button>
                <div v-if="showCarrinhoDropdown" class="carrinho-dropdown-menu" @click.stop>
                    <div class="carrinho-header">
                        <h4>Seu Carrinho</h4>
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
                        <div v-for="item in itensCarrinho.slice(0, 3)" :key="item.id" class="carrinho-item">
                            <img v-if="item.image_path" :src="item.image_path.startsWith('http') ? item.image_path : apiBase + item.image_path" alt="Produto" />
                            <div class="carrinho-item-info">
                                <span class="carrinho-item-nome">{{ item.name }}</span>
                                <span class="carrinho-item-preco">R$ {{ item.unit_price }}</span>
                                <div class="carrinho-item-quantidade">
                                    <button @click="diminuirQuantidade(item.product_id)" class="quantidade-btn">-</button>
                                    <span>{{ item.quantity }}</span>
                                    <button @click="aumentarQuantidade(item.product_id)" class="quantidade-btn">+</button>
                                </div>
                            </div>
                            <button @click="removerItemCarrinhoLocal(item.product_id)" class="carrinho-remover">
                                ×
                            </button>
                        </div>
                        
                        <div v-if="itensCarrinho.length > 3" class="carrinho-mais-itens">
                            <span>+{{ itensCarrinho.length - 3 }} mais</span>
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
            <button>
                <p>Pedidos</p>
                <img src="../components/img/listafinal.png" alt="" />
            </button>
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
        <div class="topo-mobile mobile">
            <a class="logo" href="/">
            <img src="../components/img/agrsimtabao-Photoroom.png" alt="" />
            </a>
            <div class="botoes">
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
                <button>
                <p>Pedidos</p>
                <img src="../components/img/listafinal.png" alt="" />
                </button>
                <div class="carrinho-dropdown-wrapper" style="position: relative; display: inline-block;">
                    <button @click.stop="toggleCarrinhoDropdown">
                        <p>Carrinho</p>
                        <img src="../components/img/carrinhofinal.png" alt="" />
                        <span v-if="totalItensCarrinho > 0" class="carrinho-badge">{{ totalItensCarrinho }}</span>
                    </button>
                    <div v-if="showCarrinhoDropdown" class="carrinho-dropdown-menu mobile" @click.stop>
                        <div class="carrinho-header">
                            <h4>Seu Carrinho</h4>
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
                            <div v-for="item in itensCarrinho.slice(0, 3)" :key="item.id" class="carrinho-item">
                                <img v-if="item.image_path" :src="item.image_path.startsWith('http') ? item.image_path : apiBase + item.image_path" alt="Produto" />
                                <div class="carrinho-item-info">
                                    <span class="carrinho-item-nome">{{ item.name }}</span>
                                    <span class="carrinho-item-preco">R$ {{ item.unit_price }}</span>
                                    <div class="carrinho-item-quantidade">
                                        <button @click="diminuirQuantidade(item.product_id)" class="quantidade-btn">-</button>
                                        <span>{{ item.quantity }}</span>
                                        <button @click="aumentarQuantidade(item.product_id)" class="quantidade-btn">+</button>
                                    </div>
                                </div>
                                <button @click="removerItemCarrinhoLocal(item.product_id)" class="carrinho-remover">
                                    ×
                                </button>
                            </div>
                            
                            <div v-if="itensCarrinho.length > 3" class="carrinho-mais-itens">
                                <span>+{{ itensCarrinho.length - 3 }} mais</span>
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
            </div>
        </div>
        <div class="input mobile" style="position:relative;">
            <input type="text" placeholder="Pesquisar" v-model="busca" @input="onInputBusca" @focus="onFocusBusca" @blur="onBlurBusca" @keyup.enter="pesquisarEnter" />
            <img src="../components/img/LupaFinal.png" alt="" />
            <div v-if="mostrarSugestoes && sugestoes.length > 0" class="autocomplete-sugestoes" @mousedown.prevent>
                <div class="autocomplete-titulo">
                    Resultados para "{{ busca }}"
                </div>
                <div v-for="produto in sugestoes.slice(0, 3)" :key="produto.id" class="sugestao-item" @mousedown.prevent="irParaProduto(produto.id)">
                    <img v-if="produto.image_path" :src="produto.image_path.startsWith('http') ? produto.image_path : apiBase + produto.image_path" alt="imagem" />
                    <div class="sugestao-info">
                        <span class="sugestao-nome">{{ produto.name }}</span>
                        <span class="sugestao-preco">R$ {{ produto.price }}</span>
                    </div>
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
                <button @click="irParaPesquisas">Tudo</button>
            </div>
        </div>
        <button @click="irParaLancamentos"> <img src="../components/img/Lancamentofinal-Photoroom.png" alt=""> <p>Lançamentos</p></button>
        <button @click="irParaLivros"> <img src="../components/img//Livrofinalverdadeiro-Photoroom.png" alt=""> <p>Livros</p></button>
        <button @click="irParaMangás"> <img src="../components/img/mangáfinal.png" alt=""> <p>Mangás</p></button>
        <button @click="irParaArtbooks" > <img src="../components/img/pincel.png" alt=""> <p>Artbooks</p></button>
        <button @click="irParaOfertas"> <img src="../components/img/ofertasfinal.png" alt=""> <p>Ofertas</p></button>
        <button @click="irParaPesquisas"> <img src="../components/img/Tudofinal-Photoroom.png" alt=""> <p>Tudo</p></button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import api, { buscarProdutosAdmin228, getItensCarrinho, removerItemCarrinho, atualizarQuantidadeCarrinho } from '../services/api'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import DISPONIVELREAL from './img/DISPONIVELREAL.png'
import INDISPONIVELREAL from './img/INDISPONIVELREAL.png'
import { getCategoriasPorUsuario228 } from '../services/api'
import TopBar from './TopBar.vue'

const apiBase = 'http://35.196.79.227:8000'
const toast = useToast()
// Função para checar se o usuário ta logado (token em memória)
const isLoggedIn = computed(() => !!api.defaults.headers.common['Authorization'])
const showDropdown = ref(false)
const showCategoriasDropdown = ref(false)
const showCarrinhoDropdown = ref(false)
const router = useRouter()
const route = useRoute()
const categorias = ref([])

// Carrinho
const itensCarrinho = ref([])
const carregandoCarrinho = ref(false)

const totalItensCarrinho = computed(() => {
    return itensCarrinho.value.reduce((total, item) => total + item.quantity, 0)
})

const totalPrecoCarrinho = computed(() => {
    return itensCarrinho.value.reduce((total, item) => total + (item.unit_price * item.quantity), 0).toFixed(2)
})

// Função para verificar se um produto está no carrinho
const produtoEstaNoCarrinho = (produtoId) => {
    return itensCarrinho.value.some(item => item.product_id === produtoId)
}

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
    if (isLoggedIn.value) {
        carregarCarrinho()
    }
    
    // Escutar mudanças no carrinho de outros componentes
    window.addEventListener('carrinho-atualizado', carregarCarrinho)
    
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
    // Remover event listener
    window.removeEventListener('carrinho-atualizado', carregarCarrinho)
})

// Watcher para recarregar carrinho quando o usuário fizer login
watch(isLoggedIn, (novoValor) => {
    if (novoValor) {
        carregarCarrinho()
    } else {
        itensCarrinho.value = []
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
let todosProdutosAdmin = []
let timeoutBusca = null


// simples, carrega os itens do ADM (eu)
async function carregarProdutosAdmin() {
    if (todosProdutosAdmin.length === 0) {
        todosProdutosAdmin = await buscarProdutosAdmin228()
    }
}

// função async que faz o input funcionar, buscando os produtos que mais batem com o que você pesquisou
async function onInputBusca() {
    clearTimeout(timeoutBusca)
    await carregarProdutosAdmin()
    timeoutBusca = setTimeout(() => {
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
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    showDropdown.value = false
    window.location.reload()
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
function irParaPesquisas() {
    router.push('/pesquisas')
}
function irParaLancamentos() {
    router.push({ path: '/pesquisas', query: { lancamentos: 1 } })
}
function irParaLivros() {
    router.push({ path: '/pesquisas', query: { categoriaId: 316 } })
}
function irParaArtbooks() {
    router.push({ path: '/pesquisas', query: { categoriaId: 320 } })
}
function irParaOfertas() {
    //vou por ainda
}
function irParaMangás() {
    router.push({ path: '/pesquisas', query: { categoriaId: 318 } })
}
// aqui criei um "genérico" pras categorias dentro da div que abre quando voce passa o mouse em cima da "Categorias" do header
// nao repliquei em todas pra que o Categorias (falo da div toda) fique fixo, e pra funções futuras
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
async function carregarCarrinho() {
    if (!isLoggedIn.value) return
    
    try {
        carregandoCarrinho.value = true
        const dadosCarrinho = await getItensCarrinho()
        itensCarrinho.value = dadosCarrinho.items || []
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
        itensCarrinho.value = []
    } finally {
        carregandoCarrinho.value = false
    }
}

function toggleCarrinhoDropdown() {
    if (!isLoggedIn.value) {
        router.push('/login')
        return
    }
    
    showCarrinhoDropdown.value = !showCarrinhoDropdown.value
    if (showCarrinhoDropdown.value && itensCarrinho.value.length === 0) {
        carregarCarrinho()
    }
}

async function removerItemCarrinhoLocal(produtoId) {
    try {
        await removerItemCarrinho(produtoId)
        toast.success('Item removido do carrinho!')
        await carregarCarrinho()
        
        // Notificar outros componentes sobre a mudança no carrinho
        window.dispatchEvent(new Event('carrinho-atualizado'))
    } catch (error) {
        toast.error('Erro ao remover item do carrinho.')
        console.error('Erro ao remover item:', error)
    }
}

// Função para aumentar quantidade de um item no carrinho
async function aumentarQuantidade(produtoId) {
    try {
        const item = itensCarrinho.value.find(item => item.product_id === produtoId)
        if (item) {
            await atualizarQuantidadeCarrinho(produtoId, item.quantity + 1)
            await carregarCarrinho()
            
            // Notificar outros componentes sobre a mudança no carrinho
            window.dispatchEvent(new Event('carrinho-atualizado'))
        }
    } catch (error) {
        toast.error('Erro ao aumentar quantidade.')
        console.error('Erro ao aumentar quantidade:', error)
    }
}

// Função para diminuir quantidade de um item no carrinho
async function diminuirQuantidade(produtoId) {
    try {
        const item = itensCarrinho.value.find(item => item.product_id === produtoId)
        if (item && item.quantity > 1) {
            await atualizarQuantidadeCarrinho(produtoId, item.quantity - 1)
            await carregarCarrinho()
            
            // Notificar outros componentes sobre a mudança no carrinho
            window.dispatchEvent(new Event('carrinho-atualizado'))
        } else if (item && item.quantity === 1) {
            // Se quantidade for 1, remove o item
            await removerItemCarrinhoLocal(produtoId)
        }
    } catch (error) {
        toast.error('Erro ao diminuir quantidade.')
        console.error('Erro ao diminuir quantidade:', error)
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
    color: #079ac7;
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

.mobile {
    display: none;
}

@media (max-width: 768px) {
    .desktop {
        display: none;
    }
    .mobile {
        display: flex;
    }
    header {
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .topo-mobile {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 90vw;
    }

    .topo-mobile .logo {
        justify-content: flex-start;
        width: auto;
    }

    .topo-mobile .logo img {
        height: 60px;
        filter: brightness(20%);
    }

    .topo-mobile .logo img:hover {
        transition: 0.4s ease-in-out;
        filter: brightness(65%);
    }

    .input {
        width: 90vw;
    }

    input {
        width: 75vw;
    }

    .botoes {
        gap: 20px;
        flex-wrap: nowrap;
        justify-content: flex-end;
    }

    button p {
        font-size: 14px;
    }

    button img {
        height: 4vh;
    }

    .logo {
        position: static;
    }
}

/* Responsividade para tablets pequenos (600px - 767px) */
@media (min-width: 600px) and (max-width: 767px) {
    .topo-mobile .logo img {
        height: 50px;
    }
    
    .botoes {
        gap: 15px;
    }
    
    button p {
        font-size: 13px;
    }
    
    .input {
        width: 85vw;
    }
}

/* Responsividade para celulares grandes (480px - 599px) */
@media (min-width: 480px) and (max-width: 599px) {
    .topo-mobile .logo {
        display: none; /* Oculta a logo em telas pequenas */
    }
    
    .topo-mobile {
        justify-content: center;
    }
    
    .botoes {
        gap: 12px;
    }
    
    button p {
        font-size: 12px;
    }
    
    button img {
        height: 3.5vh;
    }
    
    .input {
        width: 88vw;
    }
    
    input {
        width: 70vw;
    }
}

/* Responsividade para celulares pequenos (320px - 479px) */
@media (min-width: 320px) and (max-width: 479px) {
    .topo-mobile .logo {
        display: none; /* Oculta a logo em telas pequenas */
    }
    
    .topo-mobile {
        justify-content: center;
    }
    
    .botoes {
        gap: 8px;
    }
    
    button p {
        font-size: 11px;
    }
    
    button img {
        height: 3vh;
    }
    
    .input {
        width: 92vw;
    }
    
    input {
        width: 65vw;
    }
    
    header {
        gap: 10px;
        padding: 8px;
    }
}

/* Responsividade para celulares muito pequenos (< 320px) */
@media (max-width: 319px) {
    .topo-mobile .logo {
        display: none; /* Oculta a logo em telas pequenas */
    }
    
    .topo-mobile {
        justify-content: center;
    }
    
    .botoes {
        gap: 5px;
    }
    
    button p {
        font-size: 10px;
    }
    
    button img {
        height: 2.5vh;
    }
    
    .input {
        width: 95vw;
    }
    
    input {
        width: 60vw;
    }
    
    header {
        gap: 8px;
        padding: 5px;
    }
}

.Categorias {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 6vh;
    background: #02060af5;
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
    color: #63b3ed;
    background: transparent;
}

.Categorias button:hover img {
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
    color: #079ac7;
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
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    min-width: 18px;
}

.carrinho-dropdown-menu {
    position: fixed;
    top: 80px;
    right: 20px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    min-width: 320px;
    max-width: 400px;
    height: auto;
    z-index: 1000;
    padding: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.carrinho-dropdown-menu.mobile {
    display: flex;
    flex-direction: column;
    top: 100px;
    min-width: 280px;
    max-width: 320px;
    height: 550px;
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

.quantidade-btn {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    color: #495057;
    transition: all 0.2s;
}

.quantidade-btn:hover {
    background: #e9ecef;
    color: #495057;
}

.quantidade-btn:active {
    transform: scale(0.95);
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

/* Responsividade do carrinho */
@media (max-width: 768px) {
    .carrinho-dropdown-menu {
        right: 10px;
        min-width: 260px;
        max-width: calc(100vw - 20px);
    }
    
    .carrinho-item-nome {
        max-width: 140px;
    }
    
    .carrinho-botoes {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
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

@media (max-width: 950px) {
    .Categorias button:nth-child(3),
    .Categorias button:nth-child(5),
    .Categorias button:nth-child(4) {
        display: none;
    }
    .Categorias {
        gap: 55px;
    }
}

@media (max-width: 768px) {
    .Categorias {
        gap: 40px;
        padding: 0 10px;
    }
    
    .Categorias button {
        padding: 4px 8px;
        font-size: 13px;
    }
    
    .Categorias img {
        width: 10px;
        min-width: 10px;
    }
}

@media (max-width: 550px) {
    .Categorias button:nth-child(6) {
        display: none;
    }
    .Categorias {
        gap: 30px;
        padding: 0 5px;
    }
    
    .Categorias button {
        padding: 3px 6px;
        font-size: 12px;
    }
    
    .Categorias img {
        width: 8px;
        min-width: 8px;
    }
}

@media (max-width: 480px) {
    .Categorias {
        gap: 20px;
        padding: 0 3px;
    }
    
    .Categorias button {
        padding: 2px 4px;
        font-size: 11px;
    }
    
    .Categorias img {
        width: 6px;
        min-width: 6px;
    }
}

@media (max-width: 320px) {
    .Categorias {
        gap: 15px;
        padding: 0 2px;
    }
    
    .Categorias button {
        padding: 1px 3px;
        font-size: 10px;
    }
    
    .Categorias img {
        width: 5px;
        min-width: 5px;
    }
}



/* Responsividade para TVs grandes (1200px+) */
@media (min-width: 1200px) {
    header {
        gap: 8vw;
        padding: 15px 30px;
    }
    
    .input {
        width: 35vw;
        max-width: 800px;
    }
    
    .logo img {
        height: 110px;
    }
    
    .botoes {
        gap: 15px;
    }
    
    .botoes p {
        font-size: 18px;
    }
    
    .botoes img {
        width: 28px;
        height: 28px;
    }
}

/* Responsividade para monitores médios (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
    header {
        gap: 7vw;
        padding: 12px 25px;
    }
    
    .input {
        width: 38vw;
        max-width: 750px;
    }
    
    .logo img {
        height: 100px;
    }
    
    .botoes {
        gap: 12px;
    }
    
    .botoes p {
        font-size: 17px;
    }
}

/* Responsividade para tablets grandes (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
    header {
        gap: 6vw;
        padding: 10px 20px;
    }
    
    .input {
        width: 42vw;
        max-width: 650px;
    }
    
    .logo img {
        height: 85px;
    }
    
    .botoes {
        gap: 10px;
    }
    
    .botoes p {
        font-size: 16px;
    }
    
    .botoes img {
        width: 22px;
        height: 22px;
    }
}

</style>
