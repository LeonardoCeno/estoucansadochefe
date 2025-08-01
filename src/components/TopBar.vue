<template>
    <div class="top-bar">
        <div class="top-bar-links">
            <router-link to="/" class="top-link">Home</router-link>
            <router-link to="/dados" class="top-link">Painel</router-link>
            <router-link to="/pedidos" class="top-link">Meus Pedidos</router-link>
        </div>
    </div>
</template>

<script setup>
// Componente reutilizável da top-bar
</script>

<style scoped>
.top-bar {
    background: #ffffff;
    padding: 8px 0;
    border-bottom: 1px solid #02060af5;
}

.top-bar-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;
}

.top-link {
    color: #02060af5;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s ease;
    font-family: helvetica;
}

.top-link:hover {
    color: #079ac7;
}

.top-link.router-link-active {
    color: #079ac7;
    font-weight: 600;
}

/* Responsividade */
@media (max-width: 550px) {
    .top-bar-links {
        gap: 20px;
        padding: 0 15px;
    }
    
    .top-link {
        font-size: 12px;
    }
}

@media (max-width: 768px) {
    .top-bar-links {
        gap: 25px;
    }
    
    .top-link {
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .top-bar-links {
        gap: 15px;
        padding: 0 10px;
    }
    
    .top-link {
        font-size: 12px;
    }
}

@media (max-width: 320px) {
    .top-bar-links {
        gap: 10px;
        padding: 0 5px;
    }
    
    .top-link {
        font-size: 11px;
    }
}
</style> 