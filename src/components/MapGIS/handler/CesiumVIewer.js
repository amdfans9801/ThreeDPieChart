/**
 * date 2022.09.24 这里打算用npm安装的纯cesium来做
 */

import { viewerPerformanceWatchdogMixin } from "cesium";
import { notificationEmits } from "element-plus";
import { getGisBlue } from './LoadImageryProvider';


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
		Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Move, movement);
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
		Bus.VM.$emit(Bus.SignalType.Scene_Left_Down, movement);
	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
	//鼠标左键抬起
	viewer.screenSpaceEventHandler.setInputAction(function (movement) {
		Bus.VM.$emit(Bus.SignalType.Scene_Left_Up, movement);
	}, Cesium.ScreenSpaceEventType.LEFT_UP);
	viewer.scene.camera.changed.addEventListener(function () {
		Bus.VM.$emit("Scene_Camera_Changed");
	});
	Bus.VM.$emit(Bus.SignalType.Scene_Init_Finish, viewer);
}






export default{
    initCesium
}