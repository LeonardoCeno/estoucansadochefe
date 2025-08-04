<template>
  <div class="tudo">
    <div v-if="mostraFormulario" class="criacao-form-wrapper">
      <div class="criacao-form">
        <h2>{{ editando ? 'Editar Produto' : 'Criar Produto' }}</h2>
        <form @submit.prevent="editando ? atualizarProduto() : criarProduto()">
          <div>
            <label>Nome:</label>
            <input v-model="nomeForm" required />
          </div>
          <div>
            <label>Descrição:</label>
            <textarea v-model="descricaoForm" required></textarea>
          </div>
          <div class="linha-dupla">
            <div class="campo-metade">
              <label>Preço:</label>
              <input type="number" v-model.number="precoForm" min="0" step="0.01" required />
            </div>
            <div class="campo-metade">
              <label>Estoque:</label>
              <input type="number" v-model.number="estoqueForm" min="0" required />
            </div>
          </div>
          <div>
            <label>Categoria:</label>
            <select v-model="categoriaIdForm" required>
              <option value="" disabled>Selecione</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label>Imagem:</label>
            <input type="file" @change="onFileChange" accept="image/*" />
          </div>
          <button type="submit">{{ editando ? 'Salvar' : 'Criar Produto' }}</button>
          <button type="button" @click="editando ? cancelarEdicao() : fecharFormulario()">Cancelar</button>
        </form>
        <p v-if="editando ? mensagemEdicao : mensagem">{{ editando ? mensagemEdicao : mensagem }}</p>
      </div>
    </div>
    <div class="produtos" >
      <div class="titulo-container">
      <h3 class="titulo-principal">{{ modoDesconto ? 'Descontos' : 'Produtos' }}</h3>
      </div>
      <div class="busca-container">
        <div class="input-busca">
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            v-model="termoBusca" 
 
          />
          <img src="../components/img/LupaFinal.png" alt="Buscar" />
        </div>
      </div>
      <div class="produtos-header">
          <div class="filtro-categorias">
            <div class="filtro-estoque">
              <label for="filtroEstoque" style="margin-right: 6px; font-size: 1rem;">Estoque:</label>
              <select id="filtroEstoque" v-model="estoqueSelecionado">
                <option value="">Indefinido</option>
                <option value="0">0</option>
                <option value="10-30">10-30</option>
                <option value="30-50">30-50</option>
                <option value="50-100">50-100</option>
                <option value="100+">100 ou mais</option>
              </select>
            </div>
            <div class="filtro-categoria">
              <label for="filtroCategoria" style="margin-right: 6px; font-size: 1rem;">Categoria:</label>
              <select id="filtroCategoria" v-model="categoriaSelecionada">
                <option value="">Todas</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <div class="botoes-container">
            <button v-if="!modoDesconto" class="novo-produto-btn" @click="abrirCriacao">Novo produto</button>
            <button v-if="modoDesconto" class="novo-produto-btn" @click="null">
              Novo desconto
            </button>
            <button class="alternar-modo-btn" @click="alternarModo">
              {{ modoDesconto ? 'Produtos' : 'Descontos' }}
            </button>
          </div>
        </div>
    <div v-if="carregandoProdutos" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando produtos...</p>
    </div>
    <div v-else-if="erroProdutos">{{ erroProdutos }}</div>
    <div v-else>
        <div v-if="produtosFiltrados.length === 0">
          <div v-if="termoBusca">Nenhum produto encontrado para "{{ termoBusca }}".</div>
          <div v-else>Nenhum produto cadastrado ainda.</div>
        </div>
      <ul v-else class="lista">
        <li v-for="produto in produtosFiltrados" :key="produto.id" class="produto" @click="null">
          <div class="nome-preco-imagem">
            <img v-if="produto.image_path" :src="produto.image_path" alt="Imagem do produto" class="produto-imagem" />
            <h4>{{ produto.name }}</h4>
            <p>R$ {{ produto.price }}</p>
          </div>
          <div class="BTli" @click.stop>
            <button @click="editarProduto(produto)">Editar</button>
            <button class="excluir-btn" @click="abrirModalExclusao(produto.id)">Excluir</button>
          </div>
          <span style="font-size:12px;color:#555;">Estoque: {{ produto.stock }}</span>
        </li>
      </ul>
    </div>
    </div>
  </div>
  
  <!-- Modal de Confirmação -->
  <div v-if="mostrarModalConfirmacao" class="modal-overlay">
      <div class="modal-confirmacao">
          <h3>Confirmar Exclusão</h3>
          <p>Tem certeza que deseja excluir este produto?</p>
          <div class="modal-botoes">
              <button @click="confirmarExclusao" class="btn-confirmar">Confirmar</button>
              <button @click="fecharModalConfirmacao" class="btn-cancelar">Cancelar</button>
          </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '../services/api'

const categorias = ref([])
const mensagem = ref('')
const toast = useToast()
const mostraFormulario = ref(false)
const mostrarModalConfirmacao = ref(false)
const produtoParaExcluir = ref(null)

const termoBusca = ref('')

const modoDesconto = ref(false)

const editando = ref(false)
const idProduto = ref(null)
const mensagemEdicao = ref('')

const nomeForm = ref('')
const descricaoForm = ref('')
const precoForm = ref(0)
const estoqueForm = ref(0)
const categoriaIdForm = ref('')
const imagemForm = ref(null)

const categoriaSelecionada = ref('')
const estoqueSelecionado = ref('')

const produtosFiltrados = computed(() => {
  let produtosFiltrados = produtos.value
  if (termoBusca.value.trim()) {
    const termo = termoBusca.value.toLowerCase().trim()
    produtosFiltrados = produtosFiltrados.filter(produto => 
      produto.name && produto.name.toLowerCase().includes(termo)
    )
  }
  if (categoriaSelecionada.value) {
    produtosFiltrados = produtosFiltrados.filter(produto => 
      String(produto.category_id) === String(categoriaSelecionada.value)
    )
  }
  if (estoqueSelecionado.value) {
    produtosFiltrados = produtosFiltrados.filter(produto => {
      const estoque = produto.stock
      switch (estoqueSelecionado.value) {
        case '0':
          return estoque === 0
        case '10-30':
          return estoque >= 10 && estoque <= 30
        case '30-50':
          return estoque >= 30 && estoque <= 50
        case '50-100':
          return estoque >= 50 && estoque <= 100
        case '100+':
          return estoque >= 100
        default:
          return true
      }
    })
  }
  return produtosFiltrados
})

const produtos = ref([])
const carregandoProdutos = ref(true)
const erroProdutos = ref('')



function alternarModo() {
  modoDesconto.value = !modoDesconto.value
  termoBusca.value = ''
  categoriaSelecionada.value = ''
  estoqueSelecionado.value = ''
}

onMounted(async () => {
  try {
    const { data } = await api.get('/categories/user/228')
    categorias.value = data
  } catch (e) {
    mensagem.value = 'Erro ao carregar categorias.'
  }
  await carregarProdutos()
})

function onFileChange(e) {
  imagemForm.value = e.target.files[0]
}

function abrirCriacao() {
  editando.value = false
  mostraFormulario.value = true
  nomeForm.value = ''
  descricaoForm.value = ''
  precoForm.value = 0
  estoqueForm.value = 0
  categoriaIdForm.value = ''
  imagemForm.value = null
  mensagem.value = ''
}

function fecharFormulario() {
  mostraFormulario.value = false
  editando.value = false
  idProduto.value = null
  nomeForm.value = ''
  descricaoForm.value = ''
  precoForm.value = 0
  estoqueForm.value = 0
  categoriaIdForm.value = ''
  imagemForm.value = null
  mensagem.value = ''
  mensagemEdicao.value = ''
}

async function criarProduto() {
  mensagem.value = ''
  try {
    const formData = new FormData()
    formData.append('name', nomeForm.value)
    formData.append('description', descricaoForm.value)
    formData.append('price', precoForm.value)
    formData.append('stock', estoqueForm.value)
    formData.append('category_id', categoriaIdForm.value)
    if (imagemForm.value) formData.append('image', imagemForm.value)
    await api.post('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.success('Produto criado com sucesso!')
    await carregarProdutos()
    fecharFormulario()
  } catch (e) {
    toast.error('Erro ao criar produto.')
  }
}

function editarProduto(produto) {
  editando.value = true
  mostraFormulario.value = false
  idProduto.value = produto.id
  mensagemEdicao.value = ''
  nomeForm.value = produto.name
  descricaoForm.value = produto.description
  precoForm.value = produto.price
  estoqueForm.value = produto.stock
  categoriaIdForm.value = produto.category_id
  imagemForm.value = null
  mostraFormulario.value = true
}
function cancelarEdicao() {
  editando.value = false
  idProduto.value = null
  mensagemEdicao.value = ''
  mostraFormulario.value = false
  nomeForm.value = ''
  descricaoForm.value = ''
  precoForm.value = 0
  estoqueForm.value = 0
  categoriaIdForm.value = ''
  imagemForm.value = null
}

async function atualizarProduto() {
  mensagemEdicao.value = ''
  try {
    await api.put(`/products/${idProduto.value}`, {
      name: nomeForm.value,
      description: descricaoForm.value,
      price: precoForm.value,
      category_id: categoriaIdForm.value
    })
    await api.put(`/products/${idProduto.value}/stock`, {
      stock: Number(estoqueForm.value)
    })
    if (imagemForm.value) {
      const formData = new FormData()
      formData.append('image', imagemForm.value)
      await api.put(`/products/${idProduto.value}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    toast.success('Produto atualizado com sucesso!')
    await carregarProdutos()
    cancelarEdicao()
  } catch (e) {
    toast.error('Erro ao atualizar produto.')
  }
}

function abrirModalExclusao(id) {
  produtoParaExcluir.value = id
  mostrarModalConfirmacao.value = true
}

async function confirmarExclusao() {
  try {
    await api.delete(`/products/${produtoParaExcluir.value}`)
    toast.success('Produto excluído com sucesso!')
    await carregarProdutos()
    fecharModalConfirmacao()
  } catch (e) {
    toast.error('Erro ao excluir produto.')
    fecharModalConfirmacao()
  }
}

function fecharModalConfirmacao() {
  mostrarModalConfirmacao.value = false
  produtoParaExcluir.value = null
}

async function carregarProdutos() {
  carregandoProdutos.value = true
  erroProdutos.value = ''
  try {
    const { data } = await api.get('/products/user/228')
    const produtosCompletos = data.map(produto => ({
      ...produto,
      image_path: produto.image_path 
        ? `http://35.196.79.227:8000${produto.image_path}` 
        : '/placeholder-image.jpg'
    }))
    produtos.value = produtosCompletos
  } catch (e) {
    erroProdutos.value = 'Erro ao carregar produtos.'
    produtos.value = []
  } finally {
    carregandoProdutos.value = false
  }
}

</script>

<style scoped>

.tudo {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background-color: #ffffff;
    padding: 20px;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
}

.produtos {
  width: 100%;
  max-width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.novo-produto-btn {
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #1565C0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-block;
}

.novo-produto-btn:hover {
  background-color: #0D47A1;
}

.alternar-modo-btn {
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #06080afa;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-block;
}

.alternar-modo-btn:hover {
  background-color: #0a0d0f;
}

.criacao-form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: auto;
}

.criacao-form {
  background-color: #fff;
  padding: 32px 24px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  width: 98vw;
  max-width: 540px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 2px solid #02060af5;
}

.criacao-form h2 {
  font-size: 2.5rem;
  font-family: helvetica;
  margin-bottom: 20px;
}

.criacao-form label {
  display: block;
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: bold;
}

.criacao-form input[type="text"],
.criacao-form textarea,
.criacao-form input[type="file"],
.criacao-form input[type="number"],
.criacao-form select {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.criacao-form button {
  background-color: #1565C0;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
  margin-right: 10px;
}

.criacao-form button:hover {
  background-color: #0D47A1;
}

.criacao-form button:last-child {
  background-color: #f44336;
}

.criacao-form button:last-child:hover {
  background-color: #da190b;
}

.criacao-form form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.criacao-form form button {
  margin-right: 10px;
  margin-bottom: 0;
}

.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 20px;
  flex-wrap: wrap;
  gap: 15px;
  width: 100%;
  box-sizing: border-box;
}

.busca-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.input-busca {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 15px;
  padding: 0 20px;
  width: 100%;
  max-width: 500px;
  height: 40px;
  border: 1px solid #6d6d6d;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  box-sizing: border-box;
}

.input-busca:focus-within {
  border: 1.8px solid #03040cf5;
}

.input-busca input {
  width: 100%;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
  padding-right: 40px;
}

.input-busca input::placeholder {
  color: #95a5a6;
  font-style: italic;
  font-weight: 400;
}

.input-busca img {
  width: auto;
  height: 20px;
  filter: brightness(20%);
  position: absolute;
  right: 15px;
}

ul {
  padding-left: 0;
  list-style: none;
  max-height: 62vh;
  scrollbar-color: rgb(100, 100, 100) rgba(241, 241, 241, 0.527);
}

li {
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.1rem;
  border: 1px solid #a9b5b6;
}

.BTli {
  display: flex;
  gap: 1vw;
}

.excluir-btn {
  background-color: #dc3545 !important;
  color: white !important;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;
}

.excluir-btn:hover {
  background-color: #b71c1c !important;
}

.BTli button {
  background-color: #6c757d;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;
}

.BTli button:hover {
  background-color: #5a6268;
}

.linha-dupla {
  display: flex;
  gap: 16px;
}

.campo-metade {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filtro-categorias {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-start;
}

.filtro-estoque,
.filtro-categoria {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filtro-estoque select,
.filtro-categoria select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  min-width: 120px;
}

.filtro-estoque select:focus,
.filtro-categoria select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.botoes-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.nome-preco-imagem {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.nome-preco-imagem p {
  font-size: 22px;
  color: rgb(49, 49, 49);
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
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.produto h4 {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  color: rgb(65, 65, 65);
  margin-top: 10px;
  height: 40px;
}

.lista {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  justify-items: center;
  gap: 15px;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-confirmacao {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    text-align: center;
    border: 2px solid #02060af5;
}

.modal-confirmacao h3 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.3rem;
}

.modal-confirmacao p {
    margin: 0 0 25px 0;
    color: #666;
    font-size: 1rem;
}

.modal-botoes {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.btn-confirmar {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.btn-confirmar:hover {
    background-color: #b71c1c;
}

.btn-cancelar {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.btn-cancelar:hover {
    background-color: #545b62;
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

.titulo-container {
  text-align: center;
  padding: 10px 0;
}

.titulo-principal {
  margin: 0;
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
}

/* ===== MEDIA QUERIES PARA RESPONSIVIDADE ===== */

/* Tablet Grande (1200px - 1024px) */
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
  
  .input-busca {
    max-width: 450px;
  }
}

/* Tablet Médio (1024px - 768px) */
@media (max-width: 1024px) {
  .tudo {
    padding: 15px;
  }
  
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
  
  .titulo-principal {
    font-size: 1.8rem;
  }
  
  .input-busca {
    max-width: 400px;
  }
  
  .produtos-header {
    padding: 0 15px;
    gap: 10px;
  }
  
  .filtro-categorias {
    gap: 10px;
  }
  
  .novo-produto-btn,
  .alternar-modo-btn {
    padding: 8px 16px;
    font-size: 1rem;
  }
}

/* Tablet Pequeno (768px - 600px) */
@media (max-width: 768px) {
  .tudo {
    padding: 10px;
  }
  
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
  
  .titulo-principal {
    font-size: 1.6rem;
  }
  
  .input-busca {
    max-width: 350px;
    height: 35px;
  }
  
  .input-busca input {
    font-size: 14px;
  }
  
  .produtos-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    padding: 0 10px;
  }
  
  .filtro-categorias {
    justify-content: center;
    gap: 15px;
  }
  
  .botoes-container {
    justify-content: center;
    margin-left: 0;
  }
  
  .novo-produto-btn,
  .alternar-modo-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .filtro-estoque select,
  .filtro-categoria select {
    padding: 6px 8px;
    font-size: 0.8rem;
    min-width: 100px;
  }
  
  .filtro-estoque label,
  .filtro-categoria label {
    font-size: 0.9rem !important;
  }
}

/* Mobile Grande (600px - 480px) */
@media (max-width: 600px) {
  .tudo {
    padding: 8px;
  }
  
  .lista {
    grid-template-columns: repeat(1, 1fr);
    gap: 8px;
    padding: 8px;
  }
  
  .produto {
    max-width: 200px;
    padding: 8px;
    margin-top: 2vh;
  }
  
  .nome-preco-imagem img {
    width: 120px;
    height: 160px;
  }
  
  .titulo-principal {
    font-size: 1.4rem;
  }
  
  .input-busca {
    max-width: 300px;
    height: 32px;
  }
  
  .input-busca input {
    font-size: 13px;
  }
  
  .produtos-header {
    gap: 12px;
    padding: 0 8px;
  }
  
  .filtro-categorias {
    gap: 12px;
  }
  
  .novo-produto-btn,
  .alternar-modo-btn {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
  
  .filtro-estoque select,
  .filtro-categoria select {
    padding: 5px 6px;
    font-size: 0.7rem;
    min-width: 80px;
  }
  
  .filtro-estoque label,
  .filtro-categoria label {
    font-size: 0.8rem !important;
  }
  
  .produto h4 {
    font-size: 13px;
    height: 35px;
  }
  
  .nome-preco-imagem p {
    font-size: 18px;
  }
}

/* Mobile Pequeno (480px - 360px) */
@media (max-width: 480px) {
  .tudo {
    padding: 5px;
  }
  
  .lista {
    grid-template-columns: repeat(1, 1fr);
    gap: 6px;
    padding: 5px;
  }
  
  .produto {
    max-width: 180px;
    padding: 6px;
  }
  
  .nome-preco-imagem img {
    width: 100px;
    height: 140px;
  }
  
  .titulo-principal {
    font-size: 1.2rem;
  }
  
  .input-busca {
    max-width: 250px;
    height: 30px;
  }
  
  .input-busca input {
    font-size: 12px;
  }
  
  .produtos-header {
    gap: 10px;
    padding: 0 5px;
  }
  
  .filtro-categorias {
    gap: 10px;
  }
  
  .novo-produto-btn,
  .alternar-modo-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
  
  .filtro-estoque select,
  .filtro-categoria select {
    padding: 4px 5px;
    font-size: 0.6rem;
    min-width: 70px;
  }
  
  .filtro-estoque label,
  .filtro-categoria label {
    font-size: 0.7rem !important;
  }
  
  .produto h4 {
    font-size: 12px;
    height: 30px;
  }
  
  .nome-preco-imagem p {
    font-size: 16px;
  }
}

/* Mobile Muito Pequeno (360px - 320px) */
@media (max-width: 360px) {
  .lista {
    grid-template-columns: repeat(1, 1fr);
    gap: 5px;
    padding: 4px;
  }
  
  .produto {
    max-width: 160px;
    padding: 5px;
  }
  
  .nome-preco-imagem img {
    width: 80px;
    height: 120px;
  }
  
  .titulo-principal {
    font-size: 1.1rem;
  }
  
  .input-busca {
    max-width: 200px;
    height: 28px;
  }
  
  .input-busca input {
    font-size: 11px;
  }
  
  .novo-produto-btn,
  .alternar-modo-btn {
    padding: 3px 6px;
    font-size: 0.6rem;
  }
  
  .filtro-estoque select,
  .filtro-categoria select {
    padding: 3px 4px;
    font-size: 0.5rem;
    min-width: 60px;
  }
  
  .filtro-estoque label,
  .filtro-categoria label {
    font-size: 0.6rem !important;
  }
  
  .produto h4 {
    font-size: 11px;
    height: 25px;
  }
  
  .nome-preco-imagem p {
    font-size: 14px;
  }
}

/* Modal responsivo */
@media (max-width: 768px) {
  .modal-confirmacao {
    padding: 20px;
    max-width: 90%;
  }
  
  .modal-confirmacao h3 {
    font-size: 1.1rem;
  }
  
  .modal-confirmacao p {
    font-size: 0.9rem;
  }
  
  .modal-botoes {
    gap: 10px;
  }
  
  .btn-confirmar,
  .btn-cancelar {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .modal-confirmacao {
    padding: 15px;
  }
  
  .modal-confirmacao h3 {
    font-size: 1rem;
  }
  
  .modal-confirmacao p {
    font-size: 0.8rem;
  }
  
  .btn-confirmar,
  .btn-cancelar {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

</style>