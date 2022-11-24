/**
 * 这里打算把threejs里面的透明加反射效果的水面特效搞过来
 * 
 */

// threejs的水面效果
function waterflows(degreesArray){
	const _polygonHierarchy =  new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(degreesArray))
	const extrudedPolygon = new Cesium.PolygonGeometry({
		polygonHierarchy : _polygonHierarchy,
		extrudedHeight: 500,
		height: 500
	});
	
	const _instance = new Cesium.GeometryInstance({
		geometry: extrudedPolygon,

		id: 'box with height'
	});
	
	const _material = new Cesium.Material({
		fabric: {
			uniforms: {
				color: 'vec3(1.0,1.0,0.0)',
				alpha: 1.0,
				t: 0.0
			},
			source:
			`czm_material czm_getMaterial(czm_materialInput materialInput)
			{
				czm_material material = czm_getDefaultMaterial(materialInput);
                material.diffuse = vec3(1.0, 0.0329, 0.502);
				// material.alpha = mod(1.0 - materialInput.st.s + t, 1.0);
				material.alpha = fract(1.0 - materialInput.st.s + t);

				//material.specular = 1.0;
				//material.shininess = 0.8;
				return material;
			}`,
		}
	});
	
	const _appearance =  new Cesium.MaterialAppearance({
		material : _material,
	});
	
	var p = window.viewer.scene.primitives.add(new Cesium.Primitive({
		geometryInstances: _instance,
		appearance: _appearance,
		releaseGeometryInstances: false,
		compressVertices: false,
	}));

	let _entity = {
		id: "geo_polygons",
		polygon: {
			hierarchy: _polygonHierarchy,
			//material: new Cesium.Color(0, 0, 0, 0),
			outline: true,
			height: 10,  // height is required for outline to display
			outlineColor: new Cesium.Color(0.145, 0.906, 0.996),    //#25e7fe
			outlineWidth: 3,
		}
	};
	//window.viewer.entities.add(_entity);

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


export default {
    waterflows
}