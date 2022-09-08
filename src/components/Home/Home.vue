<template>
    <div id="home">
        <systeminfo ref="systeminfo"></systeminfo>
    </div>
</template>

<script setup>
    import { onMounted } from 'vue'
    import systeminfo from '../SystemInfo/SystemInfo.vue';
    import systemperformace from '../SystemInfo/Handler/CalculateFPS';

    
    onMounted(() => {
        systemperformace.showFPS();
    })
    
</script>

<style scoped>

</style>