<template>
<TopBar />
<div class="Tudo">
    <div class="menuesquerdo" >
        <h2> <span class="h2fake" > Olá, {{ usuario.name }}</span> 👋 </h2>
        <router-link to="/dados"> <button :class="{ active: $route.path === '/dados' }">Meus dados</button></router-link>
        <router-link to="/carrinho"> <button :class="{ active: $route.path === '/carrinho' }">Carrinho</button></router-link>
        <router-link to="/favoritos"> <button :class="{ active: $route.path === '/favoritos' }">Favoritos</button></router-link>
        <router-link to="/pedidos"> <button :class="{ active: $route.path === '/pedidos' }">Pedidos</button></router-link>
        <router-link to="/enderecos"> <button :class="{ active: $route.path === '/enderecos' }">Endereços</button></router-link>
        <router-link to="/cupons"> <button :class="{ active: $route.path === '/cupons' }">Cupons</button></router-link>
        <div class="admin" v-if="userRole === 'ADMIN' || userRole === 'MODERATOR'">
        <h3>GERENCIAR</h3>
        <router-link to="/ADMmoderadores"> <button :class="{ active: $route.path === '/ADMmoderadores' }">Moderadores</button></router-link>
        <router-link to="/ADMcategorias"> <button :class="{ active: $route.path === '/ADMcategorias' }">Categorias</button></router-link>
        <router-link to="/ADMprodutos"> <button :class="{ active: $route.path === '/ADMprodutos' }">Produtos</button></router-link>
        <router-link to="/ADMpedidos"> <button :class="{ active: $route.path === '/ADMpedidos' }">Pedidos</button></router-link>
        <router-link to="/ADMcupons"> <button :class="{ active: $route.path === '/ADMcupons' }">Cupons</button></router-link>
        
        </div>
    </div>
    <div class="menudireito" >
        <router-view></router-view>
    </div>
</div>
<Footer></Footer>
</template>

<script setup>
import TopBar from '../components/TopBar.vue'
import Footer from '../components/Footercomponent.vue'
import { ref, onMounted } from 'vue'
import api from '../services/api'

const usuario = ref({})
const userRole = ref(null)

onMounted(async () => {
    try {
        const token = localStorage.getItem('token')
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            const { data } = await api.get('/users/me')
            usuario.value = data
            userRole.value = data.role
        }
    } catch (e) {
        userRole.value = null
    }
})
</script>

<style scoped>



.Tudo{
    display: flex;
    justify-content: center;
    width: 100%;
    height: 95vh;
    padding: 15px;
    box-sizing: border-box;
    overflow: hidden;
}

.menuesquerdo{
    width: 18vw;
    max-width: 350px;
    min-width: 250px;
    height: 100%;
    background: #02060af5;
    z-index: 10;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    border-radius: 12px 0 0 12px;
    border-left: 1px solid #02060af5;
}

.menuesquerdo h2 {
    color: #ffffff;
    text-align: center;
    padding: 20px 15px 15px 15px;
    font-size: clamp(1rem, 1.6vw, 1.4rem);
    margin: 0;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.h2fake {
    color: #ffffff;
}

.menuesquerdo h3{
    color: #079ac7;
    font-size: clamp(1rem, 1.6vw, 1.4rem);
    font-weight: 600;
    text-align: center;
    margin: 15px 15px 10px 15px;
    padding: 10px 15px;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.menuesquerdo button{
    width: 100%;
    height: clamp(40px, 4.5vh, 60px);
    color: #ffffff;
    font-weight: 500;
    font-size: clamp(0.8rem, 1.3vw, 1.1rem);
    background: transparent;
    border: none;
    margin: 0;
    padding: 0 15px;

    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

.menuesquerdo button:hover{
    color: #079ac7;
}

.menuesquerdo button.active {
    border-left: 4px solid #ffffff;
    padding-left: 11px;
}

.admin button.active {
    border-left: 4px solid #079ac7;
    padding-left: 11px;
}

.menudireito{
    width: calc(100% - 18vw);
    max-width: calc(100% - 350px);
    min-width: calc(100% - 250px);
    height: 100%;
    background-color: #ffffff;
    border: 1px solid black;
    overflow: hidden;
    min-width: 0;
    flex: 1;
    border-radius: 0 12px 12px 0;
}

.admin button{
    color: #079ac7;
}

.admin button:hover {
    color: #ffffff !important;
}

/* Responsividade para telas grandes (TVs e monitores) */
@media (min-width: 1920px) {
    .menuesquerdo {
        width: 16vw;
        max-width: 450px;
        min-width: 300px;
    }
    
    .menudireito {
        width: calc(100% - 16vw);
        max-width: calc(100% - 450px);
        min-width: calc(100% - 300px);
        overflow: hidden;
    }
    
    .menuesquerdo h2 {
        font-size: clamp(1.2rem, 1.8vw, 1.6rem);
        padding: 25px 20px 20px 20px;
    }
    
    .menuesquerdo h3 {
        font-size: clamp(1.3rem, 2vw, 1.7rem);
        margin: 20px 20px 15px 20px;
        padding: 12px 20px;
    }
    
    .menuesquerdo button {
        height: clamp(50px, 5.5vh, 80px);
        font-size: clamp(0.9rem, 1.5vw, 1.3rem);
        padding: 0 20px;
    }
}

@media (min-width: 2560px) {
    .menuesquerdo {
        width: 14vw;
        max-width: 550px;
        min-width: 350px;
    }
    
    .menudireito {
        width: calc(100% - 14vw);
        max-width: calc(100% - 550px);
        min-width: calc(100% - 350px);
        overflow: hidden;
    }
    
    .menuesquerdo h2 {
        font-size: clamp(1.4rem, 2.2vw, 2rem);
        padding: 30px 25px 25px 25px;
    }
    
    .menuesquerdo h3 {
        font-size: clamp(1.5rem, 2.5vw, 2.2rem);
        margin: 25px 25px 20px 25px;
        padding: 15px 25px;
    }
    
    .menuesquerdo button {
        height: clamp(60px, 6.5vh, 90px);
        font-size: clamp(1.1rem, 1.8vw, 1.6rem);
        padding: 0 25px;
    }
}

/* Responsividade */
@media (max-width: 768px) {
    .Tudo {
        flex-direction: row;
        height: 95vh;
        padding: 12px;
    }
    
    .menuesquerdo {
        width: 22vw;
        max-width: 180px;
        min-width: 160px;
        height: 100%;
        margin-bottom: 0;
        padding: 0;
        box-sizing: border-box;
        border-radius: 0 10px 10px 0;
    }
    
    .menuesquerdo button {
        padding: 0 12px;
        font-size: clamp(0.75rem, 1.1vw, 0.95rem);
        height: clamp(40px, 4.5vh, 60px);
    }
    
    .menuesquerdo h2 {
        padding: 18px 12px 12px 12px;
        font-size: clamp(0.9rem, 1.6vw, 1.3rem);
    }
    
    .menuesquerdo h3 {
        margin: 12px 12px 8px 12px;
        padding: 8px 12px;
        font-size: clamp(1rem, 1.7vw, 1.4rem);
    }
    
    .menudireito {
        width: calc(100% - 22vw);
        max-width: calc(100% - 180px);
        min-width: calc(100% - 160px);
        height: 100%;
        min-height: auto;
        overflow: hidden;
    }
    
    .menuesquerdo button {
        height: clamp(45px, 5vh, 60px);
        font-size: clamp(0.8rem, 1.2vw, 1rem);
    }
}

@media (max-width: 480px) {
    .Tudo {
        height: 95vh;
        padding: 8px;
    }
    
    .menuesquerdo {
        width: 28vw;
        max-width: 130px;
        min-width: 120px;
        padding: 0;
        box-sizing: border-box;
        border-radius: 0 8px 8px 0;
    }
    
    .menuesquerdo button {
        padding: 0 8px;
        font-size: clamp(0.65rem, 0.9vw, 0.85rem);
        height: clamp(35px, 3.5vh, 45px);
    }
    
    .menuesquerdo h2 {
        padding: 12px 8px 8px 8px;
        font-size: clamp(0.8rem, 1.3vw, 1.1rem);
    }
    
    .menuesquerdo h3 {
        margin: 8px 8px 6px 8px;
        padding: 6px 8px;
        font-size: clamp(0.9rem, 1.4vw, 1.2rem);
    }
    
    .menudireito {
        width: calc(100% - 28vw);
        max-width: calc(100% - 130px);
        min-width: calc(100% - 120px);
        overflow: hidden;
    }
    
    .menuesquerdo button {
        height: clamp(40px, 4vh, 50px);
        font-size: clamp(0.7rem, 1vw, 0.9rem);
    }
}

@media (max-width: 320px) {
    .Tudo {
        height: 95vh;
        padding: 6px;
    }
    
    .menuesquerdo {
        width: 32vw;
        max-width: 100px;
        min-width: 90px;
        border-radius: 0 6px 6px 0;
    }
    
    .menudireito {
        width: calc(100% - 32vw);
        max-width: calc(100% - 100px);
        min-width: calc(100% - 90px);
    }
    
    .menuesquerdo button {
        padding: 0 6px;
        font-size: clamp(0.6rem, 0.8vw, 0.8rem);
        height: clamp(30px, 3vh, 40px);
    }
    
    .menuesquerdo h2 {
        padding: 10px 6px 6px 6px;
        font-size: clamp(0.7rem, 1.1vw, 1rem);
    }
    
    .menuesquerdo h3 {
        margin: 6px 6px 4px 6px;
        padding: 4px 6px;
        font-size: clamp(0.8rem, 1.2vw, 1.1rem);
    }
}

</style>