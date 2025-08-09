<template>
    <div class="tudo" >
        <div v-if="mostraFormulario || editando" class="criacao-form-wrapper">
            <div class="criacao-form">
                <h2>{{ editando ? 'Editar Categoria' : 'Criar Categoria' }}</h2>
                <form @submit.prevent="editando ? atualizarCategoria() : criarCategoria()">
                    <div>
                        <label>Nome:</label>
                        <input v-model="nomeForm" required />
                    </div>
                    <div>
                        <label>Descrição:</label>
                        <textarea v-model="descricaoForm" required></textarea>
                    </div>
                    <div>
                        <label>Imagem:</label>
                        <input type="file" @change="onFileChange" accept="image/*" />
                    </div>
                    <button type="submit">{{ editando ? 'Salvar' : 'Criar Categoria' }}</button>
                    <button type="button" @click="editando ? cancelarEdicao() : fecharFormulario()">Cancelar</button>
                </form>
                <p v-if="editando ? mensagemEdicao : mensagem">{{ editando ? mensagemEdicao : mensagem }}</p>
            </div>
        </div>
        <div class="categorias" >
            <div class="botoes" >
                <h3>Categorias</h3> <button class="nova-categoria-btn" @click="abrirCriacao">Nova categoria</button>
            </div>
        <div v-if="carregandoCategorias" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Carregando categorias...</p>
        </div>
        <div v-else-if="erroCategorias">{{ erroCategorias }}</div>
        <div v-else>
        <div v-if="categorias.length === 0">Nenhuma categoria cadastrada ainda.</div>
        <ul v-else>
            <li v-for="cat in categorias" :key="cat.id">
                <div class="separador" >
                <img v-if="cat.image_path" :src="cat.image_path.startsWith('http') ? cat.image_path : apiBase + cat.image_path" alt="Imagem da categoria" style="width:50px;height:50px;vertical-align:middle;margin-right:8px;"/>
                <div class="categoria-info">
                    <b>{{ cat.name }}</b>
                    <span class="produtos-count">({{ cat.produtosCount || 0 }} produtos)</span>
                </div>
                </div> - {{ cat.description }}
                <div class="BTli" >
                <button @click="editarCategoria(cat)">Editar</button>
                <button class="excluir-btn" @click="abrirModalExclusao(cat.id)">Excluir</button>
                </div>
            </li>
        </ul>
        </div>
        </div>
    </div>

    <div v-if="mostrarModalConfirmacao" class="modal-overlay">
        <div class="modal-confirmacao">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta categoria?</p>
            <div class="modal-botoes">
                <button @click="confirmarExclusao" class="btn-confirmar">Confirmar</button>
                <button @click="fecharModalConfirmacao" class="btn-cancelar">Cancelar</button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '../services/api'

const apiBase = 'http://35.196.79.227:8000'
const toast = useToast()
const mensagem = ref('')

const categorias = ref([])
const carregandoCategorias = ref(true)
const erroCategorias = ref('')

const editando = ref(false)
const editId = ref(null)
const mensagemEdicao = ref('')

const mostraFormulario = ref(false)
const mostrarModalConfirmacao = ref(false)
const categoriaParaExcluir = ref(null)

const nomeForm = ref('')
const descricaoForm = ref('')
const imagemForm = ref(null)

onMounted(async () => {
    await carregarCategorias()
})

function onFileChange(e) {
    imagemForm.value = e.target.files[0]
}

async function criarCategoria() {
    mensagem.value = ''
    try {
        const formData = new FormData()
        formData.append('name', nomeForm.value)
        formData.append('description', descricaoForm.value)
        if (imagemForm.value) formData.append('image', imagemForm.value)
        await api.post('/categories/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Categoria criada com sucesso!')
        nomeForm.value = ''
        descricaoForm.value = ''
        imagemForm.value = null
        await carregarCategorias()
        fecharFormulario()
    } catch (e) {
        toast.error('Erro ao criar categoria.')
    }
}

async function carregarCategorias() {
    carregandoCategorias.value = true
    erroCategorias.value = ''
    try {
        const { data } = await api.get('/categories/user/228')
        const categoriasComProdutos = await Promise.all(
            data.map(async (cat) => {
                try {
                    const produtosResponse = await api.get(`/products/category/${cat.id}`)
                    const produtosCount = produtosResponse.data.length
                    return {
                        ...cat,
                        image_path: cat.image_path ? (cat.image_path.startsWith('http') ? cat.image_path : apiBase + cat.image_path) : '',
                        produtosCount: produtosCount
                    }
                } catch (error) {
                    console.error(`Erro ao buscar produtos da categoria ${cat.id}:`, error)
                    return {
                        ...cat,
                        image_path: cat.image_path ? (cat.image_path.startsWith('http') ? cat.image_path : apiBase + cat.image_path) : '',
                        produtosCount: 0
                    }
                }
            })
        )
        
        categorias.value = categoriasComProdutos
    } catch (e) {
        erroCategorias.value = 'Erro ao carregar categorias.'
    } finally {
        carregandoCategorias.value = false
    }
}

function editarCategoria(cat) {
    editando.value = true
    mostraFormulario.value = false
    editId.value = cat.id
    nomeForm.value = cat.name
    descricaoForm.value = cat.description
    imagemForm.value = null
    mensagemEdicao.value = ''
    mostraFormulario.value = true
}
function cancelarEdicao() {
    editando.value = false
    editId.value = null
    nomeForm.value = ''
    descricaoForm.value = ''
    imagemForm.value = null
    mensagemEdicao.value = ''
    mostraFormulario.value = false
}

async function atualizarCategoria() {
    mensagemEdicao.value = ''
    try {
        await api.put(`/categories/${editId.value}`, {
            name: nomeForm.value,
            description: descricaoForm.value
        })
        if (imagemForm.value) {
            const formData = new FormData()
            formData.append('image', imagemForm.value)
            await api.put(`/categories/${editId.value}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
            })
        }
        toast.success('Categoria atualizada com sucesso!')
        await carregarCategorias()
        cancelarEdicao()
    } catch (e) {
        toast.error('Erro ao atualizar categoria.')
    }
}

function abrirModalExclusao(id) {
    categoriaParaExcluir.value = id
    mostrarModalConfirmacao.value = true
}

async function confirmarExclusao() {
    try {
        await api.delete(`/categories/${categoriaParaExcluir.value}`)
        toast.success('Categoria excluída com sucesso!')
        await carregarCategorias()
        fecharModalConfirmacao()
    } catch (e) {
        toast.error('Erro ao excluir categoria.')
        fecharModalConfirmacao()
    }
}

function fecharModalConfirmacao() {
    mostrarModalConfirmacao.value = false
    categoriaParaExcluir.value = null
}

function fecharFormulario() {
    mostraFormulario.value = false
    nomeForm.value = ''
    descricaoForm.value = ''
    imagemForm.value = null
    mensagem.value = ''
}

function abrirCriacao() {
    editando.value = false
    mostraFormulario.value = true
    nomeForm.value = ''
    descricaoForm.value = ''
    imagemForm.value = null
    mensagem.value = ''
}
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

.nova-categoria-btn {
    padding: 10px 20px;
    font-size: 1.2rem;
    background: linear-gradient(135deg, #2d7083 0%, #4690e5 100%);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    align-self: flex-start;
    margin-bottom: 1px;
}

.nova-categoria-btn:hover {
    background: linear-gradient(135deg, #2d7083 0%, #3c79be 100%);
}

.criacao-form-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.criacao-form {
    background-color: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 500px;
    text-align: center;
    border: 2px solid #02060af5;
}

.criacao-form h2 {
    font-size: 2.5rem;
    font-family: helvetica;
    margin-bottom: 20px;
}

.criacao-form label {
    display: block;
    margin-bottom: 10px;
    font-size: 1.1rem;
    font-weight: bold;
}

.criacao-form input[type="text"],
.criacao-form textarea,
.criacao-form input[type="file"] {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
}

.criacao-form button {
    background-color: #1565C0;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1rem;
}

.criacao-form button:hover {
    background-color: #0D47A1;
}

.criacao-form button:last-child {
    background-color: #f44336;
}

.criacao-form button:last-child:hover {
    background-color: #da190b;
}

.criacao-form form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.criacao-form form button {
    margin-right: 10px;
    margin-bottom: 0;
}

.categorias {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(0, 0, 0, 0.05);
}

.botoes h3 {
    font-size: 2.2rem;
    font-family: helvetica;
    background: linear-gradient(135deg, #02060af5 0%, #079ac7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    margin: 0;
}

.categorias ul {
    padding: 10px 0;
    width: 100%;
}

.categorias li {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.1rem;
    border: 2px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
}

.categorias li:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #dee2e6;
}

.categorias li img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    aspect-ratio: 1/1;
    border-radius: 12px;
    background: #fff;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.categorias li button {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-left: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.categorias li button:hover {
    background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}



.categorias p {
    font-size: 1.1rem;
    color: #555;
    margin-top: 10px;
}

.BTli {
    display: flex;
    gap: 5vw;
}

.separador {
    display: flex;
    align-items: center;
    gap: 4vw;
}

.excluir-btn {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
    color: white !important;
}
.excluir-btn:hover {
    background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%) !important;
}

.botoes {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 3px solid #02060af5;
    position: relative;
}

.botoes::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, #079ac7 0%, #02060af5 100%);
    border-radius: 2px;
}

.categoria-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.categoria-info b {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
}

.produtos-count {
    font-size: 0.85rem;
    color: #475569;
    font-weight: 600;
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-confirmacao {
    background: white;
    padding: 35px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    max-width: 450px;
    width: 90%;
    text-align: center;
    border: 3px solid #02060af5;
    position: relative;
}

.modal-confirmacao::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #02060af5 0%, #079ac7 100%);
    border-radius: 16px 16px 0 0;
}

.modal-confirmacao h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 1.4rem;
    font-weight: 600;
}

.modal-confirmacao p {
    margin: 0 0 30px 0;
    color: #64748b;
    font-size: 1.1rem;
    line-height: 1.5;
}

.modal-botoes {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.btn-confirmar {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-confirmar:hover {
    background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.btn-cancelar {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.btn-cancelar:hover {
    background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

/* Responsividade Aprimorada */
@media (max-width: 1024px) {
    .tudo {
        padding: 25px;
    }
    
    .categorias {
        padding: 25px;
    }
    
    .botoes h3 {
        font-size: 2rem;
    }
    
    .nova-categoria-btn {
        padding: 10px 18px;
        font-size: 1.1rem;
    }
}

@media (max-width: 768px) {
    .tudo {
        padding: 20px;
    }
    
    .categorias {
        padding: 20px;
        border-radius: 12px;
    }
    
    .produtos-count {
        font-size: 0.8rem;
        padding: 3px 8px;
    }
    
    .categoria-info {
        gap: 10px;
        flex-direction: column;
        align-items: flex-start;
    }
    
    .categoria-info b {
        font-size: 1.1rem;
    }
    
    .botoes {
        flex-direction: column;
        gap: 20px;
        align-items: center;
        text-align: center;
    }
    
    .botoes h3 {
        font-size: 1.8rem;
    }
    
    .separador {
        gap: 15px;
        width: 100%;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .BTli {
        gap: 15px;
        width: 100%;
        justify-content: center;
        margin-top: 15px;
    }
    
    .categorias li {
        flex-direction: column;
        align-items: center;
        gap: 15px;
        padding: 20px;
        font-size: 1rem;
        text-align: center;
    }
    
    .categorias li button {
        padding: 8px 16px;
        font-size: 0.9rem;
        margin-left: 0;
        min-width: 80px;
    }
    
    .categorias li img {
        width: 70px;
        height: 70px;
    }
    
    .criacao-form {
        width: 95%;
        padding: 25px;
        margin: 15px;
        border-radius: 12px;
    }
    
    .criacao-form h2 {
        font-size: 1.8rem;
        margin-bottom: 20px;
    }
    
    .criacao-form button {
        padding: 10px 20px;
        font-size: 1rem;
    }
    
    .nova-categoria-btn {
        padding: 10px 20px;
        font-size: 1rem;
    }
    
    .modal-confirmacao {
        padding: 25px;
        margin: 20px;
    }
    
    .modal-botoes {
        gap: 15px;
    }
}

@media (max-width: 480px) {
    .tudo {
        padding: 15px;
    }
    
    .categorias {
        padding: 15px;
        border-radius: 8px;
    }
    
    .botoes h3 {
        font-size: 1.5rem;
    }
    
    .nova-categoria-btn {
        padding: 8px 16px;
        font-size: 0.9rem;
    }
    
    .categorias li {
        padding: 15px;
        font-size: 0.95rem;
        gap: 12px;
    }
    
    .categorias li img {
        width: 60px;
        height: 60px;
    }
    
    .categoria-info b {
        font-size: 1rem;
    }
    
    .categorias li button {
        padding: 6px 12px;
        font-size: 0.8rem;
        min-width: 70px;
    }
    
    .BTli {
        gap: 10px;
    }
    
    .produtos-count {
        font-size: 0.75rem;
        padding: 2px 6px;
    }
    
    .criacao-form {
        width: 98%;
        padding: 20px;
        margin: 10px;
        border-radius: 8px;
    }
    
    .criacao-form h2 {
        font-size: 1.5rem;
        margin-bottom: 15px;
    }
    
    .criacao-form button {
        padding: 8px 16px;
        font-size: 0.9rem;
    }
    
    .modal-confirmacao {
        padding: 20px;
        margin: 15px;
        border-radius: 12px;
    }
    
    .modal-confirmacao h3 {
        font-size: 1.2rem;
    }
    
    .modal-confirmacao p {
        font-size: 1rem;
        margin-bottom: 25px;
    }
    
    .modal-botoes {
        flex-direction: column;
        gap: 12px;
    }
    
    .btn-confirmar,
    .btn-cancelar {
        padding: 12px 20px;
        width: 100%;
    }
}

@media (max-width: 360px) {
    .tudo {
        padding: 10px;
    }
    
    .categorias {
        padding: 12px;
    }
    
    .botoes h3 {
        font-size: 1.3rem;
    }
    
    .nova-categoria-btn {
        padding: 6px 12px;
        font-size: 0.85rem;
    }
    
    .categorias li {
        padding: 12px;
        gap: 10px;
    }
    
    .categorias li img {
        width: 50px;
        height: 50px;
    }
    
    .categoria-info b {
        font-size: 0.95rem;
    }
    
    .categorias li button {
        padding: 5px 10px;
        font-size: 0.75rem;
        min-width: 60px;
    }
    
    .produtos-count {
        font-size: 0.7rem;
        padding: 1px 4px;
    }
    
    .criacao-form {
        padding: 15px;
        margin: 5px;
    }
    
    .criacao-form h2 {
        font-size: 1.3rem;
    }
    
    .criacao-form button {
        padding: 6px 12px;
        font-size: 0.85rem;
    }
}

</style>