<template>
    <div class="tudo">
        <div class="conteudo">
            <div class="barra-do-titulo">
                <div class="titulo">
                    <h1>Criar Moderador</h1>
                    <p class="subtitulo">Adicione novos moderadores ao sistema</p>
                </div>
            </div>

            <!-- Formulário de criação -->
            <div class="formulario-area">
                <div class="tituloformulario">
                    <h2>Novo Moderador</h2>
                    <form class="formulario" @submit.prevent="criarModerador">
                        <div class="campos">
                            <div class="campo">
                                <label for="nome">Nome *</label>
                                <input 
                                    v-model="novoModerador.name" 
                                    type="text" 
                                    id="nome"
                                    placeholder="Nome" 
                                    required 
                                />
                            </div>
                            <div class="campo">
                                <label for="email">E-mail *</label>
                                <input 
                                    v-model="novoModerador.email" 
                                    type="email" 
                                    id="email"
                                    placeholder="email@exemplo.com" 
                                    required 
                                />
                            </div>
                            <div class="campo">
                                <label for="senha">Senha *</label>
                                <input 
                                    v-model="novoModerador.password" 
                                    type="password" 
                                    id="senha"
                                    placeholder="Senha" 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div class="botoes">
                            <button type="submit" :disabled="criando" class="btn-criar">
                                {{ criando ? 'Criando...' : 'Criar Moderador' }}
                            </button>
                        </div>
                        
                        <div v-if="erro" class="erro">
                            {{ erro }}
                        </div>
                        
                        <div v-if="sucesso" class="sucesso">
                            {{ sucesso }}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { criarModerador as criarModeradorAPI } from '../services/api'

const criando = ref(false)
const erro = ref(null)
const sucesso = ref(null)

const novoModerador = ref({
    name: '',
    email: '',
    password: '',
    role: 'MODERATOR'
})

async function criarModerador() {
    if (!novoModerador.value.name || !novoModerador.value.email || 
        !novoModerador.value.password) {
        erro.value = 'Todos os campos são obrigatórios.'
        return
    }

    criando.value = true
    erro.value = null
    sucesso.value = null

    try {
        // Chamada da API real
        await criarModeradorAPI(novoModerador.value)
        
        // Limpar formulário
        novoModerador.value = { name: '', email: '', password: '', role: 'MODERATOR' }
        
        // Mostrar mensagem de sucesso
        sucesso.value = 'Moderador criado com sucesso!'
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
            sucesso.value = null
        }, 3000)
        
    } catch (e) {
        erro.value = e.response?.data?.detail || 'Erro ao criar moderador.'
    } finally {
        criando.value = false
    }
}
</script>

<style scoped>
.tudo {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    overflow-y: hidden;
    overflow-x: hidden;
    padding: 20px;
    box-sizing: border-box;
    min-width: 0;
}

.conteudo {
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-width: 0;
    overflow-x: hidden;
    overflow-y: hidden;
}

.barra-do-titulo {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    padding: 32px;
    margin-bottom: 50px;
    border-radius: 7px;
    border-bottom: 1px solid #e1e5e9;
}

.titulo h1 {
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    padding: 20px 0;
    border-bottom: 3px solid #02060af5;
    position: relative;
}

.titulo h1::after {
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

.subtitulo {
    margin: 0;
    color: #666;
    font-size: 1rem;
    text-align: center;
}

.formulario-area {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    min-width: 0;
    overflow-x: hidden;
}

.tituloformulario {
    background: #fff;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.116);
    border-radius: 5px;
    padding: 30px;
    min-width: 0;
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 20px;
}

.tituloformulario h2 {
    margin: 0 0 20px 0;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.3rem;
    font-weight: 700;
    text-align: center;
    padding: 10px 0;
    border-bottom: 2px solid #e9ecef;
    position: relative;
}

.tituloformulario h2::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #079ac7 0%, #02060af5 100%);
    border-radius: 1px;
}

.formulario {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.campos {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.campo {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.campo label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.campo input {
    padding: 12px 14px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    background: #fff;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
}

.campo input:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.botoes {
    display: flex;
    justify-content: center;
    margin-top: 8px;
}

.btn-criar {
    width: 100%;
    padding: 14px 24px;
    background: #079ac7;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
    min-width: 0;
    box-shadow: 0 2px 8px rgba(7, 154, 199, 0.3);
}

.btn-criar:hover {
    background: #067aa0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(7, 154, 199, 0.4);
}

.btn-criar:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.erro {
    background: #fee;
    color: #c53030;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #feb2b2;
    text-align: center;
    font-size: 0.9rem;
}

.sucesso {
    background: #f0fff4;
    color: #22543d;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #9ae6b4;
    text-align: center;
    font-size: 0.9rem;
}

/* Responsividade */
@media (max-width: 1024px) {
    .tituloformulario {
        max-width: 600px;
        padding: 32px;
    }
    
    .titulo h1 {
        font-size: 1.6rem;
    }
}

@media (max-width: 768px) {
    .tudo {
        padding: 16px;
        overflow-x: hidden;
    }
    
    .conteudo {
        padding: 0 16px;
        overflow-x: hidden;
    }
    
    .barra-do-titulo {
        padding: 24px 20px;
        margin-bottom: 20px;
    }
    
    .titulo h1 {
        font-size: 1.4rem;
    }
    
    .subtitulo {
        font-size: 0.9rem;
    }
    
    .tituloformulario {
        min-width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 24px 20px;
    }
    
    .tituloformulario h2 {
        font-size: 1.3rem;
        margin-bottom: 24px;
    }
    
    .formulario {
        gap: 20px;
    }
    
    .campos {
        gap: 16px;
    }
    
    .campo input {
        padding: 12px 14px;
        font-size: 0.95rem;
    }
    
    .btn-criar {
        padding: 14px 24px;
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 12px;
        overflow-x: hidden;
    }
    
    .conteudo {
        padding: 0 12px;
        overflow-x: hidden;
    }
    
    .barra-do-titulo {
        padding: 20px 16px;
        margin-bottom: 16px;
    }
    
    .titulo h1 {
        font-size: 1.2rem;
    }
    
    .subtitulo {
        font-size: 0.85rem;
    }
    
    .tituloformulario {
        padding: 20px 16px;
    }
    
    .tituloformulario h2 {
        font-size: 1.1rem;
        margin-bottom: 20px;
    }
    
    .formulario {
        gap: 16px;
    }
    
    .campos {
        gap: 14px;
    }
    
    .campo label {
        font-size: 0.9rem;
    }
    
    .campo input {
        padding: 10px 12px;
        font-size: 0.9rem;
    }
    
    .btn-criar {
        padding: 12px 20px;
        font-size: 0.95rem;
    }
    
    .erro, .sucesso {
        padding: 10px 12px;
        font-size: 0.85rem;
    }
}

@media (max-width: 360px) {
    .tudo {
        padding: 8px;
        overflow-x: hidden;
    }
    
    .conteudo {
        padding: 0 8px;
        overflow-x: hidden;
    }
    
    .barra-do-titulo {
        padding: 16px 12px;
    }
    
    .titulo h1 {
        font-size: 1.1rem;
    }
    
    .tituloformulario {
        padding: 16px 12px;
    }
    
    .tituloformulario h2 {
        font-size: 1rem;
    }
    
    .campo input {
        padding: 8px 10px;
        font-size: 0.85rem;
    }
    
    .btn-criar {
        padding: 10px 16px;
        font-size: 0.9rem;
    }
}
</style>