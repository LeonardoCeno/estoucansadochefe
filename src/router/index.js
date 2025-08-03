import { createRouter, createWebHistory } from 'vue-router'
import { verifyToken, renewToken } from '../services/api'
import api from '../services/api'
import HomeView from '../views/Market.vue'
import LoginView from '../views/Login.vue'
import PainelView from '../views/Painel.vue'
import DadosView from '../views/Dados.vue'
import CuponsView from '../views/Cupons.vue'
import PedidosView from '../views/Pedidos.vue'
import FavoritosView from '../views/Favoritos.vue'
import EnderecosView from '../views/Enderecos.vue'
import CarrinhoView from '../views/Carrinho.vue'
import ADMcategoriasView from '../views/ADMcategorias.vue'
import ADMprodutosView from '../views/ADMprodutos.vue'
import ADMpedidosView from '../views/ADMpedidos.vue'
import ADMcuponsView from '../views/ADMcupons.vue'
import PesquisasView from '../views/pesquisas.vue'
import ADMmoderadoresView from '../views/ADMmoderadoes.vue'
import CheckoutView from '../views/Checkout.vue'
import ProdutoDetalhesView from '../views/ProdutoDetalhes.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/pesquisas',
      name: 'Pesquisas',
      component: PesquisasView,
    },
    {
      path: '/produto/:id',
      name: 'ProdutoDetalhes',
      component: ProdutoDetalhesView,
    },
    {
      path: '/painel',
      name: 'Painel',
      component: PainelView,
      children: [
        {
          path: '/dados',
          name: 'Dados',
          component: DadosView,
        },
        {
          path: '/cupons',
          name: 'Cupons',
          component: CuponsView,
        },
        {
          path: '/pedidos',
          name: 'Pedidos',
          component: PedidosView,
        },
        {
          path: '/favoritos',
          name: 'Favoritos',
          component: FavoritosView,
        },
        {
          path: '/enderecos',
          name: 'Enderecos',
          component: EnderecosView,
        },
        {
          path: '/carrinho',
          name: 'Carrinho',
          component: CarrinhoView,
        },
        {
          path: '/ADMcategorias',
          name: 'ADMcategorias',
          component: ADMcategoriasView,
        },
        {
          path: '/ADMprodutos',
          name: 'ADMprodutos',
          component: ADMprodutosView,
        },
        {
          path: '/ADMpedidos',
          name: 'ADMpedidos',
          component: ADMpedidosView,
        },
        {
          path: '/ADMcupons',
          name: 'ADMcupons',
          component: ADMcuponsView,
        },
        {
          path: '/ADMmoderadores',
          name: 'ADMmoderadores',
          component: ADMmoderadoresView,
        },
        {
          path: '/checkout',
          name: 'Checkout',
          component: CheckoutView,
        },

      ]
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const painelRoutes = [
    'Painel', 'Dados', 'Cupons', 'Pedidos', 'Favoritos', 'Enderecos', 'Carrinho',
    'ADMcategorias', 'ADMprodutos', 'ADMpedidos', 'ADMcupons', 'ADMmoderadores'
  ]
  
  if (painelRoutes.includes(to.name)) {
    const token = localStorage.getItem('token')
    
    if (!token) {
      next({ name: 'Login' })
      return
    }
    
    // Verificar se o token está configurado no Axios
    if (!api.defaults.headers.common['Authorization']) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    try {
      // Verificar se token é válido
      await verifyToken()
      next()
    } catch (error) {
      try {
        // Tentar renovar token
        await renewToken()
        next()
      } catch (renewError) {
        // Token inválido e não conseguiu renovar
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        next({ name: 'Login' })
      }
    }
  } else {
    next()
  }
})

export default router
