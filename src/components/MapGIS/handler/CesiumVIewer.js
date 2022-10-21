/**
 * date 2022.09.24 这里打算用npm安装的纯cesium来做
 */

import { notificationEmits } from "element-plus";


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
        
        
    });

    viewer.scene.postProcessStages.fxaa.enabled = false;    //去除锯齿 新版本
    viewer.scene.globe.depthTestAgainstTerrain = true;      //开启深度测试功能

    // viewer.creditContainer.destroy();

}





export default{
    initCesium
}