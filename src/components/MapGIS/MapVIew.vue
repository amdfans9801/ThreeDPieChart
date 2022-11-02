<template>
	<div id="mapcontainer"></div>
</template>

<script setup>
import cesiumViewer from './handler/CesiumViewer';
import { onMounted, ref } from 'vue';

onMounted(() => {
    cesiumViewer.initCesium('mapcontainer');
    cesiumViewer.showSkybox();
});

function setWaterEffect(){

}

</script>

<style scoped>
#mapcontainer {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
