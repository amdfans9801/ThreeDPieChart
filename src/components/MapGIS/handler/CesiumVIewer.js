/**
 * date 2022.09.24 这里打算用npm安装的纯cesium来做
 */


/**
 * 初始化地图
 */
function initCesium(container){
    const cesiumContainer = document.createElement('div');
    let mapcontainer = document.getElementById(container);
    cesiumContainer.id = 'cesiumContainer';
    mapcontainer.appendChild(cesiumContainer);
    const viewer = new Cesium.Viewer('cesiumContainer');
}



export default{
    initCesium
}