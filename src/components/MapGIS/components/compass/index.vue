<script setup>
	import {ref,reactive,onMounted,defineProps} from "vue"
	import Bus from '@/buss/eventBus'
	import commonfuncs from '@/utils/cesium/commonfuncs'
	import coordinates from '@/utils/cesium/Coordinates'

	const props = defineProps({
		viewer: {
			type: Object,
			value: null,
		},
	});

	const northtin = ref(null);

	onMounted(() => {
		Bus.VM.$on(Bus.SignalType.Scene_Init_Finish,function (viewer) {
			viewer.scene.postRender.addEventListener(function () {
				// if(northtin.value==null) return;
				let scenemode = window.Fyviewer.scene.mode;
				if (scenemode == 3 || scenemode == 1) {
					let headingdeg = Cesium.Math.toDegrees(viewer.camera.heading);
					northtin.value.style.transform = "rotate(" + headingdeg + "deg)";
				}
			})

		})
	});
	//指北
	function northClick() {
		let camera = commonfuncs.GetCamera(window.Fyviewer);
		let wgs84poi = new coordinates.CoordinateWGS84(camera.longitude, camera.latitude, camera.height);
		let wgs84poinew = commonfuncs.GetPointOnSameCircle(wgs84poi, camera.heading, 0, camera.pitch);

		commonfuncs.FlyToWithDuration(wgs84poinew.latitude, wgs84poinew.longitude, camera.height, 0, camera.pitch, camera.roll, -1,window.Fyviewer);

	}

	//放大
	function zoomIn () {
		// window.Fyviewer.camera.zoomIn(5000);
		let Camera =commonfuncs.GetCamera(window.Fyviewer);
		if (Camera.height < 100000) {
			window.Fyviewer.camera.zoomIn(800);
		}
		else if (Camera.height > 100000 && Camera.height < 300000) {
			window.Fyviewer.camera.zoomIn(8000);
		} else {
			window.Fyviewer.camera.zoomIn(50000);
		}
	}

	//缩小
	function zoomOut () {
		window.Fyviewer.camera.zoomOut(50000);
	}

	//全屏
	function fullscreenClick() {
		if (!document.fullscreenElement &&
			!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
			} else if (document.documentElement.msRequestFullscreen) {
				document.documentElement.msRequestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}

	}
</script>
<template>
	<div>
		<div class="position-absolute northinButton">
			<img src="./assets/compass.svg" class="position-absolute" style="right: 0px" />
			<img
				src="./assets/northin.svg"
				ref="northtin"
				class="position-absolute"
				style="width: 34px; height: 34px; right: 0"
				@click="northClick"
			/>
		</div>

		<div class="position-absolute zoomInButton">
			<img src="./assets/zoomIn.svg" @click="zoomIn" />
		</div>

		<div class="position-absolute zoomOutButton">
			<img src="./assets/zoomOut.svg" @click="zoomOut" />
		</div>

		<div class="position-absolute fullscreenButton">
			<img src="./assets/fullscreen.svg" @click="fullscreenClick" />
		</div>
	</div>
</template>
<style lang="less" scoped>
	.northinButton {
		bottom: 196px;
		/*top:140px;*/
		/*right: 1vw;*/
		right:calc(24% + 48px);
		width: 34px;
		height: 34px;
		cursor: pointer;
	}

	.zoomInButton {
		bottom: 160px;
		/*right: 1vw;*/
		right:calc(24% + 48px);
	    /*top:176px;*/
		width: 34px;
		height: 34px;
		cursor: pointer;
	}

	.zoomOutButton {
		bottom: 124px;
		/*right: 1vw;*/
		right:calc(24% + 48px);
		/*top:212px;*/
		width: 34px;
		height: 34px;
		cursor: pointer;
	}

	.fullscreenButton {
		bottom: 88px;
		/*right: 1vw;*/
		right:calc(24% + 48px);
		/*top:248px;*/
		width: 34px;
		height: 34px;
		cursor: pointer;
	}
</style>
