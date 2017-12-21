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
		
		this.features = {};
		this.lastFeatureId = null;
	}
	
	/**
	 * Retrieve the next feature to review.
	 * @return {Promise} A promise resolving on the next {@link Feature} to review, or null if no more feature is available.
	 */
	getNextFeature() {
		throw new TypeError("This method should be overidden");
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
}

export default Dataset;
