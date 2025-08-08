<template>
    <Pracima :visivel="mostrarBtnTopo" />
    <div ref="bannerRef" class="banner">
        <div
        class="carousel-wrapper"
        :style="{ transform: `translateX(-${indexAtual * 100}%)` }">
        <div
            class="carousel-slide"
            v-for="(banner, i) in banners"
            :key="i">
            <div class="banner-link" @click="navegarParaBanner(i)">
                <img class="img1" :src="banner" alt="banner" />
            </div>
        </div>
        </div>
        <div class="indicators">
            <button 
                v-for="(banner, i) in banners" 
                :key="i"
                class="indicator"
                :class="{ active: indexAtual === i }"
                @click="irParaBanner(i)">
            </button>
        </div>
        
        <button class="nav left" @click="voltar">&#10094;</button>
        <button class="nav right" @click="avancar">&#10095;</button>
    </div>
    <div class="carrosel-container">
    <div class="carrosel-linha" >
        <div class="carrosel-movimento">
            <img src="./img/IMAGEMDOSACI.png" alt="">
            <img src="./img/IMAGEMDOSACI2.png" alt="">
            <img src="./img/IMAGEMDOSACI.png" alt="">
            <img src="./img/IMAGEMDOSACI2.png" alt="">
            <img src="./img/IMAGEMDOSACI.png" alt="">
            <img src="./img/IMAGEMDOSACI2.png" alt="">
        </div>
    </div>
    <div class="carrosel-linha" >
        <div class="carrosel-movimento2">
            <img src="./img/IMAGEMDOSACI2.png" alt="">
            <img src="./img/IMAGEMDOSACI.png" alt="">
            <img src="./img/IMAGEMDOSACI2.png" alt="">
            <img src="./img/IMAGEMDOSACI.png" alt="">
            <img src="./img/IMAGEMDOSACI2.png" alt="">
            <img src="./img/IMAGEMDOSACI.png" alt="">
        </div>
    </div>
    </div>
    <div class="beneficios">
    <div class="item">
        <img src="../components/img/caminhaopenege-Photoroom.png" alt="">
        <div class="texto">
        <strong>FRETE GRÁTIS</strong><br />
        ACIMA DE R$15
        </div>
    </div>

    <div class="item">
        <img src="../components/img/cadeado.png" alt="">
        <div class="texto">
        <strong>COMPRA CERTA</strong><br />
        100% SEGURA
        </div>
    </div>

    <div class="item">
        <img src="../components/img/pix.webp" alt="">
        <div class="texto">
        <strong>PAGAMENTO</strong><br />
        VIA PIX
        </div>
    </div>

    <div class="item">
        <img src="../components/img/cartao.png" alt="">
        <div class="texto">
        <strong>PARCELAS DE</strong><br />
        ATÉ 3X SEM JUROS
        </div>
    </div>
    </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import banner1 from './img/bannervariante.png'
import banner2 from './img/bannerprincipal2.jpg'
import banner3 from './img/bannerprincipal3.png'
import Pracima from './pracima.vue'

const banners = [banner1, banner2, banner3]
const bannerLinks = ['/pesquisas?categoriaId=318' , '/pesquisas?categoriaId=0', '/pesquisas?categoriaId=316']
const indexAtual = ref(0)

const mostrarBtnTopo = ref(false)
const bannerRef = ref(null)
let observer = null

const avancar = () => {
    indexAtual.value = (indexAtual.value + 1) % banners.length
}

const voltar = () => {
    indexAtual.value = (indexAtual.value - 1 + banners.length) % banners.length
}

const irParaBanner = (index) => {
    indexAtual.value = index
}

const router = useRouter()

const navegarParaBanner = (index) => {
    router.push(bannerLinks[index])
}

onMounted(() => {
    observer = new window.IntersectionObserver(
        ([entry]) => {
            mostrarBtnTopo.value = !entry.isIntersecting
        },
        { threshold: 0.01 }
        )
        if (bannerRef.value) {
            observer.observe(bannerRef.value)
        }
        setInterval(avancar, 6000)
})

onUnmounted(() => {
        if (observer && bannerRef.value) {
            observer.unobserve(bannerRef.value)
        }
})

</script>

<style scoped>

/* Esconder apenas scroll horizontal, manter vertical */
:global(body) {
    overflow-x: hidden;
    overflow-y: auto;
}

:global(html) {
    overflow-x: hidden;
    overflow-y: auto;
}

.carrosel-container {
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: white;
    width: 100%;
    max-width: 100%;
}

.carrosel-linha {
    display: flex;
    width: 100%;
    overflow: hidden;
}

.carrosel-linha img {
    width: 100%;
    height: 100%;
    margin-right: 25px;
}

.carrosel-movimento {
    display: flex;
    animation: deslizar-linha 120s linear infinite;
    align-items: center;
}

@keyframes deslizar-linha {
    0% { transform: translateX(0); }
    100% { transform: translateX(-300%); }
}

.carrosel-movimento2 {
    display: flex;
    animation: deslizar-linha2 100s linear infinite;
    align-items: center;
}

@keyframes deslizar-linha2 {
    0% { transform: translateX(0); }
    100% { transform: translateX(-300%); }
}

.banner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    background-color: #ffffff00;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    height: 290px;
    min-height: 260px;
    max-height: 325px;
    margin-top: 15px;
    padding-bottom: 25px;
    box-sizing: border-box;
}

.carousel-wrapper {
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 100%;
    height: 100%;
}

.carousel-slide {
    min-width: 100%;
    height: 100%;
}

.banner-link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    cursor: pointer;
}

.img1 {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    background-size: cover;
    display: block;
}

.nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2.2rem;
    background: transparent;
    border: none;
    padding: 8px 8px;
    cursor: pointer;
    z-index: 99;
    border-radius: 7px;
    width: 55px;
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
    text-shadow: 
        -2px -2px 0 white,
        2px -2px 0 white,
        -2px 2px 0 white,
        2px 2px 0 white;
}

.left {
    left: 10px;
    color: #4db377;
}

.left:hover {
    color: #3d8f5e;
}

.right {
    right: 10px;
    color: #6bb5d1;
}

.right:hover {
    color: #5496b3;
}

.indicators {
    display: flex;
    gap: 12px;
    z-index: 99;
    align-items: center;
    position: relative;
    bottom: -0.6rem;
    left: 0.1rem;
}

.indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #00264159;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    z-index: 99;
}

.indicator:hover {
    background-color: rgba(255, 255, 255, 0.7);
    transform: scale(1.1);
}

.indicator.active {
    background-color: #14323b;
    transform: scale(1.3);
}

.beneficios {
    display: flex;
    justify-content: space-evenly;
    align-items: stretch;
    padding: 30px 16px;
    flex-wrap: wrap;
    margin-top: 10px;
    margin-bottom: 10px;
}

.item {
    background-color: white;
    flex: 1 1 200px;
    max-width: 240px;
    min-width: 160px;
    margin: 0;
    padding: 20px 10px;
    text-align: center;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: 10px;
    transition: max-width 0.2s, min-width 0.2s, padding 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    margin-bottom: 16px;
    display: block;
    transition: width 0.2s, height 0.2s;
}

.item img[src*="caminhao"] {
    transform: scale(1.8);
    background-color: white;
}

.texto {
    font-size: 0.9rem;
    color: #1c1c1c;
    font-style: italic;
}

.texto strong {
    font-style: normal;
    font-weight: bold;
}



.espaco2 {
    background-color:  #02060af5;
    min-height: 0.2vh;
}

/* ================================
    MEDIA QUERIES - RESPONSIVIDADE
   ================================ */

@media (max-width: 1500px) {
    .banner {
        min-height: 400px;
        margin-top: 20px;
    }
}

/* Desktop grande (>1400px) */
@media (min-width: 1401px) {
    .banner {
        min-height: 340px;
        margin-top: 20px;
    }
}

/* Desktop médio (1200px - 1400px) */
@media (max-width: 1400px) {
    .banner {
        height: 270px;
        min-height: 245px;
        margin-top: 18px;
    }
}

/* Tablet grande (1024px - 1200px) */
@media (max-width: 1200px) {
    .carrosel-linha img {
        width: 100%;
        height: 90px;
        object-fit: cover;
        margin-right: 22px;
    }
    
    .banner {
        height: 245px;
        min-height: 210px;
        margin-top: 15px;
    }
}

/* Tablet médio (768px - 1024px) */
@media (max-width: 1024px) {
    .carrosel-linha img {
        width: 100%;
        height: 85px;
        object-fit: cover;
        margin-right: 20px;
    }
    
    .banner {
        height: 225px;
        min-height: 180px;
        margin-top: 12px;
    }
}

/* Mobile/Tablet (768px) */
@media (max-width: 768px) {
    .carrosel-container {
        padding-top: 8px;
    }
    
    .carrosel-linha img {
        margin-right: 20px;
        width: 100%;
        height: 80px;
        object-fit: cover;
    }
    
    .banner {
        height: 195px;
        min-height: 160px;
        margin-top: 10px;
    }
    
    .indicators {
        display: none;
    }
    
    .beneficios {
        padding: 25px 12px;
        gap: 15px;
        justify-content: center;
        max-width: 600px;
        margin: 10px auto;
    }
    
    .item {
        flex: 1 1 calc(50% - 15px);
        max-width: calc(50% - 15px);
        min-width: 140px;
        padding: 18px 8px;
    }
    
    .item img {
        width: 44px;
        height: 44px;
    }
    
    .item img[src*="caminhao"] {
        transform: scale(1.6);
    }
    
    .texto {
        font-size: 0.85rem;
    }
}

/* Mobile médio (480px - 650px) */
@media (max-width: 650px) {
    .carrosel-linha img {
        width: 100%;
        height: 70px;
        object-fit: cover;
        margin-right: 18px;
    }
    
    .banner {
        height: 160px;
        min-height: 130px;
        margin-top: 8px;
    }
    
    .indicators {
        display: none;
    }
    
    .indicator {
        width: 7px;
        height: 7px;
    }
    
    .beneficios {
        padding: 20px 10px;
        gap: 12px;
        max-width: 500px;
    }
    
    .item {
        flex: 1 1 calc(50% - 12px);
        max-width: calc(50% - 12px);
        min-width: 120px;
        padding: 15px 6px;
    }
    
    .item img {
        width: 38px;
        height: 38px;
        margin-bottom: 12px;
    }
    
    .item img[src*="caminhao"] {
        transform: scale(1.4);
    }
    
    .texto {
        font-size: 0.75rem;
        line-height: 1.3;
    }
}

/* Mobile pequeno (320px - 480px) */
@media (max-width: 480px) {
    .carrosel-container {
        padding-top: 5px;
    }
    
    .carrosel-linha img {
        margin-right: 15px;
        width: 100%;
        height: 60px;
        object-fit: cover;
    }
    
    .carrosel-movimento {
        animation: deslizar-linha 100s linear infinite;
    }
    
    .carrosel-movimento2 {
        animation: deslizar-linha2 80s linear infinite;
    }
    
    .banner {
        height: 140px;
        min-height: 115px;
        margin-top: 8px;
    }
    
    .nav {
        font-size: 1.8rem;
        width: 48px;
        height: 48px;
        padding: 6px;
    }
    
    .left {
        left: 8px;
        color: #4db377;
    }
    
    .left:hover {
        color: #3d8f5e;
    }
    
    .right {
        right: 8px;
        color: #6bb5d1;
    }
    
    .right:hover {
        color: #5496b3;
    }
    
    .indicators {
        display: none;
    }
    
    .indicator {
        width: 6px;
        height: 6px;
    }
    
    .beneficios {
        padding: 15px 8px;
        gap: 10px;
        max-width: 400px;
    }
    
    .item {
        flex: 1 1 calc(50% - 10px);
        max-width: calc(50% - 10px);
        min-width: 100px;
        padding: 12px 4px;
    }
    
    .item img {
        width: 32px;
        height: 32px;
        margin-bottom: 10px;
    }
    
    .item img[src*="caminhao"] {
        transform: scale(1.2);
    }
    
    .texto {
        font-size: 0.7rem;
        line-height: 1.2;
    }
}

/* Mobile muito pequeno (<320px) */
@media (max-width: 320px) {
    .carrosel-linha img {
        width: 100%;
        height: 55px;
        object-fit: cover;
        margin-right: 12px;
    }
    
    .banner {
        height: 130px;
        min-height: 105px;
        margin-top: 6px;
    }
    
    .nav {
        font-size: 1.4rem;
        width: 42px;
        height: 42px;
        padding: 4px;
    }
    
    .left {
        left: 5px;
        color: #4db377;
    }
    
    .left:hover {
        color: #3d8f5e;
    }
    
    .right {
        right: 5px;
        color: #6bb5d1;
    }
    
    .right:hover {
        color: #5496b3;
    }
    
    .indicators {
        display: none;
    }
    
    .indicator {
        width: 5px;
        height: 5px;
    }
}
</style>
