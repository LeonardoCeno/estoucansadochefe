import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { defineStore } from 'pinia'
import { 
  getDescontos, 
  criarDesconto, 
  atualizarDesconto, 
  excluirDesconto 
} from '../services/api'

export const useDiscountsStore = defineStore('discounts', () => {
  const toast = useToast()
  
  // Estado dos descontos
  const descontos = ref([])
  
  // Estado dos filtros
  const filtroDescontoSelecionado = ref('')
  
  // Estado do modo
  const modoDesconto = ref(false)
  
  // Estado do formulário de desconto
  const mostraFormularioDesconto = ref(false)
  const editandoDesconto = ref(false)
  const idDesconto = ref(null)
  const mensagemDesconto = ref('')
  const mensagemEdicaoDesconto = ref('')
  const selecionandoProduto = ref(false)
  const produtoSelecionado = ref(null)
  
  // Dados do formulário de desconto
  const descricaoDescontoForm = ref('')
  const percentualDescontoForm = ref(0)
  const dataInicioForm = ref('')
  const dataFimForm = ref('')
  
  // Estado dos modais
  const mostrarModalConfirmacaoDesconto = ref(false)
  const descontoParaExcluir = ref(null)
  
  // Funções para descontos
  async function carregarDescontos() {
    try {
      const data = await getDescontos()
      descontos.value = data
    } catch (error) {
      console.error('Erro ao carregar descontos:', error)
    }
  }
  
  function produtoTemDesconto(produtoId) {
    return descontos.value.some(desconto => desconto.product_id === produtoId)
  }
  
  function getDescontoProduto(produtoId) {
    return descontos.value.find(desconto => desconto.product_id === produtoId)
  }
  
  function descontoExpirado(produtoId) {
    const desconto = getDescontoProduto(produtoId)
    if (!desconto) return false
    const dataFim = new Date(desconto.end_date)
    return dataFim < new Date()
  }
  
  function descontoAtivo(produtoId) {
    const desconto = getDescontoProduto(produtoId)
    if (!desconto) return false
    const dataInicio = new Date(desconto.start_date)
    const dataFim = new Date(desconto.end_date)
    const agora = new Date()
    return dataInicio <= agora && dataFim >= agora
  }
  
  function descontoFuturo(produtoId) {
    const desconto = getDescontoProduto(produtoId)
    if (!desconto) return false
    const dataInicio = new Date(desconto.start_date)
    const agora = new Date()
    return dataInicio > agora
  }
  
  async function criarDescontoLocal() {
    mensagemDesconto.value = ''
    try {
      const dados = {
        description: descricaoDescontoForm.value,
        discount_percentage: percentualDescontoForm.value,
        start_date: dataInicioForm.value,
        end_date: dataFimForm.value,
        product_id: produtoSelecionado.value.id
      }
      
      await criarDesconto(dados)
      toast.success('Desconto criado com sucesso!')
      await carregarDescontos()
      fecharFormularioDesconto()
    } catch (error) {
      toast.error('Erro ao criar desconto.')
      console.error('Erro ao criar desconto:', error)
    }
  }
  
  async function atualizarDescontoLocal() {
    mensagemEdicaoDesconto.value = ''
    try {
      const dados = {
        description: descricaoDescontoForm.value,
        discount_percentage: percentualDescontoForm.value,
        start_date: dataInicioForm.value,
        end_date: dataFimForm.value,
        product_id: produtoSelecionado.value.id
      }
      
      await atualizarDesconto(idDesconto.value, dados)
      toast.success('Desconto atualizado com sucesso!')
      await carregarDescontos()
      fecharFormularioDesconto()
    } catch (error) {
      toast.error('Erro ao atualizar desconto.')
      console.error('Erro ao atualizar desconto:', error)
    }
  }
  
  async function excluirDescontoLocal(descontoId) {
    try {
      await excluirDesconto(descontoId)
      toast.success('Desconto excluído com sucesso!')
      await carregarDescontos()
      fecharModalConfirmacaoDesconto()
    } catch (error) {
      toast.error('Erro ao excluir desconto.')
      console.error('Erro ao excluir desconto:', error)
    }
  }
  
  // Funções de controle de formulários de desconto
  function abrirCriacaoDesconto() {
    selecionandoProduto.value = true
    toast.info('Selecione o produto')
  }
  
  function fecharFormularioDesconto() {
    mostraFormularioDesconto.value = false
    editandoDesconto.value = false
    idDesconto.value = null
    produtoSelecionado.value = null
    selecionandoProduto.value = false
    limparFormularioDesconto()
  }
  
  function limparFormularioDesconto() {
    descricaoDescontoForm.value = ''
    percentualDescontoForm.value = 0
    dataInicioForm.value = ''
    dataFimForm.value = ''
    mensagemDesconto.value = ''
    mensagemEdicaoDesconto.value = ''
  }
  
  function selecionarProdutoParaDesconto(produto) {
    if (produtoTemDesconto(produto.id)) {
      toast.warning('Este produto já possui desconto')
      return
    }
    
    produtoSelecionado.value = produto
    selecionandoProduto.value = false
    editandoDesconto.value = false
    mostraFormularioDesconto.value = true
    limparFormularioDesconto()
  }
  
  function editarDescontoProduto(produto) {
    const desconto = getDescontoProduto(produto.id)
    if (!desconto) {
      toast.warning('Este produto não possui desconto')
      return
    }
    
    editandoDesconto.value = true
    idDesconto.value = desconto.id
    produtoSelecionado.value = produto
    mostraFormularioDesconto.value = true
    
    // Preencher formulário
    descricaoDescontoForm.value = desconto.description
    percentualDescontoForm.value = desconto.discount_percentage
    dataInicioForm.value = desconto.start_date.slice(0, 16) // Formato para datetime-local
    dataFimForm.value = desconto.end_date.slice(0, 16)
    mensagemEdicaoDesconto.value = ''
  }
  
  function cancelarEdicaoDesconto() {
    editandoDesconto.value = false
    idDesconto.value = null
    mensagemEdicaoDesconto.value = ''
    fecharFormularioDesconto()
  }
  
  function cancelarSelecao() {
    selecionandoProduto.value = false
    produtoSelecionado.value = null
    fecharFormularioDesconto()
    toast.info('Seleção de produto cancelada.')
  }
  
  // Funções de controle de modais
  function abrirModalExclusaoDesconto(descontoId) {
    if (!descontoId) {
      toast.warning('Este produto não possui desconto')
      return
    }
    descontoParaExcluir.value = descontoId
    mostrarModalConfirmacaoDesconto.value = true
  }
  
  function fecharModalConfirmacaoDesconto() {
    mostrarModalConfirmacaoDesconto.value = false
    descontoParaExcluir.value = null
  }
  
  function confirmarExclusaoDesconto() {
    if (descontoParaExcluir.value) {
      excluirDescontoLocal(descontoParaExcluir.value)
    }
  }
  
  // Funções de controle de modo
  function alternarModo() {
    modoDesconto.value = !modoDesconto.value
    
    // Sair do modo de seleção se estiver ativo
    if (selecionandoProduto.value) {
      cancelarSelecao()
    }
    
    if (modoDesconto.value) {
      carregarDescontos()
    }
  }
  
  function limparFiltros() {
    filtroDescontoSelecionado.value = ''
  }
  
  return {
    // Estado
    descontos,
    filtroDescontoSelecionado,
    modoDesconto,
    mostraFormularioDesconto,
    editandoDesconto,
    idDesconto,
    mensagemDesconto,
    mensagemEdicaoDesconto,
    selecionandoProduto,
    produtoSelecionado,
    descricaoDescontoForm,
    percentualDescontoForm,
    dataInicioForm,
    dataFimForm,
    mostrarModalConfirmacaoDesconto,
    descontoParaExcluir,
    
    // Funções de descontos
    carregarDescontos,
    produtoTemDesconto,
    getDescontoProduto,
    descontoExpirado,
    descontoAtivo,
    descontoFuturo,
    criarDescontoLocal,
    atualizarDescontoLocal,
    excluirDescontoLocal,
    
    // Funções de controle de formulários
    abrirCriacaoDesconto,
    fecharFormularioDesconto,
    limparFormularioDesconto,
    selecionarProdutoParaDesconto,
    editarDescontoProduto,
    cancelarEdicaoDesconto,
    cancelarSelecao,
    
    // Funções de controle de modais
    abrirModalExclusaoDesconto,
    fecharModalConfirmacaoDesconto,
    confirmarExclusaoDesconto,
    
    // Funções de controle de modo
    alternarModo,
    limparFiltros
  }
}) 