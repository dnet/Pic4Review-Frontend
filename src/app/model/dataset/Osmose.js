import Dataset from '../Dataset';
import Feature from '../Feature';
import Hash from 'object-hash';
import Nominatim from 'nominatim-browser';
import OsmoseRequest from 'osmose-request';
import request from 'browser-request';

/**
 * An Osmose {@link Dataset} is a set of features retrieved from {@link http://osmose.openstreetmap.fr|Osmose API}.
 * Osmose is a system returning anomalies from OpenStreetMap database. It also supports open data merging with OSM.
 * This kind of dataset is dynamic.
 * 
 * @name OsmoseDataset
 * @param {int} itemId The Osmose item ID
 * @param {int} amount The amount of errors to review
 * @param {Object} [options] Options for data retrieval
 */
class Osmose extends Dataset {
	constructor(itemId, amount, options) {
		super();
		
		this.options = options || {};
		
		if(isNaN(parseInt(itemId))) {
			throw new TypeError("You should provide a valid item ID");
		}
		else if(isNaN(parseInt(amount)) || amount <= 1) {
			throw new TypeError("You should provide a valid amount (integer > 0)");
		}
		
		this.id = Hash(itemId);
		this.osmose = new OsmoseRequest();
		this.searchOptions = Object.assign({ item: itemId, limit: amount, status: "open", full: true }, this.options);
		this.features = null;
		
		//Handle geocoding
		if(this.options.area && this.options.area.trim().length > 0) {
			delete this.searchOptions.area;
			this.isGeocoding = true;
			Nominatim.geocode({
				q: this.options.area,
				limit: 1
			})
			.then(res => {
				if(res && res.length === 1) {
					this.searchOptions.bbox = res[0].boundingbox[2]+","+res[0].boundingbox[0]+","+res[0].boundingbox[3]+","+res[0].boundingbox[1];
				}
				else {
					console.warn("Invalid geocoding result:", res);
				}
			})
			.catch(e => {
				console.error(e);
			})
			.finally(() => {
				this.isGeocoding = false;
				this._loadData();
			});
		}
		else {
			this._loadData();
		}
	}
	
	/**
	 * Download data from Osmose API
	 * @memberof OsmoseDataset
	 * @instance
	 * @private
	 */
	_loadData() {
		this.isDownloading = true;
		
		this.osmose
		.fetchErrors(this.searchOptions)
		.then(result => {
			this.features = [];
			const ignoreProps = [ "lat", "lon", "item", "class", "level", "source", "elems", "subclass" ];
			
			for(const i in result) {
				const f = result[i];
				
				//Filter properties to only display what's useful
				const props = {};
				for(const k in f) {
					if(ignoreProps.indexOf(k) < 0) {
						props[k] = f[k];
					}
				}
				
				this.features.push(new Feature(f.error_id, [ parseFloat(f.lat), parseFloat(f.lon) ], props));
			}
			
			this.isDownloading = false;
		})
		.catch(e => {
			console.error(e);
			this.isDownloading = false;
		});
	}
	
	/**
	 * Implementation of {@link Dataset#getId}
	 * @memberof OsmoseDataset
	 * @instance
	 */
	getId() {
		return this.id;
	}
	
	/**
	 * Implementation of {@link Dataset#getNextFeature}
	 * @memberof OsmoseDataset
	 * @instance
	 */
	getNextFeature(radius) {
		radius = radius || this._getDefaultRadius();
		
		//Wait for data to be ready
		if(this.isGeocoding || this.isDownloading) {
			//Delay execution
			return (new Promise(resolve => {
				setTimeout(() => {
					resolve(this.getNextFeature(radius));
				}, 100);
			}));
		}
		//Look for feature
		else {
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
					if(pics && pics.length > 0) {
						this.currentFeatureId = nextFid;
						return f;
					}
					else {
						f.status = "nopics";
						if(PubSub) { PubSub.publish("DATASET.FEATURE.NOPICS"); }
						
						return this.getNextFeature(radius);
					}
				});
			}
			//No features to review
			else {
				return new Promise(resolve => { resolve(null); });
			}
		}
	}
	
	/**
	 * Implementation of {@link Dataset#getProgress}
	 * @memberof OsmoseDataset
	 * @instance
	 */
	getProgress() {
		return this._getProgressNotDynamic();
	}
	
	/**
	 * Implementation of {@link Dataset#isDynamic}
	 * @memberof OsmoseDataset
	 * @instance
	 */
	isDynamic() {
		return true;
	}
	
	/**
	 * Implementation of {@link Dataset#updateCurrentFeature}
	 * @memberof OsmoseDataset
	 * @instance
	 */
	updateCurrentFeature(status, seenOnPictures) {
		//Set error as fixed in Osmose
		if(status === "reviewed") {
			request('http://osmose.openstreetmap.fr/fr/api/0.2/error/'+this.features[this.currentFeatureId].properties.error_id+'/done', (error, response, body) => {
				if(error) {
					console.error(error);
				}
			});
		}
		
		return this._updateCurrentFeatureNotDynamic(status, seenOnPictures);
	}
}

export default Osmose;
