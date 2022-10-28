import Mapbox from "@/utils/cesium/libs/mapbox-gl";
import {
	WebMercatorTilingScheme,
	Event,
	Credit,
	DefaultProxy,
	Math as CesiumMath,
} from "cesium";
/**
 * @Author: dongnan
 * @Description: 加载mapbox样式的矢量切片地图
 * @Date: 2021-10-10 17:17:08
 */
class MVTImageryProvider {
	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.style - mapbox style object
	 * @param {Function} [options.sourceFilter] - sourceFilter is used to filter which source participate in pickFeature process.
	 * @param {Number} [options.maximumLevel] - if cesium zoom level exceeds maximumLevel, layer will be invisible.
	 * @param {Number} [options.minimumLevel] - if cesium zoom level belows minimumLevel, layer will be invisible.
	 * @param {Number} [options.tileSize=512] - can be 256 or 512.
	 * @param {Boolean} [options.hasAlphaChannel] -
	 * @param {String} [options.credit] -
	 *
	 */
	constructor(options) {
		this.mapboxRenderer = new Mapbox.BasicRenderer({
			style: options.style,
		});
		this.ready = false;
		this.readyPromise = this.mapboxRenderer._style.loadedPromise.then(
			() => (this.ready = true),
		);
		this.tilingScheme = new WebMercatorTilingScheme();
		this.rectangle = this.tilingScheme.rectangle;
		this.tileSize =
			this.tileWidth =
			this.tileHeight =
				options.tileSize || 512;
		this.maximumLevel = options.maximumLevel || Number.MAX_SAFE_INTEGER;
		this.minimumLevel = options.minimumLevel || 0;
		this.tileDiscardPolicy = undefined;
		this.errorEvent = new Event();
		this.credit = new Credit(options.credit || "", false);
		this.proxy = new DefaultProxy("");
		this.hasAlphaChannel =
			options.hasAlphaChannel !== undefined
				? options.hasAlphaChannel
				: true;
		this.sourceFilter = options.sourceFilter;
	}

	getTileCredits(x, y, level) {
		return [];
	}

	createTile() {
		let canv = document.createElement("canvas");
		canv.width = this.tileSize;
		canv.height = this.tileSize;
		canv.style.imageRendering = "pixelated";
		canv.getContext("2d").globalCompositeOperation = "copy";
		return canv;
	}

	requestImage(x, y, zoom, releaseTile = true) {
		if (zoom > this.maximumLevel || zoom < this.minimumLevel)
			return Promise.reject(undefined);

		this.mapboxRenderer.filterForZoom(zoom);
		const tilesSpec = [];
		this.mapboxRenderer.getVisibleSources().forEach((s) => {
			tilesSpec.push({
				source: s,
				z: zoom,
				x: x,
				y: y,
				left: 0,
				top: 0,
				size: this.tileSize,
			});
		});

		return new Promise((resolve, reject) => {
			let canv = this.createTile();
			const renderRef = this.mapboxRenderer.renderTiles(
				canv.getContext("2d"),
				{
					srcLeft: 0,
					srcTop: 0,
					width: this.tileSize,
					height: this.tileSize,
					destLeft: 0,
					destTop: 0,
				},
				tilesSpec,
				(err) => {
					if (!!err) {
						switch (err) {
							case "canceled":
							case "fully-canceled":
								reject(undefined);
								break;
							default:
								reject(undefined);
						}
					} else {
						if (releaseTile) {
							renderRef.consumer.ctx = undefined;
							resolve(canv);
							// releaseTile默认为true，对应Cesium请求图像的情形
							this.mapboxRenderer.releaseRender(renderRef);
						} else {
							// releaseTile为false时在由pickFeature手动调用，在渲染完成之后在pickFeature里边手动释放tile
							resolve(renderRef);
						}
					}
				},
			);
		});
	}

	pickFeatures(x, y, zoom, longitude, latitude) {
		return this.requestImage(x, y, zoom, false).then((renderRef) => {
			let targetSources = this.mapboxRenderer.getVisibleSources();
			targetSources = this.sourceFilter
				? this.sourceFilter(targetSources)
				: targetSources;

			const queryResult = [];

			longitude = CesiumMath.toDegrees(longitude);
			latitude = CesiumMath.toDegrees(latitude);

			targetSources.forEach((s) => {
				queryResult.push({
					data: this.mapboxRenderer.queryRenderedFeatures({
						source: s,
						renderedZoom: zoom,
						lng: longitude,
						lat: latitude,
						tileZ: zoom,
					}),
				});
			});

			// release tile
			renderRef.consumer.ctx = undefined;
			this.mapboxRenderer.releaseRender(renderRef);
			return queryResult;
		});
	}
}
export default MVTImageryProvider;
