/**
 * date 2022.09.24 这里打算用npm安装的纯cesium来做
 */

import { viewerPerformanceWatchdogMixin } from "cesium";
import { notificationEmits } from "element-plus";
import { getGisBlue } from './LoadImageryProvider';
import Bus from '@/bus/buses';

/**
 * 初始化地图
 */
function initCesium(container){
    const cesiumContainer = document.createElement('div');
    let mapcontainer = document.getElementById(container);
    cesiumContainer.id = 'cesiumContainer';
    mapcontainer.appendChild(cesiumContainer);
    const viewer = new Cesium.Viewer('cesiumContainer', {
        animation: false,       //是否显示动画控件
        shouldAnimate: true,
        homeButton: false,
        timeline: false,        //是否显示时间线控件
        showRenderLoopErrors: true,     //如果设置为true，发生渲染循环错误时，将自动给用户显示一个包含错误信息的HTML面板。
        navigation: false,      //是否显示导航罗盘控件
        navigationHelpButton: false,    //是否显示帮助信息控件
        navigationInstructionsInitiallyVisible: false,      //底部的文字介绍
        blurActiveElementOnCanvasFocus: false,
        scene3DOnly: false,     //每个几何实例将只能以3D渲染以节省GPU内存
        timeline: false,        //是否显示时间线控件
        fullscreenButton: false,        //是否显示全屏按钮
        geocoder: false,        //是否显示地名查找控件
        sceneMode: 3,       //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  new Cesium.SceneMode
        infoBox: false,     //是否显示点击要素之后显示的信息
        sceneModePicker: false,     //是否显示投影方式控件
        baseLayerPicker: false,     //是否显示图层选择控件
        fullscreenElement: document.body,       //全屏时渲染的HTML元素 暂时没发现用处
        shadows: true,
        
        orderIndependentTranslucency: false,    //去掉地球表面的大气效果的黑圈
		contextOptions: {           //传递给Scene对象的上下文参数（scene.options）   
			webgl: {
				alpha: true,
				reserveDrawingBuffer: true,
				useDefaultRenderLoop: false,
			},
		},
        imageryProvider: new Cesium.SingleTileImageryProvider({
			url: require("../../../../public/img/cesium/globe.png"),
		}),
        
    });

    viewer.scene.postProcessStages.fxaa.enabled = false;    //去除锯齿 新版本
    viewer.scene.globe.depthTestAgainstTerrain = true;      //开启深度测试功能

    // viewer.creditContainer.destroy();

    // 添加底图
    viewer.layers = [];
    let imageryList = [getGisBlue()];
    if (Array.isArray(imageryList) && imageryList.length > 0) {
		viewer.imageryLayers.removeAll();
		imageryList.some((item) => {
			let layer = viewer.imageryLayers.addImageryProvider(item);
			viewer.imageryLayers.lowerToBottom(layer);
			viewer.layers.push(layer);
		});
	}

    //鼠标事件
    //注册鼠标滚轮按下MIDDLE_DOWN事件
	viewer.screenSpaceEventHandler.setInputAction(function () {
		wheelState = true; //激活指北针动态更新，只有在鼠标中键按下去时才会有效果
	}, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
	//注册鼠标滚轮松开MIDDLE_UP事件
	viewer.screenSpaceEventHandler.setInputAction(function () {
		wheelState = false; //取消指北针动态更新
	}, Cesium.ScreenSpaceEventType.RIGHT_UP);
	//注册鼠标左键双击事件
	viewer.screenSpaceEventHandler.setInputAction(function (movement) {
		//Bus.VM.$emit(Bus.SignalType.Scene_Mouse_DoubleLeft_Click, movement);
	}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	//注册鼠标左键单击事件
	viewer.screenSpaceEventHandler.setInputAction(function (movement) {
		// let position = that.viewer.scene.camera.pickEllipsoid(movement.position, that.viewer.scene.globe.ellipsoid);
		//Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Left_Click, movement);
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	//注册鼠标右键单击事件
	viewer.screenSpaceEventHandler.setInputAction(function (movement) {
		//Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Right_Click, movement);
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	//注册鼠标移动事件
	viewer.screenSpaceEventHandler.setInputAction(function (movement) {
		//Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Move, movement);
		if (wheelState) {
			//这里同步指北针用的
			let heading = Cesium.Math.toDegrees(viewer.camera.heading);
			//Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Middle_Move, heading);
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	//注册相机移动起始事件
	// viewer.camera.moveStart.addEventListener(function () {
	// 	//获取当前相机信息
	// 	let cameraAtt = that.getCamera();
	// 	// console.log(cameraAtt);
	// 	Bus.VM.$emit(Bus.SignalType.Scene_Camera_MoveStart, cameraAtt);
	// })
	//鼠标左键按下
	viewer.screenSpaceEventHandler.setInputAction(function (movement) {
		//Bus.VM.$emit(Bus.SignalType.Scene_Left_Down, movement);
	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
	//鼠标左键抬起
	viewer.screenSpaceEventHandler.setInputAction(function (movement) {
		//Bus.VM.$emit(Bus.SignalType.Scene_Left_Up, movement);
	}, Cesium.ScreenSpaceEventType.LEFT_UP);
	viewer.scene.camera.changed.addEventListener(function () {
		//Bus.VM.$emit("Scene_Camera_Changed");
	});
	//Bus.VM.$emit(Bus.SignalType.Scene_Init_Finish, viewer);
	viewer._cesiumWidget._creditContainer.style.display = "none"; //取消版权信息
}

function showSkybox(){
	var blueSkyBox = new Cesium.SkyBox({
		sources:{
			positiveX: require('../../../../public/img/cesium/skybox/morning/v1/right.png'),
			negativeX: require('../../../../public/img/cesium/skybox/morning/v1/left.png'),
			positiveY: require('../../../../public/img/cesium/skybox/morning/v1/back.png'),
			negativeY: require('../../../../public/img/cesium/skybox/morning/v1/front.png'),
			positiveZ: require('../../../../public/img/cesium/skybox/morning/v1/top.png'),
			negativeZ: require('../../../../public/img/cesium/skybox/morning/v1/bottom.png'),
		}
	});
	viewer.scene.skyAtmosphere.show = false;
	blueSkyBox.WSpeed = 1;
	blueSkyBox.show = true;
	viewer.scene.skyBox = blueSkyBox;
	//相机上升到一定位置,天空盒出现渐变效果
	viewer.scene.postRender.addEventListener(()=>{
		setSkyBoxGradient();
	});
}

// 设置天空盒的放大显现（渐变）效果（代码卸载方法里面，让mounted看起来简洁一点）
function setSkyBoxGradient(){
	var cameraHeight = scene.camera.positionCartographic.height;
	var skyAtmosphereH1 = 22e4; // 大气开始渐变的最大高度
	var skyBoxH1 = 15e4; // 天空开始渐变的最大高度
	var skyBoxH2 = 12e4; // 天空开始渐变的最小高度
	if (cameraHeight < skyAtmosphereH1 && Cesium.defined(viewer.scene.skyBox)){
		var skyAtmosphereT = (cameraHeight - skyBoxH2) / (skyAtmosphereH1 - skyBoxH2);
		if (skyAtmosphereT > 1.0) {
			skyAtmosphereT = 1.0;
		} else if (skyAtmosphereT < 0.0) {
			skyAtmosphereT = 0.0;
		}
		var skyBoxT = (cameraHeight - skyBoxH2) / (skyBoxH1 - skyBoxH2);
		if (skyBoxT > 1.0) {
			skyBoxT = 1.0;
		} else if (skyBoxT < 0.0) {
			skyBoxT = 0.0;
		}
		viewer.scene.skyBox.alpha = 1.0 - skyBoxT;
		if(cameraHeight > skyBoxH2){
			scene.skyAtmosphere.show = true;
			scene.skyAtmosphere.alpha = skyAtmosphereT;
		}else{
			scene.skyAtmosphere.show = false;
		}
	}else {
		scene.skyAtmosphere.alpha = 1.0;
	}
}

// 设置水面特效
function setWaterEffects(){
	let water = new Cesium.PrimitiveCollection();
	
	let polygonHierarchy = FeatureToPolygon(temp);
	let geoHierarchy = new Cesium.GeometryInstance({
		geometry: new Cesium.PolygonGeometry({
			polygonHierarchy: polygonHierarchy,
			extrudedHeight: 0,
			height: 1,
			vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
		}),
	});
	let waterappearance = new Cesium.EllipsoidSurfaceAppearance({
		material: new Cesium.Material({
			fabric: {
				type: "Water",
				uniforms: {
					baseWaterColor: new Cesium.Color(64/255.0, 157/255.0, 253/255.0, 0.5),
					normalMap: require('../../../../public/img/cesium/waterNormals.jpg'),
					frequency: 1000.0,
					animationSpeed: 0.05,
					amplitude: 10,
					specularIntensity: 10,
				},
			},
		}),
		aboveGround: true,
	});

	let _water = new Cesium.GroundPrimitive({
		geometryInstances: geoInstances,
		appearance: waterappearance,
		show: true,
	});

	water.add(_water);
}




export default{
    initCesium, showSkybox
}