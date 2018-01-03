import Feature from '../model/Feature';
import GeoJSON from '../model/dataset/GeoJSON';
import Hash from 'object-hash';

/**
 * DatasetManager is an utility class to handle {@link Dataset|datasets}.
 * It allows to read data from files, store metadata...
 * 
 * @param {boolean} [skipChecks] Set to true to not run browser compatibility checks.
 */
class DatasetManager {
	constructor(skipChecks) {
		if(skipChecks === null || skipChecks === undefined || skipChecks === false) {
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
	}
	
	/**
	 * Reads a GeoJSON from file.
	 * @param {Object} file The input file
	 * @return {Promise} Resolves on {@link GeoJSONDataset|GeoJSON dataset}
	 */
	loadGeoJSON(file) {
		return new Promise((resolve, reject) => {
			if(!file) {
				reject(new Error(I18n.t("No GeoJSON file given")));
			}
			else {
				this.reader.onload = e => {
					try {
						const dataset = new GeoJSON(e.target.result);
						resolve(this.loadReview(dataset));
					}
					catch(e) {
						console.error(e);
						reject(new Error(I18n.t("Given GeoJSON seems invalid")));
					}
				};
				
				this.reader.readAsText(file);
			}
		});
	}
	
	/**
	 * Read previous review from local storage for a given dataset
	 * @param {Dataset} dataset The dataset
	 * @return {Dataset} The dataset with review status for each feature
	 */
	loadReview(dataset) {
		let review = localStorage.getItem(dataset.getId());
		const features = dataset.getAllFeatures();
		
		if(review !== null) {
			const reviewData = {};
			review.split(';').forEach(st => {
				try {
					const d = st.split('=');
					reviewData[d[0]] = Feature.STATUSES[d[1]];
				}
				catch(e) {
					console.warn("Can't read status");
				}
			});
			
			for(let i in features) {
				if(reviewData[features[i].id]) {
					features[i].status = reviewData[features[i].id];
				}
			}
		}
		
		return dataset;
	}
	
	/**
	 * Updates the status of a given feature in the dataset, and saves it in localStorage.
	 * @param {Dataset} dataset The dataset
	 * @return {Dataset} The updated dataset
	 */
	saveReview(dataset) {
		const newItem = dataset.getAllFeatures().map(f => f.id+"="+Feature.STATUSES.indexOf(f.status)).join(';');
		try {
			localStorage.setItem(dataset.getId(), newItem);
		}
		catch(e) {
			console.warn(e);
			
			//Try again after clearing localstorage
			localStorage.clear();
			
			try {
				localStorage.setItem(dataset.getId(), newItem);
			}
			catch(e) {
				console.error("Can't write into localstorage", e);
			}
		}
		return dataset;
	}
	
	/**
	 * Clear all the reviews of a given dataset.
	 * @param {Dataset} dataset The dataset
	 * @return {Dataset} The updated dataset
	 */
	clearReview(dataset) {
		localStorage.removeItem(dataset.getId());
		
		dataset.getAllFeatures().forEach(f => {
			f.status = "new";
		});
		
		return dataset;
	}
}

export default DatasetManager;
