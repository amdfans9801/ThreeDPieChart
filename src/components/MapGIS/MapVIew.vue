<template>
	<div id="mapcontainer"></div>
</template>

<script setup>
import cesiumViewer from './handler/CesiumViewer';
import { onMounted, ref } from 'vue';
import Cesium3DTile from 'cesium/Source/Scene/Cesium3DTile';

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

// 用作水面特效的一个水库范围
const degreesArray = ref([118.72871652464364, 31.86888930098833, 118.7257511634268, 31.86656309237849, 118.72470279539272, 31.86656306537887, 118.72515222952828, 31.86336778920539, 118.72647014429029, 31.862779892443623, 118.72697934441146, 31.861629591702606, 118.72922571034178, 31.860811610226715, 118.73135229445575, 31.862575392952653, 118.73204129127751, 31.865463911442923, 118.72928564411214, 31.867764555573043, 118.72880638652299, 31.86886373785308]);

onMounted(() => {
	cesiumViewer.initCesium('mapcontainer');
	// cesiumViewer.showSkybox();
	//setGltf();
	//cesiumViewer.setWaterParticle(position.value, direction.value);
	// window.viewer.camera.flyTo({
	// 	destination: new Cesium.Cartesian3.fromDegrees(118.75430299131544, 31.864428697664103, 50),
	// 	orientation: {
	// 		heading: 0.3692492396944562,
	// 		pitch: -0.49250655575499724,
	// 		roll: 1.0521417070918915e-7,
	// 	},
	// 	// duration: 0.5,
	// });

	window.viewer.camera.flyTo({
		destination: new Cesium.Cartesian3.fromDegrees(118.7286257924172, 31.864404015122627, 5000),
	});

	cesiumViewer.waterflows(degreesArray.value);
});

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
