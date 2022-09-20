<template>
    <div id="mainview">
        <div id="chartContainer">
            <div id="threedpiechartdom"></div>
        </div>
        
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import threedpiechart from '../ThreeDPieChart/handler/threedpiechart';

    const piechartdom = document.getElementById('threedpiechartdom');
    const mychart = echarts.init(piechartdom); 
    

    onMounted(() => {
        threedpiechart.get3DPieOption();
    });

    function setChartData(){
        chartOption
    }
</script>

<style scoped>
    @import url(./css/mainview.css);
</style>