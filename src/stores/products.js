import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { defineStore } from 'pinia'
import api, { 
  getProdutos, 
  getCategorias
} from '../services/api'

export const useProductsStore = defineStore('products', () => {
  const toast = useToast()
  
  // Estado dos produtos
  const produtos = ref([])
  const carregandoProdutos = ref(false)
  const erroProdutos = ref('')
  
  // Estado das categorias
  const categorias = ref([])
  
  // Estado dos filtros
  const termoBusca = ref('')
  const categoriaSelecionada = ref('')
  const estoqueSelecionado = ref('')
  
  // Estado do formulário de produto
  const mostraFormulario = ref(false)
  const editando = ref(false)
  const idProduto = ref(null)
  const mensagem = ref('')
  const mensagemEdicao = ref('')
  
  // Dados do formulário de produto
  const nomeForm = ref('')
  const descricaoForm = ref('')
  const precoForm = ref(0)
  const estoqueForm = ref(0)
  const categoriaIdForm = ref('')
  const imagemForm = ref(null)
  
  // Estado dos modais
  const mostrarModalConfirmacao = ref(false)
  const produtoParaExcluir = ref(null)
  
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
  
  function limparFiltros() {
    termoBusca.value = ''
    categoriaSelecionada.value = ''
    estoqueSelecionado.value = ''
  }
  
  // Função para aplicar filtros de desconto externamente
  function aplicarFiltroDesconto(produtos, filtroDesconto, funcoesDesconto) {
    if (!filtroDesconto) return produtos
    
    return produtos.filter(produto => {
      switch (filtroDesconto) {
        case 'ativos':
          return funcoesDesconto.descontoAtivo(produto.id)
        case 'futuros':
          return funcoesDesconto.descontoFuturo(produto.id)
        case 'expirados':
          return funcoesDesconto.descontoExpirado(produto.id)
        case 'sem-desconto':
          return !funcoesDesconto.produtoTemDesconto(produto.id)
        default:
          return true
      }
    })
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
    termoBusca,
    categoriaSelecionada,
    estoqueSelecionado,
    mostraFormulario,
    editando,
    idProduto,
    mensagem,
    mensagemEdicao,
    nomeForm,
    descricaoForm,
    precoForm,
    estoqueForm,
    categoriaIdForm,
    imagemForm,
    mostrarModalConfirmacao,
    produtoParaExcluir,
    
    // Computed
    produtosFiltrados,
    
    // Funções de produtos
    carregarProdutos,
    carregarCategorias,
    criarProduto,
    atualizarProduto,
    excluirProduto,
    
    // Funções de controle de formulários
    abrirCriacao,
    fecharFormulario,
    limparFormularioProduto,
    editarProduto,
    cancelarEdicao,
    
    // Funções de controle de modais
    abrirModalExclusao,
    fecharModalConfirmacao,
    confirmarExclusao,
    
    // Funções de controle
    limparFiltros,
    aplicarFiltroDesconto,
    inicializar
  }
}) 