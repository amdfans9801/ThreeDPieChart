<template>
    <div id="home">
        <systeminfo></systeminfo>
    </div>
</template>

<script setup>
    import { onMounted } from 'vue'
    import systeminfo from '../SystemInfo/SystemInfo.vue';
    import systemperformace from '../SystemInfo/Handler/CalculateFPS';

    
    onMounted(() => {
        //systemperformace.showFPS();
        systemperformace.calculateFPS();
    })
    
</script>

<style scoped>

</style>