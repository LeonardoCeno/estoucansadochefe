import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { defineStore } from 'pinia'
import api, { 
  getProdutos, 
  getCategorias, 
  getDescontos, 
  criarDesconto, 
  atualizarDesconto, 
  excluirDesconto 
} from '../services/api'

export const useProductsStore = defineStore('products', () => {
  const toast = useToast()
  
  // Estado dos produtos
  const produtos = ref([])
  const carregandoProdutos = ref(false)
  const erroProdutos = ref('')
  
  // Estado das categorias
  const categorias = ref([])
  
  // Estado dos descontos
  const descontos = ref([])
  
  // Estado dos filtros
  const termoBusca = ref('')
  const categoriaSelecionada = ref('')
  const estoqueSelecionado = ref('')
  const filtroDescontoSelecionado = ref('')
  
  // Estado do modo
  const modoDesconto = ref(false)
  
  // Estado do formulário de produto
  const mostraFormulario = ref(false)
  const editando = ref(false)
  const idProduto = ref(null)
  const mensagem = ref('')
  const mensagemEdicao = ref('')
  
  // Estado do formulário de desconto
  const mostraFormularioDesconto = ref(false)
  const editandoDesconto = ref(false)
  const idDesconto = ref(null)
  const mensagemDesconto = ref('')
  const mensagemEdicaoDesconto = ref('')
  const selecionandoProduto = ref(false)
  const produtoSelecionado = ref(null)
  
  // Dados do formulário de produto
  const nomeForm = ref('')
  const descricaoForm = ref('')
  const precoForm = ref(0)
  const estoqueForm = ref(0)
  const categoriaIdForm = ref('')
  const imagemForm = ref(null)
  
  // Dados do formulário de desconto
  const descricaoDescontoForm = ref('')
  const percentualDescontoForm = ref(0)
  const dataInicioForm = ref('')
  const dataFimForm = ref('')
  
  // Estado dos modais
  const mostrarModalConfirmacao = ref(false)
  const produtoParaExcluir = ref(null)
  const mostrarModalConfirmacaoDesconto = ref(false)
  const descontoParaExcluir = ref(null)
  
  // Computed properties
  const produtosFiltrados = computed(() => {
    let produtosFiltrados = produtos.value
    
    // Filtro por termo de busca
    if (termoBusca.value.trim()) {
      const termo = termoBusca.value.toLowerCase().trim()
      produtosFiltrados = produtosFiltrados.filter(produto => 
        produto.name && produto.name.toLowerCase().includes(termo)
      )
    }
    
    // Filtro por categoria
    if (categoriaSelecionada.value) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        String(produto.category_id) === String(categoriaSelecionada.value)
      )
    }
    
    // Filtro por estoque
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
    
    // Filtro de desconto (apenas no modo desconto)
    if (modoDesconto.value && filtroDescontoSelecionado.value) {
      produtosFiltrados = produtosFiltrados.filter(produto => {
        switch (filtroDescontoSelecionado.value) {
          case 'ativos':
            return descontoAtivo(produto.id)
          case 'futuros':
            return descontoFuturo(produto.id)
          case 'expirados':
            return descontoExpirado(produto.id)
          case 'sem-desconto':
            return !produtoTemDesconto(produto.id)
          default:
            return true
        }
      })
    }
    
    return produtosFiltrados
  })
  
  // Funções para produtos
  async function carregarProdutos() {
    try {
      carregandoProdutos.value = true
      erroProdutos.value = ''
      const data = await getProdutos()
      produtos.value = data
    } catch (error) {
      erroProdutos.value = 'Erro ao carregar produtos.'
      console.error('Erro ao carregar produtos:', error)
    } finally {
      carregandoProdutos.value = false
    }
  }
  
  async function carregarCategorias() {
    try {
      const { data } = await api.get('/categories/user/228')
      categorias.value = data
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
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
    } catch (error) {
      toast.error('Erro ao criar produto.')
      console.error('Erro ao criar produto:', error)
    }
  }
  
  async function atualizarProduto() {
    mensagemEdicao.value = ''
    try {
      // Para atualização geral, usar JSON
      const dadosProduto = {
        name: nomeForm.value,
        description: descricaoForm.value,
        price: precoForm.value,
        category_id: categoriaIdForm.value
      }
      
      await api.put(`/products/${idProduto.value}`, dadosProduto)
      
      // Se há uma nova imagem, atualizar separadamente
      if (imagemForm.value) {
        const formData = new FormData()
        formData.append('image', imagemForm.value)
        
        await api.put(`/products/${idProduto.value}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      
      // Se o estoque mudou, atualizar separadamente
      const produtoAtual = produtos.value.find(p => p.id === idProduto.value)
      if (produtoAtual && produtoAtual.stock !== estoqueForm.value) {
        await api.put(`/products/${idProduto.value}/stock`, {
          stock: estoqueForm.value
        })
      }
      
      toast.success('Produto atualizado com sucesso!')
      await carregarProdutos()
      fecharFormulario()
    } catch (error) {
      toast.error('Erro ao atualizar produto.')
      console.error('Erro ao atualizar produto:', error)
    }
  }
  
  async function excluirProduto(produtoId) {
    try {
      await api.delete(`/products/${produtoId}`)
      toast.success('Produto excluído com sucesso!')
      await carregarProdutos()
      fecharModalConfirmacao()
    } catch (error) {
      toast.error('Erro ao excluir produto.')
      console.error('Erro ao excluir produto:', error)
    }
  }
  
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
  
  // Funções de controle de formulários
  function abrirCriacao() {
    editando.value = false
    mostraFormulario.value = true
    limparFormularioProduto()
  }
  
  function fecharFormulario() {
    mostraFormulario.value = false
    editando.value = false
    idProduto.value = null
    limparFormularioProduto()
  }
  
  function limparFormularioProduto() {
    nomeForm.value = ''
    descricaoForm.value = ''
    precoForm.value = 0
    estoqueForm.value = 0
    categoriaIdForm.value = ''
    imagemForm.value = null
    mensagem.value = ''
    mensagemEdicao.value = ''
  }
  
  function editarProduto(produto) {
    editando.value = true
    idProduto.value = produto.id
    mostraFormulario.value = true
    
    // Garantir que os tipos estejam corretos
    nomeForm.value = produto.name || ''
    descricaoForm.value = produto.description || ''
    precoForm.value = Number(produto.price) || 0
    estoqueForm.value = Number(produto.stock) || 0
    categoriaIdForm.value = String(produto.category_id) || ''
    imagemForm.value = null
    mensagemEdicao.value = ''
  }
  
  function cancelarEdicao() {
    editando.value = false
    idProduto.value = null
    mensagemEdicao.value = ''
    mostraFormulario.value = false
    limparFormularioProduto()
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
  function abrirModalExclusao(produtoId) {
    produtoParaExcluir.value = produtoId
    mostrarModalConfirmacao.value = true
  }
  
  function fecharModalConfirmacao() {
    mostrarModalConfirmacao.value = false
    produtoParaExcluir.value = null
  }
  
  function confirmarExclusao() {
    if (produtoParaExcluir.value) {
      excluirProduto(produtoParaExcluir.value)
    }
  }
  
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
    limparFiltros()
    
    // Sair do modo de seleção se estiver ativo
    if (selecionandoProduto.value) {
      cancelarSelecao()
    }
    
    if (modoDesconto.value) {
      carregarDescontos()
    }
  }
  
  function limparFiltros() {
    termoBusca.value = ''
    categoriaSelecionada.value = ''
    estoqueSelecionado.value = ''
    filtroDescontoSelecionado.value = ''
  }
  
  // Função de inicialização
  async function inicializar() {
    await Promise.all([
      carregarProdutos(),
      carregarCategorias()
    ])
  }
  
  return {
    // Estado
    produtos,
    carregandoProdutos,
    erroProdutos,
    categorias,
    descontos,
    termoBusca,
    categoriaSelecionada,
    estoqueSelecionado,
    filtroDescontoSelecionado,
    modoDesconto,
    mostraFormulario,
    editando,
    idProduto,
    mensagem,
    mensagemEdicao,
    mostraFormularioDesconto,
    editandoDesconto,
    idDesconto,
    mensagemDesconto,
    mensagemEdicaoDesconto,
    selecionandoProduto,
    produtoSelecionado,
    nomeForm,
    descricaoForm,
    precoForm,
    estoqueForm,
    categoriaIdForm,
    imagemForm,
    descricaoDescontoForm,
    percentualDescontoForm,
    dataInicioForm,
    dataFimForm,
    mostrarModalConfirmacao,
    produtoParaExcluir,
    mostrarModalConfirmacaoDesconto,
    descontoParaExcluir,
    
    // Computed
    produtosFiltrados,
    
    // Funções de produtos
    carregarProdutos,
    carregarCategorias,
    criarProduto,
    atualizarProduto,
    excluirProduto,
    
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
    abrirCriacao,
    fecharFormulario,
    limparFormularioProduto,
    editarProduto,
    cancelarEdicao,
    abrirCriacaoDesconto,
    fecharFormularioDesconto,
    limparFormularioDesconto,
    selecionarProdutoParaDesconto,
    editarDescontoProduto,
    cancelarEdicaoDesconto,
    cancelarSelecao,
    
    // Funções de controle de modais
    abrirModalExclusao,
    fecharModalConfirmacao,
    confirmarExclusao,
    abrirModalExclusaoDesconto,
    fecharModalConfirmacaoDesconto,
    confirmarExclusaoDesconto,
    
    // Funções de controle de modo
    alternarModo,
    limparFiltros,
    
    // Função de inicialização
    inicializar
  }
}) 