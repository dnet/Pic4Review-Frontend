import Hash from 'object-hash';
import P4C from 'pic4carto';

const STATUSES = [ "new", "skipped", "nopics", "reviewed" ];

/**
 * A feature is a geolocated object, which has to reviewed using pictures.
 * It has a review status, center coordinates, and a list of pictures associated.
 * 
 * @param {string} id An unique ID between all features of a given {@link Dataset}
 * @param {float[]} coordinates The feature center coordinates, as [ lat, lng ] in WGS84
 * @param {Object} properties A list of key->value properties from data source
 * @param {string} [status] The feature review status, one of [new, skipped, nopics, reviewed]. Defaults to "new".
 * 
 * @property {string} id The feature unique ID
 * @property {float[]} coordinates The feature coordinates as [lat, lng] in WGS84
 * @property {Object} properties The feature properties, as a set of key -> value
 */
class Feature {
	constructor(id, coordinates, properties, status) {
		if(id == null || id === "") {
			throw new TypeError("ID must be a valid string");
		}
		
		if(!Array.isArray(coordinates) || coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
			throw new TypeError("Coordinates must be a float array as [ lat, lng ]");
		}
		
		this.id = id;
		this.coordinates = coordinates;
		this.properties = properties;
		this.status = status || "new";
		
		this.lastRadius = null;
		this.pictures = null;
		this.picsShown = {};
	}


//ACCESSORS

	/**
	 * Get the review status of this feature.
	 * @return {string} The status: new, skipped, nopics, reviewed
	 */
	get status() {
		return this._status;
	}
	
	/**
	 * Get the pictures around the feature.
	 * @param {int} radius The max distance of pictures around the feature (in meters)
	 * @return {Promise} A promise resolving on pictures array.
	 */
	getPictures(radius) {
		if(this.pictures !== null && this.lastRadius === radius) {
			return new Promise(resolve => {
				resolve(this.pictures);
			});
		}
		else {
			const picman = new P4C.PicturesManager();
			return picman.startPicsRetrievalAround(
				new P4C.LatLng(this.coordinates[0], this.coordinates[1]),
				radius,
				{ towardscenter: true }
			)
			.then(p => {
				this.pictures = p;
				this.lastRadius = radius;
				return p;
			});
		}
	}
	
	/**
	 * Is the feature visible on given picture ?
	 * This information is based on previous seenOnPicture calls.
	 * @param {int} picId The picture ID (index in getPictures array)
	 * @return {boolean} True if feature was set as shown on picture
	 */
	isShownOnPicture(picId) {
		if(!this.pictures || picId >= this.pictures.length) {
			throw new TypeError("Invalid picture ID");
		}
		else {
			return this.picsShown[Hash(this.pictures[picId])] === true;
		}
	}


//MODIFIERS

	/**
	 * Set the status of the feature
	 * @param {string} value The new status value (one of [new, skipped, nopics, reviewed]).
	 */
	set status(value) {
		if(STATUSES.indexOf(value) >= 0) {
			this._status = value;
		}
		else {
			throw new TypeError("Invalid status value for feature "+this.id+" : "+value);
		}
	}
	
	/**
	 * Defines that the feature was seen or not on a given picture.
	 * @param {int} picId The picture ID (index in getPictures array)
	 * @param {boolean} [seen] Was the feature seen in the given picture ? (defaults to true)
	 */
	seenOnPicture(picId, seen) {
		if(!this.pictures || picId >= this.pictures.length) {
			throw new TypeError("Invalid picture ID");
		}
		else {
			if(seen === true || seen === null || seen === undefined) {
				this.picsShown[Hash(this.pictures[picId])] = true;
			}
			else {
				delete this.picsShown[Hash(this.pictures[picId])];
			}
		}
	}


//OTHER METHODS

	/**
	 * Get the feature as a GeoJSON point feature.
	 * @return {Object} The GeoJSON representation of this feature.
	 */
	asGeoJSON() {
		const props = Object.assign({}, this.properties);
		
		if(this.pictures) {
			props.pictures = [];
			this.pictures.forEach(p => {
				props.pictures.push({
					url: p.pictureUrl,
					details: p.detailsUrl,
					date: (new Date(p.date)).toISOString()
				});
			});
		}
		
		const geojson = {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [ this.coordinates[1], this.coordinates[0] ]
			},
			properties: props
		};
		
		return geojson;
	}
}

export default Feature;
