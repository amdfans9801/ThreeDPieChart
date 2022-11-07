/**
 * date 2022.09.24 这里打算用npm安装的纯cesium来做
 */

import { viewerPerformanceWatchdogMixin } from "cesium";
import { notificationEmits } from "element-plus";
import { getGisBlue } from './LoadImageryProvider';
import Bus from '@/bus/buses';
import drawentities from './DarwEntities';

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

	//事件
	let wheelState = false;
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
		Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Left_Click, movement);
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

	let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
	handler.setInputAction(function (movement) {
		let cartesian = viewer.scene.pickPosition(movement.position);
		if (cartesian) {
			let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
			let lon = Cesium.Math.toDegrees(cartographic.longitude);
			let lat = Cesium.Math.toDegrees(cartographic.latitude);
			let height = cartographic.height;
			let extent = getExtent(viewer);
			let padding = [0, 0, 0, 0];
			let topOffset = degreeToMeter(extent[3] - lat);
			let rightOffset = degreeToMeter(extent[2] - lon);
			let bottomOffset = degreeToMeter(lat - extent[1]);
			let leftOffset = degreeToMeter(lon - extent[0]);
			padding = [topOffset, rightOffset, bottomOffset, leftOffset];
			console.log("点击的经纬度坐标为:" + lon + "," + lat + " 海拔高度:" + height + "m");
			// console.log(`当前相机位置为：x=${viewer.camera.position.x},y=${viewer.camera.position.y},z=${viewer.camera.position.z}, heading=${viewer.camera.heading},pitch=${viewer.camera.pitch}`);
			// console.log("当前视域范围:" + extent);
			// console.log("偏移:" + padding);
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	window.viewer = viewer;
	return viewer;
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

// threejs的水面效果
function waterflows(degreesArray){
	const _polygonHierarchy = new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(degreesArray));
	let _primitivecollection = new Cesium.PrimitiveCollection();
	const extrudedPolygon = new Cesium.PolygonGeometry({
		polygonHierarchy: _polygonHierarchy,
		extrudedHeight: 50,
		height: 50,
	});

	const _geoInstance = new Cesium.GeometryInstance({
		geometry: extrudedPolygon,
		id: 'waterflows',
	});
	
	const _material = new Cesium.Material({
		fabric: {
			type: 'Color',
			uniforms: {
				color: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0).withAlpha(0.618),
			},
		}
	});

	const _appearance = new Cesium.MaterialAppearance({
		material: _material
	});

	let _entity = {
		id: "geo_polygons",
		polygon: {
			hierarchy: _polygonHierarchy,
			material: new Cesium.Color(0, 0, 0, 0),
			outline: true,
			height: 50,  // height is required for outline to display
			outlineColor: new Cesium.Color(0.145, 0.906, 0.996),    //#25e7fe
			outlineWidth: 3,
		}
	}
	window.viewer.entities.add(_entity);
	
	_primitivecollection.add(new Cesium.Primitive({
		geometoryInstance: _geoInstance,
		appearance: _appearance,
		show: true,
	}));

	window.viewer.scene.primitives.add(_primitivecollection);
	// const vs = _appearance.vertexShaderSource;
	// const fs = _appearance.fragmentShaderSource;
	// const fs2 = _appearance.getFragmentShaderSource();
	// console.log(`// 顶点着色器：
	// ${vs}`);
	// console.log(`// 片元着色器：
	// ${fs}`);
	// console.log(`// 片元着色器2：
	// ${fs2}`);

}

 //加一个gltf模型测试一下着色器材质
function addGLTFModel(id, url, position){
	drawentities.SetEntity({
		id: id,
		position: Cesium.Cartesian3.fromDegrees(position.position_x, position.position_y, position.position_z),
		model: {
			uri: '../../../../model/watertap.gltf',
			scale: 10,
		}
	}, window.viewer);
}

// 添加水流的粒子特效
function setWaterParticle(position){
	let _position = Cesium.Cartesian3.fromDegrees(position.position_x, position.position_y, position.position_z)
	let hole = window.viewer.entities.add({ position: _position});
	let waterparticle = new Cesium.ParticleSystem({
		image: '../../../../img/cesium/smoke.png',
		startColor: new Cesium.Color(35/255, 168/255, 242/255, 0.7),
		endColor: new Cesium.Color(35/255, 168/255, 242/255, 0.1),
		startScale: 1,
		endScale: 1,
		minimumParticleLife: 3,		//粒子寿命的可能持续时间的最小界限（以秒为单位），超过该界限，将随机选择粒子的实际寿命
		maximumParticleLife: 6,
		minimumSpeed: 1,				//设置将随机选择粒子的实际速度的最小界限（米/秒）
		maximumSpeed: 1,
		imageSize: new Cesium.Cartesian2(6, 6),		//以像素为单位缩放粒子图像尺寸
		emissionRate: 100,			//每秒要发射的粒子数
		lifetime: 16.0,				//粒子系统发射粒子的时间（秒）
		speed: 1.0,
		emitter: new Cesium.CircleEmitter(0.5),		//此系统的粒子发射器的发射范围
		//emitter: new Cesium.BoxEmitter(new Cesium.Cartesian3(0,1.2,6)),	
		//emitter: new Cesium.ConeEmitter(90),
		// modelMatrix: computeModelMatrix(hole),			//将粒子系统从模型变换为世界坐标的4x4变换矩阵
		emitterModelMatrix: computeEmitterModelMatrix(),		//4x4变换矩阵，用于在粒子系统粒子发射器的朝向角度
    	// emitterModelMatrix: computeEmitterModelMatrix(),
		//updateCallback: callback,
	});
	viewer.scene.preUpdate.addEventListener(function (scene, time) {
		waterparticle.modelMatrix = computeModelMatrix(hole, time);
		//waterparticle.emitterModelMatrix = computeEmitterModelMatrix();
	});
	window.viewer.scene.primitives.add(waterparticle);
}

function computeModelMatrix(entity, time) {
	return entity.computeModelMatrix(time, new Cesium.Matrix4());
}

//用来设置该粒子系统的位置
// function computeModelMatrix(entity, time){
// 	var position = Cesium.Property.getValueOrUndefined(entity.position, time);
// 	let modelMartrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
// 	return modelMartrix;
// }

//控制粒子系统中粒子发射器的朝向角度
function computeEmitterModelMatrix(){
	const trs = new Cesium.TranslationRotationScale();
	const rotation = new Cesium.Quaternion();
	const emitterModelMatrix = new Cesium.Matrix4();
	const hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 180, 0);
	trs.translation = Cesium.Cartesian3.fromElements(1.5, -1.5, 1.2);
	trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);
	return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
}




function getExtent(viewer) {
	let rectangle = viewer.camera.computeViewRectangle();
	let extent = [
		Cesium.Math.toDegrees(rectangle.west),
		Cesium.Math.toDegrees(rectangle.south),
		Cesium.Math.toDegrees(rectangle.east),
		Cesium.Math.toDegrees(rectangle.north),
	];
	return extent;
}

/**
 * @Author: dongnan
 * @Description: 经纬度转米(EPSG:4326)
 * @Date: 2022-01-04 13:54:05
 * @param {*} degree
 */
function degreeToMeter(degree) {
	let meter = (degree / 360) * (2 * Math.PI * 6371004);
	return meter;
}




export default{
    initCesium, showSkybox, addGLTFModel, setWaterParticle, waterflows
}