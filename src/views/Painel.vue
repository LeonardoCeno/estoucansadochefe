<template>
<div class="painel-layout">
<TopBar />
<div class="Tudo">
    <button class="menu-toggle" @click.stop="menuAberto = true">☰ Menu</button>
    <div class="offcanvas-overlay" v-if="menuAberto" @click="menuAberto = false"></div>
    <div class="menuesquerdo" :class="{ aberto: menuAberto }" >
        <h2> <span class="h2fake" > Olá, {{ usuario.name }}</span> 👋 </h2>
        <router-link to="/dados"> <button :class="{ active: $route.path === '/dados' }">Meus dados</button></router-link>
        <router-link to="/carrinho"> <button :class="{ active: $route.path === '/carrinho' }">Carrinho</button></router-link>
        <router-link to="/favoritos"> <button :class="{ active: $route.path === '/favoritos' }">Favoritos</button></router-link>
        <router-link to="/pedidos"> <button :class="{ active: $route.path === '/pedidos' }">Pedidos</button></router-link>
        <router-link to="/enderecos"> <button :class="{ active: $route.path === '/enderecos' }">Endereços</button></router-link>
        <router-link to="/cupons"> <button :class="{ active: $route.path === '/cupons' }">Cupons</button></router-link>
        <div class="admin" v-if="userRole && (userRole === 'ADMIN' || userRole === 'MODERATOR')">
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
</div>

</template>

<script setup>
import TopBar from '../components/TopBar.vue'
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const usuario = computed(() => userStore.user || {})
const userRole = computed(() => userStore.user?.role)
const menuAberto = ref(false)
</script>

<style scoped>



.painel-layout{
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.Tudo{
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    width: 100%;
    flex: 1;
    padding: 0;
    box-sizing: border-box;
    overflow: visible;
}

.menu-toggle{
    display: none;
}

.offcanvas-overlay{
    display: none;
}

.menuesquerdo{
    width: 18vw;
    max-width: 350px;
    min-width: 250px;
    height: auto;
    background: #02060af5;
    z-index: 10;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: visible;
    border-radius: 0;
    border: none;
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
    flex: 1;
    min-width: 0;
    height: auto;
    width: auto;
    max-width: none;
    background-color: transparent;
    border: none;
    overflow: visible;
    border-radius: 0;
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
        flex: 1;
        min-width: 0;
        width: auto;
        max-width: none;
        overflow: visible;
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
        flex: 1;
        min-width: 0;
        width: auto;
        max-width: none;
        overflow: visible;
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
        height: auto;
        padding: 0;
    }
    .menu-toggle{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 1200;
        background: #079ac7;
        color: #ffffff;
        border: none;
        padding: 12px 14px;
        border-radius: 10px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
    }
    .menu-toggle:active{ transform: scale(0.98); }

    .offcanvas-overlay{
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.35);
        z-index: 1100;
    }
    
    .menuesquerdo {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        width: 85vw;
        max-width: 320px;
        min-width: 260px;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        margin-bottom: 0;
        padding: 0;
        box-sizing: border-box;
        border-radius: 0;
        z-index: 1201;
        overflow-y: auto;
    }
    .menuesquerdo.aberto{
        transform: translateX(0);
    }

    /* removido botão de fechar */
    
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
        flex: 1;
        min-width: 0;
        width: auto;
        max-width: none;
        height: auto;
        min-height: auto;
        overflow: visible;
    }
    
    .menuesquerdo button {
        height: clamp(45px, 5vh, 60px);
        font-size: clamp(0.8rem, 1.2vw, 1rem);
    }
}

@media (max-width: 480px) {
    .Tudo {
        height: auto;
        padding: 0;
    }
    
    .menuesquerdo {
        width: 28vw;
        max-width: 130px;
        min-width: 120px;
        padding: 0;
        box-sizing: border-box;
        border-radius: 0;
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
        flex: 1;
        min-width: 0;
        width: auto;
        max-width: none;
        overflow: visible;
    }
    
    .menuesquerdo button {
        height: clamp(40px, 4vh, 50px);
        font-size: clamp(0.7rem, 1vw, 0.9rem);
    }
}

@media (max-width: 320px) {
    .Tudo {
        height: auto;
        padding: 0;
    }
    
    .menuesquerdo {
        width: 32vw;
        max-width: 100px;
        min-width: 90px;
        border-radius: 0;
    }
    
    .menudireito {
        flex: 1;
        min-width: 0;
        width: auto;
        max-width: none;
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