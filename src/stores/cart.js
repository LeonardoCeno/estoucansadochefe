import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { defineStore } from 'pinia'
import { 
    getItensCarrinho, 
    adicionarItemCarrinho, 
    atualizarQuantidadeCarrinho, 
    removerItemCarrinho, 
    limparCarrinho as limparCarrinhoAPI 
} from '../services/api'

export const useCartStore = defineStore('cart', () => {
    const toast = useToast()
    
    // Estado
    const itensCarrinho = ref([])
    const carregando = ref(false)
    
    // Computed
    const totalItens = computed(() => {
        return itensCarrinho.value.reduce((total, item) => total + item.quantity, 0)
    })
    
    const totalPreco = computed(() => {
        return itensCarrinho.value.reduce((total, item) => {
            return total + (item.unit_price * item.quantity)
        }, 0)
    })
    
    const totalPrecoFormatado = computed(() => {
        return totalPreco.value.toFixed(2)
    })
    
    // Funções
    async function carregarCarrinho() {
        // Evitar carregar se já está carregando
        if (carregando.value) return
        
        try {
            carregando.value = true
            const dadosCarrinho = await getItensCarrinho()
            
            // Processar imagens dos itens do carrinho
            itensCarrinho.value = (dadosCarrinho.items || []).map(item => ({
                ...item,
                image_path: item.image_path && !item.image_path.startsWith('http')
                    ? `http://35.196.79.227:8000${item.image_path}`
                    : item.image_path
            }))
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error)
            itensCarrinho.value = []
        } finally {
            carregando.value = false
        }
    }
    
    async function adicionarItem(produtoId, quantidade, precoUnitario) {
        try {
            await adicionarItemCarrinho(produtoId, quantidade, precoUnitario)
            await carregarCarrinho()
            toast.success('Item adicionado ao carrinho!')
        } catch (error) {
            console.error('Erro ao adicionar item:', error)
            toast.error('Erro ao adicionar item ao carrinho')
        }
    }
    
    async function atualizarQuantidade(produtoId, novaQuantidade) {
        try {
            await atualizarQuantidadeCarrinho(produtoId, novaQuantidade)
            await carregarCarrinho()
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error)
            toast.error('Erro ao atualizar quantidade')
        }
    }
    
    async function aumentarQuantidade(item) {
        const novaQuantidade = item.quantity + 1
        await atualizarQuantidade(item.product_id, novaQuantidade)
    }
    
    async function diminuirQuantidade(item) {
        if (item.quantity <= 1) return
        const novaQuantidade = item.quantity - 1
        await atualizarQuantidade(item.product_id, novaQuantidade)
    }
    
    async function removerItem(produtoId) {
        try {
            await removerItemCarrinho(produtoId)
            await carregarCarrinho()
            toast.success('Item removido do carrinho!')
        } catch (error) {
            console.error('Erro ao remover item:', error)
            toast.error('Erro ao remover item do carrinho')
        }
    }
    
    async function limparCarrinho() {
        try {
            await limparCarrinhoAPI()
            itensCarrinho.value = []
            toast.success('Carrinho limpo com sucesso!')
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error)
            toast.error('Erro ao limpar carrinho')
        }
    }
    
    function limparCarrinhoLocal() {
        itensCarrinho.value = []
    }
    
    function produtoEstaNoCarrinho(produtoId) {
        return itensCarrinho.value.some(item => item.product_id === produtoId)
    }
    
    return {
        // Estado
        itensCarrinho,
        carregando,
        
        // Computed
        totalItens,
        totalPreco,
        totalPrecoFormatado,
        
        // Funções
        carregarCarrinho,
        adicionarItem,
        atualizarQuantidade,
        aumentarQuantidade,
        diminuirQuantidade,
        removerItem,
        limparCarrinho,
        limparCarrinhoLocal,
        produtoEstaNoCarrinho
    }
}) 