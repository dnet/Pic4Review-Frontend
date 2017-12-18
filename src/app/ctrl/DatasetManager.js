import Hash from 'object-hash';

const STATUS = { "0": "new", "1": "done", "2": "skip" };
const STATUS_TO_ID = { "new": "0", "done": "1", "skip": "2" };

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
						for(let i in geojson.features) {
							geojson.features[i].properties.p4rid = i;
						}
						resolve(this.readReview({ type: "geojson", data: geojson }));
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
	 * @param {Object} dataset The dataset
	 * @return {Object} The dataset with review status for each feature
	 */
	readReview(dataset) {
		const hash = dataset.type + Hash(dataset.data);
		let review = localStorage.getItem(hash);
		
		if(review !== null) {
			dataset.review = review.split(';').map(id => STATUS[id]);
		}
		else {
			dataset.review = Array.apply(null, Array(dataset.data.features.length)).map(() => "new");
		}
		
		//console.log("read", dataset.review);
		
		return dataset;
	}
	
	/**
	 * Updates the status of a given feature in the dataset, and saves it in localStorage.
	 * @param {Object} dataset The dataset
	 * @param {int} featureId The feature ID in the dataset
	 * @param {string} status The feature new status (new, done, skip)
	 * @return {Object} The updated dataset
	 */
	updateReview(dataset, featureId, status) {
		const hash = dataset.type + Hash(dataset.data);
		
		//Update
		dataset.review[featureId] = status;
		const newItem = dataset.review.map(s => STATUS_TO_ID[s]).join(';');
		localStorage.setItem(hash, newItem);
		
		//console.log("update", dataset.review);
		
		return dataset;
	}
	
	/**
	 * Clear all the reviews of a given dataset.
	 * @param {Object} dataset The dataset
	 * @return {Object} The updated dataset
	 */
	clearReview(dataset) {
		const hash = dataset.type + Hash(dataset.data);
		
		//Update
		dataset.review = dataset.review.map(s => "new");
		const newItem = dataset.review.map(s => STATUS_TO_ID[s]).join(';');
		localStorage.setItem(hash, newItem);
		
		//console.log("clear", dataset.review, newItem);
		
		return dataset;
	}
}

export default DatasetManager;
