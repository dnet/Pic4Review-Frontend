import Hash from 'object-hash';

const STATUS = { "0": "new", "1": "done", "2": "skip" };

/**
 * DatasetManager is an utility class to handle datasets.
 * It allows to read data from files, store metadata...
 */
class DatasetManager {
	constructor() {
		if(window.File && window.FileReader && window.FileList && window.Blob) {
			this.reader = new FileReader();
		}
		else {
			throw new Error(I18n.t("No support of File API, please use a recent web browser"));
		}
		
		if(!window.localStorage) {
			throw new Error(I18n.t("No support of local storage, please use a recent web browser"));
		}
	}
	
	/**
	 * Reads a GeoJSON from file.
	 * @param {Object} file The input file
	 * @return {Promise} Resolves on GeoJSON object
	 */
	readGeoJSON(file) {
		return new Promise((resolve, reject) => {
			if(!file) {
				reject(new Error(I18n.t("No GeoJSON file given")));
			}
			else {
				this.reader.onload = e => {
					try {
						const geojson = JSON.parse(e.target.result);
						resolve(this.readReview("geojson", geojson));
					}
					catch(e) {
						reject(new Error(I18n.t("Given GeoJSON seems invalid")));
					}
				};
				
				this.reader.readAsText(file);
			}
		});
	}
	
	/**
	 * Read previous review from local storage for a given dataset
	 * @param {string} type The dataset format
	 * @param {Object} data The dataset
	 * @return {Object} The dataset with review status for each feature
	 */
	readReview(type, data) {
		const hash = type + Hash(data);
		const review = localStorage.getItem(hash);
		
		switch(type) {
			case "geojson":
				if(review === null) {
					data.features.map(f => {
						f.properties.p4rstatus = "new";
						return f;
					});
					return data;
				}
				else {
					const reviews = review.split(';');
					for(let i=0; i < reviews.length; i++) {
						data.features[i].properties.p4rstatus = STATUS[reviews[i]] || "new";
					}
					return data;
				}
				break;
			default:
				return data;
		}
	}
}

export default DatasetManager;
