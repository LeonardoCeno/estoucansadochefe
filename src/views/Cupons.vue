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
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 30px;
    box-sizing: border-box;
}

.cupons {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(0, 0, 0, 0.05);
}

.titulo-principal {
    margin: 0 0 30px 0;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.2rem;
    font-weight: 700;
    text-align: center;
    padding: 20px 0;
    border-bottom: 3px solid #02060af5;
    position: relative;
}

.titulo-principal::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #079ac7 0%, #02060af5 100%);
    border-radius: 2px;
}

.lista {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
    padding: 20px 0;
    width: 100%;
}

ul {
    margin-top: 1rem;
    padding-left: 0;
    list-style: none;
    width: 100%;
}

.cupom {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 25px;
    margin-bottom: 0;
    border-radius: 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    font-size: 1.1rem;
    border: 2px solid #e9ecef;
    width: 100%;
    min-height: 160px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}



.cupom-info {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex: 1;
    min-width: 0;
}

.codigo-desconto {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.codigo-desconto h4 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    word-break: break-word;
    line-height: 1.2;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.percentual {
    font-size: 1.3rem;
    font-weight: 700;
    color: #22c55e;
    margin: 0;
    text-shadow: 0 1px 3px rgba(34, 197, 94, 0.3);
}

.datas {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 5px;
}

.datas p {
    margin: 0;
    font-size: 1rem;
    color: #64748b;
    line-height: 1.4;
    font-weight: 500;
}

.status {
    margin-top: auto;
    padding-top: 15px;
}

.status span {
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    display: inline-block;
    letter-spacing: 0.5px;
}

.cupom-ativo {
    border: 2px solid #22c55e !important;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

.status-ativo {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
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
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #02060af5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(2, 6, 10, 0.2);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px;
    text-align: center;
    color: #dc3545;
    font-size: 1.2rem;
    font-weight: 500;
}

.sem-cupons {
    text-align: center;
    padding: 60px;
    color: #64748b;
    font-size: 1.2rem;
    font-weight: 500;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    border: 2px solid #e2e8f0;
}

/* Responsividade Aprimorada */
@media (max-width: 1024px) {
    .tudo {
        padding: 25px;
    }
    
    .cupons {
        padding: 25px;
    }
    
    .lista {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }
}

@media (max-width: 768px) {
    .tudo {
        padding: 20px;
    }
    
    .cupons {
        padding: 20px;
        border-radius: 12px;
    }
    
    .titulo-principal {
        font-size: 1.8rem;
        margin-bottom: 25px;
    }
    
    .lista {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        padding: 15px 0;
    }
    
    .cupom {
        padding: 20px;
        min-height: 140px;
        border-radius: 12px;
    }
    
    .codigo-desconto h4 {
        font-size: 1.2rem;
    }
    
    .percentual {
        font-size: 1.1rem;
    }
    
    .datas p {
        font-size: 0.95rem;
    }
}

@media (max-width: 600px) {
    .lista {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .cupom {
        padding: 18px;
        min-height: 130px;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 15px;
    }
    
    .cupons {
        padding: 15px;
        border-radius: 8px;
    }
    
    .titulo-principal {
        font-size: 1.5rem;
        margin-bottom: 20px;
        padding: 15px 0;
    }
    
    .lista {
        gap: 12px;
        padding: 10px 0;
    }
    
    .cupom {
        padding: 15px;
        min-height: 120px;
        border-radius: 8px;
    }
    
    .cupom-info {
        gap: 12px;
    }
    
    .codigo-desconto h4 {
        font-size: 1.1rem;
    }
    
    .percentual {
        font-size: 1rem;
    }
    
    .datas p {
        font-size: 0.9rem;
    }
    
    .status span {
        font-size: 0.8rem;
        padding: 6px 10px;
    }
    
    .sem-cupons {
        padding: 40px 20px;
        font-size: 1.1rem;
    }
}

@media (max-width: 360px) {
    .tudo {
        padding: 10px;
    }
    
    .cupons {
        padding: 12px;
    }
    
    .titulo-principal {
        font-size: 1.3rem;
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
        font-size: 0.85rem;
    }
    
    .status span {
        font-size: 0.75rem;
        padding: 5px 8px;
    }
}
</style>