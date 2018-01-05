import Dataset from './Dataset';
import P4C from 'pic4carto';

const TYPES = [ "improve", "fix", "integrate" ];
const THEMES = [ "amenity" ];

/**
 * A mission is a task on which user can work. It concerns a given {@link Dataset}, over a given area.
 * A mission is also categorized by its type (improve, fix, integrate) and its theme.
 * 
 * @param {string} type The kind of mission (one of improve, fix, integrate)
 * @param {string} theme The mission theme (one of amenity)
 * @param {Dataset} dataset The mission source of data
 * @param {Object} area The mission area
 * @param {string} area.name The area name (for example "Rennes, France, Europe")
 * @param {LatLngBounds} area.bbox The area bounding box (see {@link https://framagit.org/Pic4Carto/Pic4Carto.js/blob/master/doc/API.md#latlngbounds|LatLngBounds in Pic4Carto documentation})
 * @param {Object} description The mission details
 * @param {string} description.short The mission goal in a few words
 * @param {string} [description.full] The mission goal detailled (what to do, how...)
 * @param {Object} [options] Mission options
 * 
 * @property {string} type The kind of mission (one of improve, fix, integrate)
 * @property {string} theme The mission theme (one of amenity)
 * @property {Dataset} dataset The mission source of data
 * @property {Object} area The mission area
 * @property {string} area.name The area name (for example "Rennes, France, Europe")
 * @property {LatLngBounds} area.bbox The area bounding box
 */
class Mission {
	constructor(type, theme, dataset, area, description, options) {
		if(type === null || type === undefined || TYPES.indexOf(type) < 0) {
			throw new TypeError("type parameter must be one of "+TYPES.join(", "));
		}
		else if(theme === null || theme === undefined || THEMES.indexOf(theme) < 0) {
			throw new TypeError("theme parameter must be one of "+THEMES.join(", "));
		}
		else if(dataset === null || dataset === undefined || !(dataset instanceof Dataset)) {
			throw new TypeError("dataset parameter must be a valid Dataset instance");
		}
		else if(!area || !area.name || !(area.bbox instanceof P4C.LatLngBounds)) {
			throw new TypeError("area parameter should be an object like { name: string, bbox: LatLngBounds }");
		}
		else if(!description || !description.short || description.short.trim().length < 15) {
			throw new TypeError("description parameters must be an object like { short: string, full: string }. Short description is mandatory.");
		}
		
		this._type = type;
		this._theme = theme;
		this._dataset = dataset;
		this._area = area;
		this._description = description;
	}

//ACCESSORS
	get type() {
		return this._type;
	}
	
	get theme() {
		return this._theme;
	}
	
	get dataset() {
		return this._dataset;
	}
	
	get area() {
		return this._area;
	}
	
	get description() {
		return this._description;
	}

//OTHER METHODS
	/**
	 * Is this mission meeting criterias defined by given filters ?
	 * @param {Object} filters The list of filters (type, theme)
	 * @return {boolean} True if mission meets criterias
	 */
	passFilter(filters) {
		for(const k in filters) {
			const v = filters[k] || null;
			
			switch(k) {
				case "type":
					if(v && this._type !== v) { return false; }
					break;
				
				case "theme":
					if(v && this._theme !== v) { return false; }
					break;
			}
		}
		
		return true;
	}
}

Mission.TYPES = TYPES;
Mission.THEMES = THEMES;

export default Mission;
