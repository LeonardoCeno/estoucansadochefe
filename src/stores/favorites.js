import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getFavoritos, adicionarFavorito, removerFavorito } from '../services/api'
import api from '../services/api'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoritos = ref([])
  const carregando = ref(false)
  const erro = ref('')

  async function carregarFavoritos() {
    carregando.value = true
    erro.value = ''
    try {
      // Tentar carregar da API primeiro
      const data = await getFavoritos()
      favoritos.value = data
    } catch (e) {
      // Se falhar, usar localStorage como fallback
      try {
        const favoritosStorage = localStorage.getItem('favoritos')
        if (favoritosStorage) {
          const favoritosIds = JSON.parse(favoritosStorage)
          
          // Buscar produtos da API
          const response = await api.get('/products/user/228')
          const todosProdutos = response.data.map(produto => ({
            ...produto,
            image_path: produto.image_path && !produto.image_path.startsWith('http')
              ? 'http://35.196.79.227:8000' + produto.image_path
              : produto.image_path
          }))
          
          // Filtrar apenas os produtos que estão nos favoritos
          favoritos.value = todosProdutos.filter(produto => 
            favoritosIds.includes(produto.id)
          )
        } else {
          favoritos.value = []
        }
      } catch (localError) {
        erro.value = 'Erro ao carregar favoritos'
        favoritos.value = []
      }
    } finally {
      carregando.value = false
    }
  }

  async function adicionar(produtoId) {
    try {
      await adicionarFavorito(produtoId)
      await carregarFavoritos()
    } catch (e) {
      // Fallback para localStorage
      const favoritosStorage = localStorage.getItem('favoritos')
      let favoritosIds = []
      
      if (favoritosStorage) {
        favoritosIds = JSON.parse(favoritosStorage)
      }
      
      if (!favoritosIds.includes(produtoId)) {
        favoritosIds.push(produtoId)
        localStorage.setItem('favoritos', JSON.stringify(favoritosIds))
        await carregarFavoritos()
      }
    }
  }

  async function remover(produtoId) {
    try {
      await removerFavorito(produtoId)
      await carregarFavoritos()
    } catch (e) {
      // Fallback para localStorage
      const favoritosStorage = localStorage.getItem('favoritos')
      let favoritosIds = []
      
      if (favoritosStorage) {
        favoritosIds = JSON.parse(favoritosStorage)
      }
      
      favoritosIds = favoritosIds.filter(id => id !== produtoId)
      localStorage.setItem('favoritos', JSON.stringify(favoritosIds))
      await carregarFavoritos()
    }
  }

  function estaNosFavoritos(produtoId) {
    return favoritos.value.some(fav => fav.id === produtoId)
  }

  return {
    favoritos,
    carregando,
    erro,
    carregarFavoritos,
    adicionar,
    remover,
    estaNosFavoritos
  }
})
