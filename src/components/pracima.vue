<template>
    <div v-if="visivel" class="colunas" >
    <button class="btn-topo" @click="voltarAoTopo">▲</button>
    <h1>TOP</h1>
    </div>
</template>

<script setup>
const props = defineProps({
    visivel: { type: Boolean, default: true }
})
function voltarAoTopo() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>

.colunas {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: 22px;
    top: 80%;
}

.colunas h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #222;
}

.btn-topo {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    background: #222;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
}

.btn-topo:hover {
    opacity: 1;
}


</style>
