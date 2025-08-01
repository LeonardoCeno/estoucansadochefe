<template>
  <div class="tudo">
    <!-- Modal de Criação/Edição de Cupom -->
    <div v-if="mostraFormulario" class="criacao-form-wrapper">
      <div class="criacao-form">
        <h2>{{ editando ? 'Editar Cupom' : 'Criar Cupom' }}</h2>
        <form @submit.prevent="editando ? salvarCupom() : adicionarCupom()">
          <div>
            <label>Código do Cupom:</label>
            <input v-model="codigoForm" required placeholder="Ex: DESCONTO20" />
          </div>
          <div>
            <label>Percentual de Desconto (%):</label>
            <input type="number" v-model.number="percentualForm" min="0" max="100" step="0.01" required />
          </div>
          <div class="linha-dupla">
            <div class="campo-metade">
              <label>Data de Início:</label>
              <input type="datetime-local" v-model="dataInicioForm" required />
            </div>
            <div class="campo-metade">
              <label>Data de Fim:</label>
              <input type="datetime-local" v-model="dataFimForm" required />
            </div>
          </div>
          <button type="submit">{{ editando ? 'Salvar' : 'Criar Cupom' }}</button>
          <button type="button" @click="editando ? cancelarEdicao() : fecharFormulario()">Cancelar</button>
        </form>
        <p v-if="editando ? mensagemEdicao : mensagem">{{ editando ? mensagemEdicao : mensagem }}</p>
      </div>
    </div>
    <!-- Conteúdo Principal -->
    <div class="cupons">
      <h3 class="titulo-principal">Gerenciar Cupons</h3>
      
      <!-- Header com Busca e Botões -->
      <div class="cupons-header">
        <div class="header-left">
          <div class="input-busca">
            <input 
              type="text" 
              placeholder="Buscar cupons..." 
              v-model="termoBusca" 
              @input="onInputBusca"
            />
            <img src="../components/img/LupaFinal.png" alt="Buscar" />
          </div>
        </div>

        <div class="header-right">
          <div class="filtro-status">
            <label for="filtroStatus" style="margin-right: 6px; font-size: 1rem;">Status:</label>
            <select id="filtroStatus" v-model="statusSelecionado">
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="expirado">Expirado</option>
              <option value="futuro">Futuro</option>
            </select>
          </div>
          
          <div class="botoes-acoes">
            <button class="novo-cupom-btn" @click="abrirCriacao">Novo Cupom</button>
          </div>
        </div>
      </div>

      <!-- Lista de Cupons -->
      <div v-if="carregandoCupons" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando cupons...</p>
      </div>
      <div v-else-if="erroCupons" class="error-container">
        <p>{{ erroCupons }}</p>
      </div>
      <div v-else>
        <div v-if="cuponsFiltrados.length === 0">
          <div v-if="termoBusca">Nenhum cupom encontrado para "{{ termoBusca }}".</div>
          <div v-else>Nenhum cupom cadastrado ainda.</div>
        </div>
        <ul v-else class="lista">
          <li v-for="cupom in cuponsFiltrados" :key="cupom.id" class="cupom" :class="getStatusClass(cupom)">
            <div class="cupom-info">
              <div class="codigo-desconto">
                <h4>{{ cupom.code }}</h4>
                <p class="percentual">{{ cupom.discount_percentage }}% OFF</p>
              </div>
              <div class="datas">
                <p><strong>Início:</strong> {{ formatarData(cupom.start_date) }}</p>
                <p><strong>Fim:</strong> {{ formatarData(cupom.end_date) }}</p>
              </div>
              <div class="status">
                <span :class="getStatusClass(cupom)">{{ getStatusText(cupom) }}</span>
              </div>
            </div>
            
            <div class="BTli" @click.stop>
              <button @click="editarCupom(cupom)">Editar</button>
              <button class="excluir-btn" @click="abrirModalExclusao(cupom.id)">Excluir</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- Modal de Confirmação -->
  <div v-if="mostrarModalConfirmacao" class="modal-overlay">
    <div class="modal-confirmacao">
      <h3>Confirmar Exclusão</h3>
      <p>Tem certeza que deseja excluir este cupom?</p>
      <div class="modal-botoes">
        <button @click="confirmarExclusao" class="btn-confirmar">Confirmar</button>
        <button @click="fecharModalConfirmacao" class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { getCupons, criarCupom, atualizarCupom, deletarCupom } from '../services/api'

const toast = useToast()
const cupons = ref([])
const carregandoCupons = ref(true)
const erroCupons = ref('')

// Estados de formulário
const mostraFormulario = ref(false)
const editando = ref(false)
const cupomId = ref(null)
const mensagem = ref('')
const mensagemEdicao = ref('')

// Formulário de cupom
const codigoForm = ref('')
const percentualForm = ref(0)
const dataInicioForm = ref('')
const dataFimForm = ref('')

const mostrarModalConfirmacao = ref(false)
const cupomParaExcluir = ref(null)

const termoBusca = ref('')
const statusSelecionado = ref('')

let timeoutBusca = null

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusText(cupom) {
  const hoje = new Date()
  const inicio = new Date(cupom.start_date)
  const fim = new Date(cupom.end_date)
  if (hoje >= inicio && hoje <= fim) return 'ATIVO'
  if (hoje > fim) return 'EXPIRADO'
  return 'FUTURO'
}

// a diferença dessa pra outra é que a de cima retorna texto e essa de baixo CSS
function getStatusClass(cupom) {
  const hoje = new Date()
  const inicio = new Date(cupom.start_date)
  const fim = new Date(cupom.end_date)
  if (hoje >= inicio && hoje <= fim) return 'cupom-ativo'
  if (hoje > fim) return 'cupom-expirado'
  return 'cupom-futuro'
}

const cuponsFiltrados = computed(() => {
  let filtrados = cupons.value
  if (termoBusca.value.trim()) {
    const termo = termoBusca.value.toLowerCase().trim()
    filtrados = filtrados.filter(cupom => 
      cupom.code && cupom.code.toLowerCase().includes(termo)
    )
  }
  if (statusSelecionado.value) {
    const hoje = new Date()
    filtrados = filtrados.filter(cupom => {
      const inicio = new Date(cupom.start_date)
      const fim = new Date(cupom.end_date)
      switch (statusSelecionado.value) {
        case 'ativo': return hoje >= inicio && hoje <= fim
        case 'expirado': return hoje > fim
        case 'futuro': return hoje < inicio
        default: return true
      }
    })
  }
  // aq q ordena primeiro ativos dps futuros dai expirados
  filtrados.sort((a, b) => {
    const hoje = new Date()
    const aInicio = new Date(a.start_date)
    const aFim = new Date(a.end_date)
    const bInicio = new Date(b.start_date)
    const bFim = new Date(b.end_date)
    const aAtivo = hoje >= aInicio && hoje <= aFim
    const bAtivo = hoje >= bInicio && hoje <= bFim
    const aFuturo = hoje < aInicio
    const bFuturo = hoje < bInicio
    if (aAtivo && !bAtivo) return -1
    if (bAtivo && !aAtivo) return 1
    if (aFuturo && !bFuturo) return -1
    if (bFuturo && !aFuturo) return 1
    return 0
  })
  return filtrados
})

function onInputBusca() {
  clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(() => {}, 100)
}

async function carregarCupons() {
  carregandoCupons.value = true
  erroCupons.value = ''
  try {
    cupons.value = await getCupons()
  } catch (e) {
    erroCupons.value = 'Erro ao carregar cupons.'
  } finally {
    carregandoCupons.value = false
  }
}

function abrirCriacao() {
  editando.value = false
  mostraFormulario.value = true
  codigoForm.value = ''
  percentualForm.value = 0
  dataInicioForm.value = ''
  dataFimForm.value = ''
  mensagem.value = ''
}

function fecharFormulario() {
  mostraFormulario.value = false
  editando.value = false
  cupomId.value = null
  codigoForm.value = ''
  percentualForm.value = 0
  dataInicioForm.value = ''
  dataFimForm.value = ''
  mensagem.value = ''
  mensagemEdicao.value = ''
}

async function adicionarCupom() {
  mensagem.value = ''
  try {
    const cupomData = {
      code: codigoForm.value,
      discount_percentage: Number(percentualForm.value),
      start_date: dataInicioForm.value + ':00',
      end_date: dataFimForm.value + ':00'
    }
    await criarCupom(cupomData)
    toast.success('Cupom criado com sucesso!')
    await carregarCupons()
    fecharFormulario()
  } catch (e) {
    console.error('Erro ao criar cupom:', e)
    toast.error('Erro ao criar cupom: ' + (e.response?.data?.detail || e.message || 'Erro desconhecido'))
  }
}

function editarCupom(cupom) {
  editando.value = true
  mostraFormulario.value = false
  cupomId.value = cupom.id
  mensagemEdicao.value = ''
  codigoForm.value = cupom.code
  percentualForm.value = cupom.discount_percentage
  dataInicioForm.value = cupom.start_date.slice(0, 16)
  dataFimForm.value = cupom.end_date.slice(0, 16)
  mostraFormulario.value = true
}

function cancelarEdicao() {
  editando.value = false
  cupomId.value = null
  mensagemEdicao.value = ''
  mostraFormulario.value = false
  codigoForm.value = ''
  percentualForm.value = 0
  dataInicioForm.value = ''
  dataFimForm.value = ''
}

async function salvarCupom() {
  mensagemEdicao.value = ''
  try {
    await atualizarCupom({
      code: codigoForm.value,
      discount_percentage: Number(percentualForm.value),
      start_date: dataInicioForm.value + ':00',
      end_date: dataFimForm.value + ':00'
    }, cupomId.value)
    toast.success('Cupom atualizado com sucesso!')
    await carregarCupons()
    cancelarEdicao()
  } catch (e) {
    console.error('Erro ao atualizar cupom:', e)
    toast.error('Erro ao atualizar cupom: ' + (e.response?.data?.detail || e.message || 'Erro desconhecido'))
  }
}

function abrirModalExclusao(id) {
  cupomParaExcluir.value = id
  mostrarModalConfirmacao.value = true
}

async function confirmarExclusao() {
  try {
    await deletarCupom(cupomParaExcluir.value)
    toast.success('Cupom excluído com sucesso!')
    await carregarCupons()
    fecharModalConfirmacao()
  } catch (e) {
    console.error('Erro ao excluir cupom:', e)
    toast.error('Erro ao excluir cupom: ' + (e.response?.data?.detail || e.message || 'Erro desconhecido'))
    fecharModalConfirmacao()
  }
}

function fecharModalConfirmacao() {
  mostrarModalConfirmacao.value = false
  cupomParaExcluir.value = null
}

onMounted(async () => {
  await carregarCupons()
})
</script>

<style scoped>

.tudo {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  padding: 30px 0px 0px 70px;
}

.cupons {
  width: 95%;
  height: 30%;
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
  max-height: 90vh;
  overflow-y: auto;
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
.criacao-form input[type="number"],
.criacao-form input[type="datetime-local"] {
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

.cupons-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  border-bottom: 1px solid rgb(167, 167, 167);
  padding-bottom: 20px;
  gap: 20px;
}

.header-left {
  flex: 0 0 auto;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.botoes-acoes {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.titulo-principal {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  padding: 20px 0;
  border-bottom: 2px solid #e0e0e0;
}

.input-busca {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 15px;
  padding: 0 20px;
  width: 300px;
  height: 40px;
  border: 1px solid #6d6d6d;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
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


.filtro-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filtro-status select {
  padding: 4px 6px;
  border-radius: 5px;
  border: 1px solid #bdbdbd;
  font-size: 0.9rem;
  width: auto;
  min-width: fit-content;
}

.novo-cupom-btn {
  padding: 10px 20px;
  font-size: 1.2rem;
  color: white;
  background-color: #1565C0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-block;
}

.novo-cupom-btn:hover {
  background-color: #0D47A1;
}

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  justify-items: center;
  padding: 4px;
  gap: 20px;
  position: relative;
}

ul {
  margin-top: 1rem;
  padding-left: 0;
  list-style: none;
  max-height: 58vh;
  overflow-y: auto;
  scrollbar-color: rgb(100, 100, 100) rgba(241, 241, 241, 0.527);
}

.cupom {
  background-color: #f0f0f0;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 7px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  font-size: 1.1rem;
  border: 1px solid #a9b5b6;
  width: 100%;
  max-width: 400px;
  min-height: 140px;
  transition: all 0.3s ease;
}

.cupom-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.codigo-desconto {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.codigo-desconto h4 {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  word-break: break-word;
  line-height: 1.2;
}

.percentual {
  font-size: 1.1rem;
  font-weight: bold;
  color: #4CAF50;
  margin: 0;
}

.datas {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 5px;
}

.datas p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.3;
}

.status {
  margin-top: auto;
  padding-top: 10px;
}

.status span {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  display: inline-block;
}

.cupom-ativo {
  border: 2px solid #4CAF50 !important;
  background-color: #f8fff8 !important;
}

.cupom-ativo .status span {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #4CAF50;
}

.cupom-expirado {
  border: 2px solid #f44336 !important;
  background-color: #fff8f8 !important;
}

.cupom-expirado .status span {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #f44336;
}

.cupom-futuro {
  border: 2px solid #ff9800 !important;
  background-color: #fffbf0 !important;
}

.cupom-futuro .status span {
  background-color: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ff9800;
}

.BTli {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 15px;
  flex-shrink: 0;
}

.BTli button {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  color: white;
  white-space: nowrap;
  min-width: 70px;
}

.BTli button:first-child {
  background-color: #6c757d;
}

.BTli button:first-child:hover {
  background-color: #5a6268;
}

.excluir-btn {
  background-color: #dc3545 !important;
}

.excluir-btn:hover {
  background-color: #b71c1c !important;
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

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: #dc3545;
  font-size: 1.1rem;
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
  text-align: center;
  max-width: 400px;
  width: 90%;
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

.btn-confirmar,
.btn-cancelar {
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  color: white;
}

.btn-confirmar {
  background-color: #1565C0;
}

.btn-confirmar:hover {
  background-color: #0D47A1;
}

.btn-cancelar {
  background-color: #6c757d;
}

.btn-cancelar:hover {
  background-color: #545b62;
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

@media (max-width: 768px) {
  .tudo {
    padding: 20px 15px 0px 15px;
  }
  
  .cupons {
    width: 100%;
    height: auto;
  }
  
  .cupons-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-left {
    order: 1;
  }
  
  .header-right {
    order: 2;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .filtro-status {
    order: 1;
  }
  
  .botoes-acoes {
    order: 2;
    justify-content: center;
  }
  
  .criacao-form {
    width: 95%;
    padding: 20px;
    margin: 10px;
  }
  
  .criacao-form h2 {
    font-size: 2rem;
    margin-bottom: 15px;
  }
  
  .criacao-form label {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  
  .criacao-form input[type="text"],
  .criacao-form input[type="number"],
  .criacao-form input[type="datetime-local"] {
    padding: 8px;
    margin-bottom: 15px;
    font-size: 0.9rem;
  }
  
  .criacao-form button {
    padding: 8px 16px;
    font-size: 1rem;
  }
  
  .novo-cupom-btn {
    padding: 8px 16px;
    font-size: 1rem;
  }
  
  .input-busca {
    width: 100%;
    max-width: 300px;
    height: 45px;
  }
  
  .input-busca input {
    font-size: 14px;
  }
  
  .input-busca img {
    height: 18px;
  }
  
  .filtro-status {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  
  .filtro-status select {
    padding: 3px 6px;
    font-size: 0.85rem;
  }
  
  .linha-dupla {
    flex-direction: column;
    gap: 12px;
  }
  
  .campo-metade {
    flex: none;
  }
  
  .lista {
    grid-template-columns: 1fr;
  }
  
  .cupom {
    max-width: 100%;
    padding: 15px;
    min-height: 120px;
  }
  
  .codigo-desconto h4 {
    font-size: 1.1rem;
  }
  
  .percentual {
    font-size: 1rem;
  }
  
  .BTli {
    gap: 6px;
    margin-left: 10px;
  }
  
  .BTli button {
    padding: 6px 10px;
    font-size: 0.8rem;
    min-width: 60px;
  }
}

@media (max-width: 480px) {
  .tudo {
    padding: 15px 10px 0px 10px;
  }
  
  .cupons-header {
    gap: 10px;
  }
  
  .criacao-form {
    width: 98%;
    padding: 15px;
    margin: 5px;
  }
  
  .criacao-form h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .criacao-form label {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
  
  .criacao-form input[type="text"],
  .criacao-form input[type="number"],
  .criacao-form input[type="datetime-local"] {
    padding: 6px;
    margin-bottom: 10px;
    font-size: 0.8rem;
  }
  
  .criacao-form button {
    padding: 6px 12px;
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
  
  .novo-cupom-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .input-busca {
    height: 40px;
  }
  
  .input-busca input {
    font-size: 13px;
  }
  
  .input-busca img {
    height: 16px;
  }
  
  .filtro-status {
    gap: 2px;
  }
  
  .filtro-status select {
    padding: 2px 4px;
    font-size: 0.75rem;
  }
  
  .linha-dupla {
    gap: 8px;
  }
  
  .cupom {
    padding: 12px;
    min-height: 110px;
  }
  
  .codigo-desconto h4 {
    font-size: 1rem;
  }
  
  .percentual {
    font-size: 0.9rem;
  }
  
  .datas p {
    font-size: 0.8rem;
  }
  
  .status span {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
  
  .BTli {
    gap: 5px;
    margin-left: 8px;
  }
  
  .BTli button {
    padding: 4px 8px;
    font-size: 0.75rem;
    min-width: 50px;
  }
  
  .modal-confirmacao {
    padding: 20px;
    margin: 20px;
  }
  
  .modal-botoes {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-confirmar,
  .btn-cancelar {
    padding: 12px 20px;
  }
}


@media (min-width: 1200px) {
  .cupons-header {
    flex-direction: row;
    align-items: center;
    gap: 30px;
  }
  
  .header-left {
    flex: 0 0 300px;
  }
  
  .header-right {
    flex: 1;
    justify-content: flex-end;
    gap: 20px;
  }
  
  .filtro-status {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .botoes-acoes {
    flex: 0 0 auto;
  }
}
</style>