/**
 * 只是把常用的一些setEntities，removeEntities，坐标点转换等方法移动到此处方便调用
 */

 import coordinates from './Coordinates';

 
//屏幕坐标点转换成wgs84经纬度
 function GetPickedRayPositionWGS84(pos) {
    viewer = viewer||this.viewer;
    var ray = viewer.camera.getPickRay(pos);
    // var x = Cesium.Math.toDegrees(ray.direction.x);
    // var y = Cesium.Math.toDegrees(ray.direction.y);
    // var z = Cesium.Math.toDegrees(ray.direction.z);
    var position = viewer.scene.globe.pick(ray, viewer.scene);
    //var position = this.viewer.camera.pickEllipsoid(pos, this.viewer.scene.globe.ellipsoid);
    var cartesian = viewer.scene.pickPosition(pos);
    if (cartesian) {
        return coordinates.CoordinateWGS84.fromCatesianWithCartographic(cartesian);
    }
    else if (position) {
        return coordinates.CoordinateWGS84.fromCatesian(position);
    }
    return null;
}

function SetEntity(entity, viewer) {
    viewer = viewer || this.viewer;
    let entityori = viewer.entities.getById(entity.id);
    if (entityori) {
        viewer.entities.remove(entityori);
    }
    return viewer.entities.add(entity);
}

function RemoveEntities(containentityid, viewer){
    viewer = viewer || this.viewer;
    let removeentityids = [];
    viewer.entities.values.forEach(entity=>{
        if(entity.id.indexOf(containentityid)!=-1)
            removeentityids.push(entity.id);
    })
    removeentityids.forEach(eid=>{
        viewer.entities.removeById(eid);
    })
}


export default{
    GetPickedRayPositionWGS84, SetEntity, RemoveEntities
}

