<template>
    <nav class="navbar navbar-expand-lg bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand text-white" href="#">Solar Eye</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item margin">
                        <RouterLink class="nav-link item text-muted" to="/mapa">Mapa</RouterLink>
                    </li>
                    <li class="nav-item margin">
                        <RouterLink class="nav-link item text-muted" to="/reportes">Reportes</RouterLink>
                    </li>
                </ul>
            </div>
            </div>
        </div>
</nav>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>