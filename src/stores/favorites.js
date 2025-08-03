import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { getFavoritos, adicionarFavorito, removerFavorito } from '../services/api'

export const useFavoritesStore = defineStore('favorites', () => {
    const toast = useToast()
    
    // Estado
    const favoritos = ref([])
    const carregando = ref(false)
    const erro = ref('')
    
    // Funções
    async function carregarFavoritos() {
        try {
            carregando.value = true
            erro.value = ''
            const data = await getFavoritos()
            
            // Ajustar imagem se necessário
            favoritos.value = (data || []).map(produto => ({
                ...produto,
                image_path: produto.image_path && !produto.image_path.startsWith('http')
                    ? 'http://35.196.79.227:8000' + produto.image_path
                    : produto.image_path
            }))
        } catch (error) {
            erro.value = 'Erro ao carregar favoritos: ' + (error.message || error)
            favoritos.value = []
            toast.error(erro.value)
        } finally {
            carregando.value = false
        }
    }
    
    async function adicionar(produtoId) {
        try {
            await adicionarFavorito(produtoId)
            await carregarFavoritos()
            toast.success('Produto adicionado aos favoritos!')
        } catch (error) {
            toast.error('Erro ao adicionar aos favoritos.')
        }
    }
    
    async function remover(produtoId) {
        try {
            await removerFavorito(produtoId)
            await carregarFavoritos()
            toast.success('Produto removido dos favoritos!')
        } catch (error) {
            toast.error('Erro ao remover dos favoritos.')
        }
    }
    
    function produtoEstaNosFavoritos(produtoId) {
        return favoritos.value.some(p => p.id === produtoId)
    }
    
    function limparFavoritosLocal() {
        favoritos.value = []
    }
    
    return {
        favoritos,
        carregando,
        erro,
        carregarFavoritos,
        adicionar,
        remover,
        produtoEstaNosFavoritos,
        limparFavoritosLocal
    }
})