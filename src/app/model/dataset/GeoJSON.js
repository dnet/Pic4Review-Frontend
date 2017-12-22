import Dataset from '../Dataset';
import Feature from '../Feature';

/**
 * A GeoJSON {@link Dataset} is a set of features read from a GeoJSON string.
 * This kind of dataset is not dynamic.
 * 
 * @name GeoJSONDataset
 * @param {string} geojson The GeoJSON data representation (must be a FeatureCollection)
 */
class GeoJSON extends Dataset {
	constructor(geojson) {
		super();
		
		if(typeof geojson !== "string" || geojson.length === 0) {
			throw new TypeError("You should provide a valid GeoJSON string");
		}
		
		const g = JSON.parse(geojson);
		
		if(g.type !== "FeatureCollection") {
			throw new TypeError("This object is not a GeoJSON FeatureCollection");
		}
		else if(g.features.length === 0) {
			throw new TypeError("The FeatureCollection should contain at least one feature");
		}
		else {
			for(const i in g.features) {
				const f = g.features[i];
				
				if(f.type !== "Feature" || f.geometry.type !== "Point") {
					throw new TypeError("FeatureCollection must contain only Point-based features");
				}
				
				this.features.push(new Feature(
					i,
					[ f.geometry.coordinates[1], f.geometry.coordinates[0] ],
					f.properties
				));
			}
		}
	}
	
	/**
	 * Implementation of {@link Dataset#getNextFeature}
	 * @memberof GeoJSONDataset
	 * @instance
	 */
	getNextFeature(radius) {
		radius = radius || this._getDefaultRadius();
		
		let nextFid = -1;
		let f = null;
		this.lastFeatureId = this.currentFeatureId;
		
		//Check status
		for(let i in this.features) {
			f = this.features[i];
			
			if(f.status === "new") {
				nextFid = i;
				break;
			}
		}
		
		//Check pictures
		if(nextFid !== -1) {
			return f.getPictures(radius)
			.then(pics => {
				if(pics.length > 0) {
					this.currentFeatureId = nextFid;
					return f;
				}
				else {
					f.status = "nopics";
					return this.getNextFeature(radius);
				}
			});
		}
		//No features to review
		else {
			return new Promise(resolve => { resolve(null); });
		}
	}
	
	/**
	 * Implementation of {@link Dataset#getProgress}
	 * @memberof GeoJSONDataset
	 * @instance
	 */
	getProgress() {
		return this._getProgressNotDynamic();
	}
	
	/**
	 * Implementation of {@link Dataset#isDynamic}
	 * @memberof GeoJSONDataset
	 * @instance
	 */
	isDynamic() {
		return false;
	}
	
	/**
	 * Implementation of {@link Dataset#updateCurrentFeature}
	 * @memberof GeoJSONDataset
	 * @instance
	 */
	updateCurrentFeature(status, seenOnPictures) {
		return this._updateCurrentFeatureNotDynamic(status, seenOnPictures);
	}
}

export default GeoJSON;
