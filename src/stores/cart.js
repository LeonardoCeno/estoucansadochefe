import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { defineStore } from 'pinia'
import api from '../services/api'
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
    
    // Função utilitária para processar image_path
    function processarImagePath(imagePath) {
        if (!imagePath) return null
        return imagePath.startsWith('http') ? imagePath : `http://35.196.79.227:8000${imagePath}`
    }
    
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
                image_path: processarImagePath(item.image_path)
            }))
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error)
            itensCarrinho.value = []
        } finally {
            carregando.value = false
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
    
    // Função específica para remover item do carrinho (instantânea)
    async function removerItemDoCarrinho(item) {
        // Atualizar UI instantaneamente
        itensCarrinho.value = itensCarrinho.value.filter(cartItem => cartItem.product_id !== item.product_id)
        toast.success('Item removido do carrinho!')
        
        // Fazer operação em background
        try {
            await removerItemCarrinho(item.product_id)
        } catch (error) {
            // Se falhar, sincronizar com o estado real
            await carregarCarrinho()
        }
    }
    
    // Função otimizada para aumentar quantidade (instantânea)
    async function aumentarQuantidade(item) {
        const novaQuantidade = item.quantity + 1
        
        // Atualizar UI instantaneamente
        const itemIndex = itensCarrinho.value.findIndex(cartItem => cartItem.product_id === item.product_id)
        if (itemIndex !== -1) {
            itensCarrinho.value[itemIndex].quantity = novaQuantidade
        }
        
        // Fazer operação em background
        try {
            await atualizarQuantidadeCarrinho(item.product_id, novaQuantidade)
        } catch (error) {
            // Se falhar, sincronizar com o estado real
            await carregarCarrinho()
        }
    }
    
    // Função otimizada para diminuir quantidade (instantânea)
    async function diminuirQuantidade(item) {
        if (item.quantity <= 1) return
        
        const novaQuantidade = item.quantity - 1
        
        // Atualizar UI instantaneamente
        const itemIndex = itensCarrinho.value.findIndex(cartItem => cartItem.product_id === item.product_id)
        if (itemIndex !== -1) {
            itensCarrinho.value[itemIndex].quantity = novaQuantidade
        }
        
        // Fazer operação em background
        try {
            await atualizarQuantidadeCarrinho(item.product_id, novaQuantidade)
        } catch (error) {
            // Se falhar, sincronizar com o estado real
            await carregarCarrinho()
        }
    }
    
    async function limparCarrinho() {
        try {
            await limparCarrinhoAPI()
            itensCarrinho.value = []
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error)
            throw error
        }
    }
    
    function limparCarrinhoLocal() {
        itensCarrinho.value = []
    }
    
    function produtoEstaNoCarrinho(produtoId) {
        return itensCarrinho.value.some(item => item.product_id === produtoId)
    }
    
    // Função centralizada para adicionar/remover do carrinho (instantânea)
    async function toggleCarrinho(produto) {
        const estavaNoCarrinho = produtoEstaNoCarrinho(produto.id)
        
        // Atualizar UI instantaneamente
        if (estavaNoCarrinho) {
            // Remover da lista local
            itensCarrinho.value = itensCarrinho.value.filter(item => item.product_id !== produto.id)
            toast.success('Item removido do carrinho!')
        } else {
            // Validações
            if (produto.stock < 1) {
                toast.error('Produto indisponível no momento.')
                return
            }
            
            // Adicionar à lista local
            const precoUnitario = typeof produto.price === 'string' ? parseFloat(produto.price) : produto.price
            itensCarrinho.value.push({
                product_id: produto.id,
                quantity: 1,
                unit_price: precoUnitario,
                image_path: processarImagePath(produto.image_path)
            })
            toast.success('Item adicionado ao carrinho!')
        }
        
        // Fazer operação em background (sem bloquear UI)
        try {
            if (estavaNoCarrinho) {
                await removerItemCarrinho(produto.id)
            } else {
                // Garantir que o carrinho existe
                try {
                    await api.post('/cart/')
                } catch (cartError) {}
                const precoUnitario = typeof produto.price === 'string' ? parseFloat(produto.price) : produto.price
                await adicionarItemCarrinho(produto.id, 1, precoUnitario)
            }
        } catch (error) {
            // Se falhar, sincronizar com o estado real
            await carregarCarrinho()
        }
    }
    
    // Função para adicionar item com quantidade específica
    async function adicionarItem(produtoId, quantidade, precoUnitario, imagePath = null) {
        // Validações
        if (quantidade < 1) {
            toast.error('Quantidade inválida.')
            return
        }
        
        // Verificar se produto já está no carrinho
        if (produtoEstaNoCarrinho(produtoId)) {
            toast.error('Produto já está no carrinho.')
            return
        }
        
        // Adicionar à lista local
        itensCarrinho.value.push({
            product_id: produtoId,
            quantity: quantidade,
            unit_price: precoUnitario,
            image_path: processarImagePath(imagePath)
        })
        toast.success('Item adicionado ao carrinho!')
        
        // Fazer operação em background
        try {
            // Garantir que o carrinho existe
            try {
                await api.post('/cart/')
            } catch (cartError) {}
            
            await adicionarItemCarrinho(produtoId, quantidade, precoUnitario)
        } catch (error) {
            // Se falhar, sincronizar com o estado real
            await carregarCarrinho()
        }
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
        atualizarQuantidade,
        aumentarQuantidade,
        diminuirQuantidade,
        limparCarrinho,
        limparCarrinhoLocal,
        produtoEstaNoCarrinho,
        toggleCarrinho,
        removerItemDoCarrinho,
        adicionarItem
    }
}) 