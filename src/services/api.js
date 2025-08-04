import axios from 'axios'

const api = axios.create({
  baseURL: 'http://35.196.79.227:8000',
})

export async function getProdutos() {
  const response = await api.get('/products/user/228')
  
  const produtos = response.data.map(produto => ({
    ...produto,
    image_path: produto.image_path 
      ? `http://35.196.79.227:8000${produto.image_path}` 
      : '/placeholder-image.jpg'
  }))
  
  return produtos
}

export async function login(email, password) {
  const response = await api.post('/login', { email, password })
  const { token, user } = response.data
  
  // Salvar token automaticamente
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
  
  return { token, user }
}

export async function register(name, email, password) {
  const response = await api.post('/register', { name, email, password })
  return response.data
}

// informações do usuario
export async function getUsuario() {
  const response = await api.get('/users/me')
  return response.data
}

// ENDEREÇOS
export async function getEnderecos() {
  const response = await api.get('/addresses/')
  return response.data
}

export async function criarEndereco(endereco) {
  const response = await api.post('/addresses/', endereco)
  return response.data
}

export async function atualizarEndereco(id, endereco) {
  const response = await api.put(`/addresses/${id}`, endereco)
  return response.data
}

export async function deletarEndereco(id) {
  const response = await api.delete(`/addresses/${id}`)
  return response.data
}

export async function getEndereco(id) {
  const response = await api.get(`/addresses/${id}`)
  return response.data
}

export async function buscarProdutosAdmin228() {
  const response = await api.get('/products/user/228')
  return response.data
}

export async function getCategorias() {
  const response = await api.get('/categories/')
  return response.data
}

export async function getCategoriasPorUsuario228() {
  const response = await api.get('/categories/user/228')
  return response.data
}

// pega o carrinho do usuario
export async function getCarrinho() {
  const response = await api.get('/cart/')
  return response.data
}

// pega os itens do carrinho do usuario
export async function getItensCarrinho() {
  const response = await api.get('/cart/items')
  return response.data
}

// adiciona um item ao carrinho do usuario
export async function adicionarItemCarrinho(produtoId, quantidade, precoUnitario) {
  // adiciona um item ao carrinho do usuario
  const response = await api.post('/cart/items', {
    product_id: produtoId,
    quantity: quantidade,
    unit_price: precoUnitario
  })
  
  // atualiza o carrinho do usuario
  return response.data
}

export async function atualizarQuantidadeCarrinho(produtoId, quantidade) {
  const response = await api.put('/cart/items', {
    product_id: produtoId,
    quantity: quantidade
  })
  return response.data
}

export async function removerItemCarrinho(produtoId) {
  const response = await api.delete('/cart/items', {
    data: { product_id: produtoId }
  })
  return response.data
}

export async function limparCarrinho() {
  const response = await api.delete('/cart/clear')
  return response.data
}

export async function criarModerador(dados) {
  const response = await api.post('/users/create-moderator', dados)
  return response.data
}

export async function getCupons() {
  const response = await api.get('/coupons/')
  return response.data
}

export async function getCupom(id) {
  const response = await api.get(`/coupons/${id}`)
  return response.data
}

export async function criarCupom(dados) {
  const response = await api.post('/coupons/', dados)
  return response.data
}

export async function atualizarCupom(dados, id) {
  const response = await api.put(`/coupons/${id}`, dados)
  return response.data
}

export async function deletarCupom(id) {
  const response = await api.delete(`/coupons/${id}`)
  return response.data
}

export async function aplicarCupom(codigo) {
  // aq q aplica o cupom
  const cupons = await getCupons()
  const cupom = cupons.find(c => c.code === codigo)
  
  if (!cupom) {
    throw new Error('Cupom não encontrado')
  }
  
  const hoje = new Date()
  const inicio = new Date(cupom.start_date)
  const fim = new Date(cupom.end_date)
  
  if (hoje < inicio || hoje > fim) {
    throw new Error('Cupom inválido ou expirado')
  }
  
  return cupom
}

export async function criarPedido(dados) {
  const response = await api.post('/orders/', dados)
  return response.data
}

// PEDIDOS
export async function getPedidos() {
  const response = await api.get('/orders/')
  return response.data
}

export async function getPedido(id) {
  const response = await api.get(`/orders/${id}`)
  return response.data
}

export async function cancelarPedido(id) {
  const response = await api.delete(`/orders/${id}`)
  return response.data
}

// Funções para gerenciamento administrativo de pedidos
export async function getAllPedidos() {
  const response = await api.get('/orders/all')
  return response.data
}

export async function atualizarStatusPedido(id, status) {
  const response = await api.put(`/orders/${id}`, { status })
  return response.data
}

export async function getPedidosPorAdmin(adminId) {
  const response = await api.get(`/orders/all/${adminId}`)
  return response.data
}

// Funções para detalhes do produto
export async function getProduto(id) {
  const response = await api.get(`/products/${id}`)
  const produto = response.data
  
  // Ajustar a URL da imagem
  if (produto.image_path) {
    produto.image_path = produto.image_path.startsWith('http') 
      ? produto.image_path 
      : `http://35.196.79.227:8000${produto.image_path}`
  }
  
  return produto
}

// Funções para favoritos
export async function getFavoritos() {
  const response = await api.get('/favorites/')
  return response.data
}

export async function adicionarFavorito(produtoId) {
  const response = await api.post('/favorites/', { product_id: produtoId })
  return response.data
}

export async function removerFavorito(produtoId) {
  const response = await api.delete(`/favorites/${produtoId}`)
  return response.data
}

// Função para excluir conta do usuário
export async function excluirConta() {
  const response = await api.delete('/users/me')
  return response.data
}

// Funções de autenticação simplificadas
export async function verifyToken() {
  try {
    const response = await api.get('/verify-token')
    return { valid: true, expiresAt: response.data }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

export async function renewToken() {
  try {
    const response = await api.post('/renew-token')
    const newToken = response.data
    
    // Atualizar token automaticamente
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    
    return newToken
  } catch (error) {
    throw new Error('Erro ao renovar token')
  }
}

// Configuração inicial do token
const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}



export default api