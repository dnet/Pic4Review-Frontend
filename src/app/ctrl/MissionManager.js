import DatasetManager from './DatasetManager';
import GeoJSON from '../model/dataset/GeoJSON';
import { LatLng, LatLngBounds } from 'pic4carto';
import Mission from '../model/Mission';
import Osmose from '../model/dataset/Osmose';

/**
 * Mission manager handles retrieval and saving of {@link Mission|Missions}.
 */
class MissionManager {
	constructor() {
		this.missions = null;
		this.datasetManager = new DatasetManager();
	}
	
	/**
	 * Retrieves the list of available missions.
	 * @return {Promise} Resolves on an array of {@link Mission} objects.
	 */
	getMissions() {
		return new Promise((resolve, reject) => {
			//Return directly if already available
			if(this.missions) {
				resolve(this.missions);
			}
			else {
				this.missions = [];
				
				//Temporary hard-coded implementation
				//TODO Use an API call to get missions dynamically
				const areaRennes = { name: "Rennes, France, Europe", bbox: new LatLngBounds(new LatLng(48.0769155, -1.7525876), new LatLng(48.1549705, -1.6244045)) };
				
				//Debug mission
				this.missions.push(new Mission(
					"improve",
					"amenity",
					this.datasetManager.loadReview(new GeoJSON('{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -13.9526 , 47.9016 ] } }, { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -1.6832758, 48.12771 ] } }, { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -1.6831709, 48.1277262 ] } } ] }')),
					areaRennes,
					{ short: "Debug mission", full: "These toilets are known from an official source, but are missing in OpenStreetMap. Please add them using one of the editors (iD or JOSM), following [documentation](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dtoilets), if you are able to see them in pictures." }
				));
				
				//OD Toilets in Rennes, France
				this.missions.push(new Mission(
					"integrate",
					"amenity",
					this.datasetManager.loadReview(new Osmose(8180, 100, { class: 2 })),
					areaRennes,
					{ short: "Missing toilets", full: "These toilets are known from an official source, but are missing in OpenStreetMap. Please add them using one of the editors (iD or JOSM), following [documentation](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dtoilets), if you are able to see them in pictures." }
				));
				
				//Recycling containers in Rennes, France
				this.missions.push(new Mission(
					"fix",
					"amenity",
					this.datasetManager.loadReview(new Osmose(3230, 500, { bbox: areaRennes.bbox })),
					areaRennes,
					{ short: "Bad recycling containers", full: "These recycling containers are probably badly described. Please check the kind of waste which can be recycled there using pictures. You can have a clue of the error looking to \"title\" property of features. For help, check [documentation](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drecycling)." }
				));
				
				//Post boxes in Rennes, France
				this.missions.push(new Mission(
					"integrate",
					"amenity",
					this.datasetManager.loadReview(new Osmose(8025, 500, { bbox: areaRennes.bbox })),
					areaRennes,
					{ short: "Missing post box", full: "These post boxes are known from an official source, but missing in OpenStreetMap. Please add them if you can them on the given pictures. For more information about tagging of post boxes, please see [documentation](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dpost_box)." }
				));
				
				resolve(this.missions);
			}
		});
	}
}

export default MissionManager;
