<template>
    <div id="home">
        <!-- <systeminfo ref="systeminfo"></systeminfo> -->
        <mapview ref="mapview"></mapview>
        <mainview ref="mainview"></mainview>
    </div>
</template>

<script setup>
    import { onMounted } from 'vue'
    import systeminfo from '../SystemInfo/SystemInfo.vue';
    import systemperformace from '../SystemInfo/Handler/CalculateFPS';
    import mapview from '../MapGIS/MapView';
    import mainview from './MainView.vue';
    
    onMounted(() => {
        systemperformace.showFPS();
    })
    
</script>

<style scoped>

</style>