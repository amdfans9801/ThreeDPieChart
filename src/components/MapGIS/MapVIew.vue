<template>
	<div id="mapcontainer"></div>
</template>

<script setup>
import cesiumViewer from './handler/CesiumViewer';
import { onMounted, ref } from 'vue';

// const viewer = ref(null);
const position = ref({
	position_x: 118.75473545826067,
	position_y: 31.865336113517007,
	position_z: 10,
});
const direction = ref({
	heading: 10,
	pitch: 0,
	roll: 0,
});
onMounted(() => {
	cesiumViewer.initCesium('mapcontainer');
	// cesiumViewer.showSkybox();
	setGltf();
	cesiumViewer.setWaterParticle(position.value, direction.value);
	window.viewer.camera.flyTo({
		destination: new Cesium.Cartesian3.fromDegrees(118.75430299131544, 31.864428697664103, 50),
		orientation: {
			heading: 0.3692492396944562,
			pitch: -0.49250655575499724,
			roll: 1.0521417070918915e-7,
		},
		// duration: 0.5,
	});
});

function setWaterEffect() {}

function setGltf() {
	let gltfurl = '../../../../model/watertap.gltf';
	cesiumViewer.addGLTFModel('watertap', gltfurl, position.value);
}
</script>

<style scoped>
#mapcontainer {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
