/**
 * A dataset is the main ressource of the application.
 * It handles a coherent set of data, retrieved from local file or remote source.
 * It contains several {@link Feature|features}, each one being associated with pictures.
 * 
 * This class should be overidden in order to handle each specific file or source.
 * @abstract
 */
class Dataset {
	constructor() {
		if(this.constructor.name === "Dataset") {
			throw new TypeError("Dataset should not be called directly. Use instead one of the subclasses.");
		}
		
		this.features = [];
		this.lastFeatureId = null;
		this.currentFeatureId = null;
	}
	
	/**
	 * Retrieve the next feature to review.
	 * @param {int} [radius] The radius for pictures search (in meters). Defaults to 20m.
	 * @return {Promise} A promise resolving on the next {@link Feature} to review, or null if no more feature is available.
	 */
	getNextFeature(radius) {
		throw new TypeError("This method should be overidden");
	}
	
	/**
	 * The default radius for pictures search.
	 * @private
	 */
	_getDefaultRadius() {
		return 20;
	}
	
	/**
	 * Retrieve the last reviewed feature.
	 * @return {Feature} The last reviewed feature, or null if no previous feature is available.
	 */
	getPreviousFeature() {
		if(this.lastFeatureId !== null && this.features[this.lastFeatureId]) {
			return this.features[this.lastFeatureId];
		}
		else {
			return null;
		}
	}
	
	/**
	 * Get the review progress, to let user know the amount of reviewed data.
	 * @return {int} The progress, in %
	 */
	getProgress() {
		throw new TypeError("This method should be overidden");
	}
	
	/**
	 * Default implementation of {@link Dataset#getProgress|getProgress} for non-dynamic datasets.
	 * @private
	 */
	_getProgressNotDynamic() {
		return this.currentFeatureId === null ? 0 : ((this.currentFeatureId + 1) / this.features.length * 100);
	}
	
	/**
	 * Get the whole set of features.
	 * For dynamic datasets, only already loaded features will be given.
	 * @return {Object} The {@link Feature|features}, as ID -> feature
	 */
	getAllFeatures() {
		return this.features;
	}
	
	/**
	 * Is this dataset progressively loaded ?
	 * If yes, it means that all features are not yet available, and will be retrieved one by one.
	 * @return {boolean} True if dynamic
	 */
	isDynamic() {
		throw new TypeError("This method should be overidden");
	}
	
	/**
	 * Changes the properties of current feature.
	 * This can also be used to trigger some update events (in particular for dynamic datasets).
	 * @param {string} [status] The new feature status, see {@link Feature#status|Feature doc}
	 * @param {Object} [seenOnPictures] On which pictures the feature was seen, as { picId: true/false }
	 * @return {Promise} Solves if update was successful
	 */
	updateCurrentFeature(status, seenOnPictures) {
		throw new TypeError("This method should be overidden");
	}
	
	/**
	 * Default implementation of {@link Dataset#updateCurrentFeature|updateCurrentFeature} for non-dynamic datasets
	 * @private
	 */
	_updateCurrentFeatureNotDynamic(status, seenOnPictures) {
		if(this.features && this.currentFeatureId !== null && this.features[this.currentFeatureId]) {
			return new Promise((resolve, reject) => {
				try {
					const f = this.features[this.currentFeatureId];
					if(status) {
						f.status = status;
					}
					
					if(seenOnPictures) {
						Object.keys(seenOnPictures).map(parseInt).forEach(k => {
							f.seenOnPicture(k, seenOnPictures[k]);
						});
					}
					
					resolve();
				}
				catch(e) {
					reject(e);
				}
			});
		}
		else {
			return new Promise((resolve, reject) => {
				reject(new Error("Feature is unknown"));
			});
		}
	}
}

export default Dataset;
