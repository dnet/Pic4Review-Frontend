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
						resolve(geojson);
					}
					catch(e) {
						reject(new Error(I18n.t("Given GeoJSON seems invalid")));
					}
				};
				
				this.reader.readAsText(file);
			}
		});
	}
}

export default DatasetManager;
