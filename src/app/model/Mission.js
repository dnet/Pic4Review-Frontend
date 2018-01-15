import Hash from 'object-hash';
import P4C from 'pic4carto';

const TYPES = [ "improve", "fix", "integrate" ];
const THEMES = [ "amenity" ];

/**
 * A mission is a task on which user can work. It concerns a given set of {@link Feature}, over a given area.
 * A mission is also categorized by its type (improve, fix, integrate) and its theme.
 * 
 * @param {string} type The kind of mission (one of improve, fix, integrate)
 * @param {string} theme The mission theme (one of amenity)
 * @param {Object} area The mission area
 * @param {string} area.name The area name (for example "Rennes, France, Europe")
 * @param {LatLngBounds} [area.bbox] The area bounding box (see {@link https://framagit.org/Pic4Carto/Pic4Carto.js/blob/master/doc/API.md#latlngbounds|LatLngBounds in Pic4Carto documentation})
 * @param {Object} description The mission details
 * @param {string} description.short The mission goal in a few words
 * @param {string} [description.full] The mission goal detailled (what to do, how...)
 * @param {Feature[]} [features] The list of features (can be set later)
 * @param {Object} [options] Mission options
 * 
 * @property {string} id An unique ID representing this mission
 * @property {string} type The kind of mission (one of improve, fix, integrate)
 * @property {string} theme The mission theme (one of amenity)
 * @property {Object} area The mission area
 * @property {string} area.name The area name (for example "Rennes, France, Europe")
 * @property {LatLngBounds} area.bbox The area bounding box
 */
class Mission {
	constructor(type, theme, area, description, features, options) {
		if(type === null || type === undefined || TYPES.indexOf(type) < 0) {
			throw new TypeError("type parameter must be one of "+TYPES.join(", "));
		}
		else if(theme === null || theme === undefined || THEMES.indexOf(theme) < 0) {
			throw new TypeError("theme parameter must be one of "+THEMES.join(", "));
		}
		else if(!area || !area.name) {
			throw new TypeError("area parameter should be an object like { name: string, bbox: LatLngBounds }");
		}
		else if(area.bbox && !(area.bbox instanceof P4C.LatLngBounds)) {
			throw new TypeError("area parameter should be an object like { name: string, bbox: LatLngBounds }");
		}
		else if(!description || !description.short || description.short.trim().length < 10) {
			throw new TypeError("description parameters must be an object like { short: string, full: string }. Short description is mandatory.");
		}
		
		this._type = type;
		this._theme = theme;
		this._area = area;
		this._description = description;
		this.features = features;
	}
	
	/**
	 * Create Mission object from API response
	 * @param {Object} options The API response for one mission
	 * @return {Mission} The corresponding mission
	 */
	static CreateFromAPI(options) {
		let bbox = null;
		
		if(options.geom) {
			const c = options.geom.coordinates[0];
			bbox = new P4C.LatLngBounds(new P4C.LatLng(c[0][1], c[0][0]), new P4C.LatLng(c[2][1], c[2][0]));
		}
		
		return new Mission(
			options.type,
			options.theme,
			{ name: options.areaname, bbox: bbox },
			{ short: options.shortdesc, full: options.fulldesc }
		);
	}

//ACCESSORS
	get id() {
		return Hash(this._type+this._theme+this._area.bbox.toString()+this._description.short);
	}
	
	get type() {
		return this._type;
	}
	
	get theme() {
		return this._theme;
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
