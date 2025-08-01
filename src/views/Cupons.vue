<template>
    <div class="tudo">
        <div class="cupons">
            <h3 class="titulo-principal">Cupons Disponíveis</h3>
            
            <!-- Lista de Cupons Ativos -->
            <div v-if="carregandoCupons" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando cupons...</p>
            </div>
            <div v-else-if="erroCupons" class="error-container">
                <p>{{ erroCupons }}</p>
            </div>
            <div v-else>
                <div v-if="cuponsAtivos.length === 0">
                    <div class="sem-cupons">Nenhum cupom ativo disponível no momento.</div>
                </div>
                <ul v-else class="lista">
                    <li v-for="cupom in cuponsAtivos" :key="cupom.id" class="cupom cupom-ativo">
                        <div class="cupom-info">
                            <div class="codigo-desconto">
                                <h4>{{ cupom.code }}</h4>
                                <p class="percentual">{{ cupom.discount_percentage }}% OFF</p>
                            </div>
                            <div class="datas">
                                <p><strong>Válido até:</strong> {{ formatarData(cupom.end_date) }}</p>
                            </div>
                            <div class="status">
                                <span class="status-ativo">ATIVO</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCupons } from '../services/api'

const cupons = ref([])
const carregandoCupons = ref(true)
const erroCupons = ref('')

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const cuponsAtivos = computed(() => {
    const hoje = new Date()
    return cupons.value.filter(cupom => {
        const inicio = new Date(cupom.start_date)
        const fim = new Date(cupom.end_date)
        return hoje >= inicio && hoje <= fim
    })
})

async function carregarCupons() {
    carregandoCupons.value = true
    erroCupons.value = ''
    try {
        cupons.value = await getCupons()
    } catch (e) {
        erroCupons.value = 'Erro ao carregar cupons.'
    } finally {
        carregandoCupons.value = false
    }
}

onMounted(async () => {
    await carregarCupons()
})
</script>

<style scoped>
.tudo {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    padding: 30px 0px 0px 70px;
}

.cupons {
    width: 95%;
    height: 30%;
}

.titulo-principal {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    padding: 20px 0;
    border-bottom: 2px solid #e0e0e0;
}

.lista {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    justify-items: center;
    padding: 4px;
    gap: 20px;
    position: relative;
}

ul {
    margin-top: 1rem;
    padding-left: 0;
    list-style: none;
    max-height: 70vh;
    overflow-y: auto;
    scrollbar-color: rgb(100, 100, 100) rgba(241, 241, 241, 0.527);
}

.cupom {
    background-color: #f0f0f0;
    padding: 20px;
    margin-bottom: 10px;
    border-radius: 7px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    font-size: 1.1rem;
    border: 1px solid #a9b5b6;
    width: 100%;
    max-width: 400px;
    min-height: 140px;
    transition: all 0.3s ease;
}

.cupom-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

.codigo-desconto {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.codigo-desconto h4 {
    font-size: 1.3rem;
    font-weight: bold;
    color: #333;
    margin: 0;
    word-break: break-word;
    line-height: 1.2;
}

.percentual {
    font-size: 1.1rem;
    font-weight: bold;
    color: #4CAF50;
    margin: 0;
}

.datas {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 5px;
}

.datas p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.3;
}

.status {
    margin-top: auto;
    padding-top: 10px;
}

.status span {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
    display: inline-block;
}

.cupom-ativo {
    border: 2px solid #4CAF50 !important;
    background-color: #f8fff8 !important;
}

.status-ativo {
    background-color: #e8f5e8;
    color: #2e7d32;
    border: 1px solid #4CAF50;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    text-align: center;
    color: #dc3545;
    font-size: 1.1rem;
}

.sem-cupons {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    .tudo {
        padding: 20px 15px 0px 15px;
    }
    
    .cupons {
        width: 100%;
        height: auto;
    }
    
    .lista {
        grid-template-columns: 1fr;
    }
    
    .cupom {
        max-width: 100%;
        padding: 15px;
        min-height: 120px;
    }
    
    .codigo-desconto h4 {
        font-size: 1.1rem;
    }
    
    .percentual {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 15px 10px 0px 10px;
    }
    
    .cupom {
        padding: 12px;
        min-height: 110px;
    }
    
    .codigo-desconto h4 {
        font-size: 1rem;
    }
    
    .percentual {
        font-size: 0.9rem;
    }
    
    .datas p {
        font-size: 0.8rem;
    }
    
    .status span {
        font-size: 0.7rem;
        padding: 3px 6px;
    }
}
</style>