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
      <h3 class="titulo-principal">Produtos</h3>
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
            <button class="novo-produto-btn" @click="abrirCriacao">Novo produto</button>
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
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 30px;
    box-sizing: border-box;
}

.produtos {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.novo-produto-btn {
  padding: 10px 20px;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-block;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.3);
}

.novo-produto-btn:hover {
  background: linear-gradient(135deg, #0D47A1 0%, #0A3D91 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(21, 101, 192, 0.4);
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
  width: 100%;
}

li {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 15px;
  margin-bottom: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.1rem;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

li:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.BTli {
  display: flex;
  gap: 1vw;
}

.excluir-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
  color: white !important;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.excluir-btn:hover {
  background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.BTli button {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.BTli button:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  justify-items: center;
  gap: 20px;
  padding: 20px 0;
  width: 100%;
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
    padding: 35px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    max-width: 450px;
    width: 90%;
    text-align: center;
    border: 3px solid #02060af5;
    position: relative;
}

.modal-confirmacao::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
    border-radius: 16px 16px 0 0;
}

.modal-confirmacao h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 1.4rem;
    font-weight: 600;
}

.modal-confirmacao p {
    margin: 0 0 30px 0;
    color: #64748b;
    font-size: 1.1rem;
    line-height: 1.5;
}

.modal-botoes {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.btn-confirmar {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-confirmar:hover {
    background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.btn-cancelar {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-cancelar:hover {
    background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
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

.titulo-container {
  text-align: center;
  padding: 10px 0;
}

.titulo-principal {
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
}

/* ===== RESPONSIVIDADE APRIMORADA ===== */

/* Desktop Grande (1024px+) */
@media (max-width: 1024px) {
  .tudo {
    padding: 25px;
  }
  
  .produtos {
    padding: 25px;
  }
  
  .titulo-principal {
    font-size: 2rem;
  }
  
  .novo-produto-btn {
    padding: 10px 18px;
    font-size: 1.1rem;
  }
  
  .lista {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 15px;
    padding: 15px 0;
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

/* Tablet (768px) */
@media (max-width: 768px) {
  .tudo {
    padding: 20px;
  }
  
  .produtos {
    padding: 20px;
    border-radius: 12px;
  }
  
  .titulo-principal {
    font-size: 1.8rem;
  }
  
  .lista {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 15px;
    padding: 15px 0;
  }
  
  .produto {
    max-width: 200px;
    padding: 8px;
  }
  
  .nome-preco-imagem img {
    width: 120px;
    height: 180px;
  }
  
  .input-busca {
    max-width: 400px;
    height: 35px;
  }
  
  .input-busca input {
    font-size: 14px;
  }
  
  .produtos-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    padding: 0 15px;
  }
  
  .filtro-categorias {
    justify-content: center;
    gap: 15px;
  }
  
  .botoes-container {
    justify-content: center;
    margin-left: 0;
  }
  
  .novo-produto-btn {
    padding: 8px 16px;
    font-size: 1rem;
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



/* Mobile (600px) */
@media (max-width: 600px) {
  .tudo {
    padding: 15px;
  }
  
  .produtos {
    padding: 15px;
    border-radius: 8px;
  }
  
  .titulo-principal {
    font-size: 1.4rem;
  }
  
  .lista {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px 0;
  }
  
  .produto {
    max-width: 180px;
    padding: 8px;
    margin-top: 1vh;
  }
  
  .nome-preco-imagem img {
    width: 100px;
    height: 140px;
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
  
  .novo-produto-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .filtro-estoque select,
  .filtro-categoria select {
    padding: 5px 6px;
    font-size: 0.8rem;
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

/* Mobile Pequeno (480px) */
@media (max-width: 480px) {
  .tudo {
    padding: 10px;
  }
  
  .produtos {
    padding: 12px;
    border-radius: 8px;
  }
  
  .titulo-principal {
    font-size: 1.3rem;
  }
  
  .lista {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 10px 0;
  }
  
  .produto {
    max-width: 160px;
    padding: 6px;
  }
  
  .nome-preco-imagem img {
    width: 90px;
    height: 130px;
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
  
  .novo-produto-btn {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
  
  .filtro-estoque select,
  .filtro-categoria select {
    padding: 4px 5px;
    font-size: 0.7rem;
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

/* Mobile Muito Pequeno (360px) */
@media (max-width: 360px) {
  .tudo {
    padding: 8px;
  }
  
  .produtos {
    padding: 10px;
  }
  
  .titulo-principal {
    font-size: 1.1rem;
  }
  
  .lista {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px 0;
  }
  
  .produto {
    max-width: 140px;
    padding: 5px;
  }
  
  .nome-preco-imagem img {
    width: 80px;
    height: 120px;
  }
  
  .input-busca {
    max-width: 200px;
    height: 28px;
  }
  
  .input-busca input {
    font-size: 11px;
  }
  
  .novo-produto-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
  
  .filtro-estoque select,
  .filtro-categoria select {
    padding: 3px 4px;
    font-size: 0.6rem;
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

/* Modal Responsivo */
@media (max-width: 768px) {
  .modal-confirmacao {
    padding: 25px;
    margin: 20px;
  }
  
  .modal-confirmacao h3 {
    font-size: 1.2rem;
  }
  
  .modal-confirmacao p {
    font-size: 1rem;
    margin-bottom: 25px;
  }
  
  .modal-botoes {
    gap: 15px;
  }
  
  .btn-confirmar,
  .btn-cancelar {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .modal-confirmacao {
    padding: 20px;
    margin: 15px;
    border-radius: 12px;
  }
  
  .modal-confirmacao h3 {
    font-size: 1.1rem;
  }
  
  .modal-confirmacao p {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
  
  .modal-botoes {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-confirmar,
  .btn-cancelar {
    padding: 10px 16px;
    font-size: 0.9rem;
    width: 100%;
  }
}

</style>