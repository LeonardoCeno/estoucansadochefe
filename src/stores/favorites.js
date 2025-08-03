import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'

export const useFavoritesStore = defineStore('favorites', () => {
  const toast = useToast()
  const favoritos = ref([])

  // Carregar favoritos do localStorage
  function carregarFavoritos() {
    const favoritosStorage = localStorage.getItem('favoritos')
    if (favoritosStorage) {
      favoritos.value = JSON.parse(favoritosStorage)
    } else {
      favoritos.value = []
    }
  }

  // Adicionar favorito
  function adicionar(produtoId) {
    if (!favoritos.value.includes(produtoId)) {
      favoritos.value.push(produtoId)
      localStorage.setItem('favoritos', JSON.stringify(favoritos.value))
      toast.success('Produto adicionado aos favoritos!')
    }
  }

  // Remover favorito
  function remover(produtoId) {
    favoritos.value = favoritos.value.filter(id => id !== produtoId)
    localStorage.setItem('favoritos', JSON.stringify(favoritos.value))
    toast.success('Produto removido dos favoritos!')
  }

  // Toggle favorito (adicionar/remover)
  function toggleFavorito(produtoId) {
    if (estaNosFavoritos(produtoId)) {
      remover(produtoId)
    } else {
      adicionar(produtoId)
    }
  }

  // Verificar se está nos favoritos
  function estaNosFavoritos(produtoId) {
    return favoritos.value.includes(produtoId)
  }

  // Inicializar
  carregarFavoritos()

  return {
    favoritos,
    carregarFavoritos,
    adicionar,
    remover,
    toggleFavorito,
    estaNosFavoritos
  }
})
