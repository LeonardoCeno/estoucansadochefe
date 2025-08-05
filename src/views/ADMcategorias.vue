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
    height: 100%;
    background-color: #ffffff;
    padding: 50px 0px 0px 70px;
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
    width: 94%;
    height: 30%;
}

.botoes h3 {
    font-size: 2.5rem;
    font-family: helvetica;
}

.categorias ul {
    max-height: 70vh;
    overflow-y: auto;
}

.categorias li {
    background-color: #e4e4e4;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.1rem;
    border: 1px solid #a9b5b6;
}

.categorias li img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    aspect-ratio: 1/1;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #ccc;
}

.categorias li button {
    background-color: #6c757d;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-left: 10px;
}

.categorias li .edit-button {
    background-color: #007bff;
}

.categorias li .edit-button:hover {
    background-color: #0056b3;
}

.categorias li .delete-button {
    background-color: #dc3545;
}

.categorias li .delete-button:hover {
    background-color: #c82333;
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
    background-color: #dc3545 !important;
    color: white !important;
}
.excluir-btn:hover {
    background-color: #b71c1c !important;
}

.botoes {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 25px;
    border-bottom: 1px solid rgb(134, 134, 134);
}

.categoria-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.produtos-count {
    font-size: 0.85rem;
    color: #666;
    font-weight: normal;
    background-color: #f0f0f0;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid #ddd;
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
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    text-align: center;
    border: 2px solid #02060af5;
}

.modal-confirmacao h3 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.3rem;
}

.modal-confirmacao p {
    margin: 0 0 25px 0;
    color: #666;
    font-size: 1rem;
}

.modal-botoes {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.btn-confirmar {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.btn-confirmar:hover {
    background-color: #b71c1c;
}

.btn-cancelar {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.btn-cancelar:hover {
    background-color: #545b62;
}

@media (max-width: 768px) {
    .produtos-count {
        font-size: 0.8rem;
        padding: 1px 6px;
    }
    .tudo {
        padding: 20px 15px 0px 15px;
    }
    .categoria-info {
        gap: 6px;
    }
    .botoes {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }
    .separador {
        gap: 10px;
        width: 100%;
    }
    .BTli {
        gap: 10px;
        width: 100%;
        justify-content: flex-end;
    }
    .categorias li button {
        padding: 4px 8px;
        font-size: 0.8rem;
        margin-left: 5px;
    }
    .categorias li {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 12px;
        font-size: 1rem;
    }
    .categorias {
        width: 100%;
        height: auto;
    }
    .botoes h3 {
        font-size: 2rem;
    }
    .criacao-form button {
        padding: 8px 16px;
        font-size: 1rem;
    }
    .criacao-form h2 {
        font-size: 2rem;
        margin-bottom: 15px;
    }
    .criacao-form {
        width: 95%;
        padding: 20px;
        margin: 10px;
    }
    .nova-categoria-btn {
        padding: 8px 16px;
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .modal-confirmacao {
        padding: 20px;
        margin: 20px;
    }
    .modal-botoes {
        flex-direction: column;
        gap: 10px;
    }
    .btn-confirmar,
    .btn-cancelar {
        padding: 12px 20px;
    }
    .nova-categoria-btn {
        padding: 6px 12px;
        font-size: 0.9rem;
    }
    .tudo {
        padding: 15px 10px 0px 10px;
    }
    .criacao-form {
        width: 98%;
        padding: 15px;
        margin: 5px;
    }
    .criacao-form h2 {
        font-size: 1.5rem;
        margin-bottom: 10px;
    }
    .criacao-form button {
        padding: 6px 12px;
        font-size: 0.9rem;
        margin-bottom: 5px;
    }
    .botoes h3 {
        font-size: 1.5rem;
    }
    .categorias li {
        padding: 10px;
        font-size: 0.9rem;
    }
    .categorias li button {
        padding: 3px 6px;
        font-size: 0.75rem;
        margin-left: 3px;
    }
    .BTli {
        gap: 5px;
    }
    .separador {
        gap: 8px;
    }
    .botoes {
        gap: 10px;
    }
    .produtos-count {
        font-size: 0.75rem;
        padding: 1px 4px;
    }
}

</style>