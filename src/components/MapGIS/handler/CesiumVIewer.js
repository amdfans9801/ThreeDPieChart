/**
 * date 2022.09.24 这里打算用npm安装的纯cesium来做
 */


/**
 * 初始化地图
 */
function initCesium(){
    const cesiumContainer = document.createElement('div');
    let homecontainer = document.getElementById('home');
    cesiumContainer.id = 'cesiumContainer';
    homecontainer.appendChild(cesiumContainer);
    const viewer = new Cesium.Viewer('cesiumContainer');
}



export default{
    initCesium
}