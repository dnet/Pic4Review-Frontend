import CONST from '../constants';
import Feature from '../model/Feature';
import Mission from '../model/Mission';
import OsmRequest from 'osm-request';
import queryOverpass from 'query-overpass';
import request from 'browser-request';

const LONG_TIMEOUT_MS = 300000;

/**
 * API controller handles communication with external APIs (mainly Pic4Review and OSM).
 */
class API {
	/**
	 * Converts an object into a list of HTTP parameters
	 * @param {Object} obj The object
	 * @return {string} The HTTP parameters
	 */
	static ParamsString(obj) {
		const res = Object.entries(obj)
			.filter(e => e.length > 1 && e[1] !== null && e[1] !== undefined)
			.map(e => e[0]+"="+e[1])
			.join("&");
		
		return res.length > 0 ? "?"+res : "";
	}
	
	/**
	 * Runs a query against Overpass API
	 * @param {string} query The OAPI query
	 * @return {Promise} A promise resolving on GeoJSON data
	 */
	static QueryOverpass(query) {
		return new Promise((resolve, reject) => {
			queryOverpass(query, (err, data) => {
				if(err) {
					reject(err);
				}
				else {
					resolve(data);
				}
			}, { overpassUrl: CONST.OAPI_URL, flatProperties: true });
		});
	}
	
	/**
	 * Creates a new mission
	 * @param {Mission} mission The mission to create on server
	 * @param {string} source The data source (osmose)
	 * @param {Object} sourceOptions The data source options
	 * @param {Object} [editors] The editors options
	 * @param {string} username The user name
	 * @param {string} userid The user ID
	 * @return {Promise} A promise resolving on mission ID
	 */
	static CreateMission(mission, source, sourceOptions, editors, username, userid) {
		if(source === "overpass" && !sourceOptions.geojson) {
			//Replace {{bbox}} using given area
			const area = mission.area.bbox;
			const q = sourceOptions.query.replace(/{{bbox}}/g, area.getSouth()+","+area.getWest()+","+area.getNorth()+","+area.getEast());
			
			return this.QueryOverpass(q)
			.then(geojson => {
				const opts = Object.assign({}, sourceOptions, { geojson: geojson });
				return this.CreateMission(mission, source, opts, editors, username, userid);
			});
		}
		else {
			return new Promise((resolve, reject) => {
				//Prepare data
				const data = {
					type: mission.type,
					theme: mission.theme,
					areaname: mission.area.name,
					shortdesc: mission.description.short,
					fulldesc: mission.description.full,
					datatype: source,
					dataoptions: sourceOptions,
					minlat: mission.area.bbox.getSouth(),
					maxlat: mission.area.bbox.getNorth(),
					minlon: mission.area.bbox.getWest(),
					maxlon: mission.area.bbox.getEast(),
					username: username,
					userid: userid
				};
				
				//Save editors data
				if(editors) {
					data.dataoptions.editors = editors;
				}
				
				//Send request
				request(
					{
						method: "POST",
						url: CONST.P4R_URL + '/missions',
						json: data,
						timeout: LONG_TIMEOUT_MS
					},
					(err, res, body) => {
						if(err) {
							reject(err);
						}
						else {
							try {
								const data = typeof body === "string" ? JSON.parse(body) : body;
								
								if(data.error) {
									reject(new Error(data.error));
								}
								else {
									resolve(data);
								}
							}
							catch(e) {
								reject(e);
							}
						}
					}
				);
			});
		}
	}
	
	/**
	 * Get missions synthetic list
	 * @param {int} [page] The page number (starting and defaults to 1)
	 * @param {string} [type] The mission type
	 * @param {string} [theme] The mission theme
	 * @param {string} [status] The mission status (online by default)
	 * @return {Promise} A promise resolving on missions
	 */
	static GetMissions(page, type, theme, status) {
		return new Promise((resolve, reject) => {
			const p = {
				page: page,
				type: type,
				theme: theme,
				status: status || "online"
			};
			
			request(CONST.P4R_URL + '/missions' + this.ParamsString(p), (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							const missions = data.missions
								.map(m => Mission.CreateFromAPI(m));
						
							resolve(missions);
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get missions synthetic list for map rendering
	 * @param {string} [type] The mission type
	 * @param {string} [theme] The mission theme
	 * @return {Promise} A promise resolving on GeoJSON of missions
	 */
	static GetMissionsMap(type, theme) {
		return new Promise((resolve, reject) => {
			const p = {
				type: type,
				theme: theme
			};
			
			request(CONST.P4R_URL + '/missions/map' + this.ParamsString(p), (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							resolve(data.geojson);
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get mission loading status
	 * @param {int} [pictoken] The mission temporary token
	 * @return {Promise} A promise resolving on loading progress (in percent)
	 */
	static GetMissionLoading(pictoken) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/missions/loading?pictoken=' + pictoken, (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							resolve(data.loading);
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get mission details
	 * @param {int} mid The mission ID
	 * @param {string} [userid] The user ID (to check if can edit mission)
	 * @return {Promise} A promise resolving on mission with its full details
	 */
	static GetMissionDetails(mid, userid) {
		return new Promise((resolve, reject) => {
			let url = CONST.P4R_URL + '/missions/' + mid;
			if(userid) { url += "?userid="+userid; }
			
			request(url, (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
								reject(new Error(data.error));
						}
						else {
							if(data.canEdit === true) { data.mission.canEdit = true; }
							resolve(Mission.CreateFromAPI(data.mission));
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get mission next feature
	 * @param {int} mid The mission ID
	 * @param {float[]} [coordinates] The coordinates to search around
	 * @return {Promise} A promise resolving on next feature, or null if no more available
	 */
	static GetMissionNextFeature(mid, coordinates) {
		return new Promise((resolve, reject) => {
			let url = CONST.P4R_URL + '/missions/' + mid + '/features/next';
			if(coordinates) { url += this.ParamsString({ lat: coordinates[0], lng: coordinates[1] }); }
			
			request(url, (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else if(!data.feature) {
							resolve(null);
						}
						else {
							resolve(Feature.CreateFromAPI(data.feature));
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get mission features
	 * @param {int} mid The mission ID
	 * @return {Promise} A promise resolving on features list
	 */
	static GetMissionFeatures(mid) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/missions/' + mid + '/features', (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							resolve(data.features.map(f => Feature.CreateFromAPI(f)));
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get mission features preview
	 * @param {LatLngBounds} area The area of the mission
	 * @param {string} source The data source
	 * @param {Object} options The data source options
	 * @return {Promise} A promise resolving on features with pictures
	 */
	static GetMissionPreview(area, source, options) {
		if(source === "overpass" && !options.geojson) {
			//Replace {{bbox}} using given area
			const q = options.query.replace(/{{bbox}}/g, area.getSouth()+","+area.getWest()+","+area.getNorth()+","+area.getEast());
			
			return this.QueryOverpass(q)
			.then(geojson => {
				const opts = Object.assign({}, options, { geojson: geojson });
				if(geojson.features.length > 0) {
					return this.GetMissionPreview(area, source, opts);
				}
				else {
					return new Error("No features returned by this query in the given area");
				}
			});
		}
		else {
			return new Promise((resolve, reject) => {
				const p = {
					minlat: area.getSouth(),
					maxlat: area.getNorth(),
					minlon: area.getWest(),
					maxlon: area.getEast(),
					datatype: source,
					dataoptions: options
				};
				
				const url = CONST.P4R_URL + '/missions/preview';
				
				request(
					{
						method: "POST",
						url: url,
						json: p,
						timeout: LONG_TIMEOUT_MS
					},
					(err, res, body) => {
						if(err) {
							reject(err);
						}
						else {
							try {
								const data = typeof body === "string" ? JSON.parse(body) : body;
								
								if(data.error) {
									reject(new Error(data.error));
								}
								else {
									resolve(data.features);
								}
							}
							catch(e) {
								reject(e);
							}
						}
					}
				);
			});
		}
	}
	
	/**
	 * Get mission statistics
	 * @param {int} mid The mission ID
	 * @return {Promise} A promise resolving on features statistics
	 */
	static GetMissionStatistics(mid) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/missions/' + mid + '/stats', (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							resolve(data);
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get missing pictures
	 * @return {Promise} A promise resolving on pictures list
	 */
	static GetPicturesMissing() {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/pictures/missing', (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							resolve(data);
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get statistics for a particular user
	 * @param {int} uid The user ID
	 * @return {Promise} A promise resolving on user statistics
	 */
	static GetUserStatistics(uid) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/users/' + uid + '/stats', (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							resolve(data);
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Get statistics for all users
	 * @return {Promise} A promise resolving on users statistics
	 */
	static GetUsersStatistics() {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/users/stats', (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.error));
						}
						else {
							resolve(data);
						}
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
	
	/**
	 * Update a mission
	 * @param {Mission} mission The updated mission
	 * @param {string} username The user name
	 * @param {string} userid The user ID
	 * @return {Promise} Resolves if update was successful
	 */
	static UpdateMission(mission, username, userid) {
		return new Promise((resolve, reject) => {
			const data = {
				username: username,
				userid: userid,
				type: mission.type,
				theme: mission.theme,
				areaname: mission.area.name,
				shortdesc: mission.description.short,
				fulldesc: mission.description.full,
				status: mission.status
			};
			
			if(mission.options && mission.options.data && mission.options.data.options) {
				data.dataoptions = mission.options.data.options;
			}
			
			request(
				{
					method: 'PUT',
					url: CONST.P4R_URL + '/missions/' + mission.id,
					json: data
				},
				(err, res, body) => {
					if(err) {
						reject(err);
					}
					else {
						try {
							const data = typeof body === "string" ? JSON.parse(body) : body;
							
							if(data.error) {
								reject(new Error(data.error));
							}
							else {
								resolve();
							}
						}
						catch(e) {
							reject(e);
						}
					}
				}
			);
		});
	}
	
	/**
	 * Update feature of a mission
	 * @param {int} mid The mission ID
	 * @param {Feature} feature The feature to update
	 * @param {string} username The user name
	 * @param {string} userid The user ID
	 * @return {Promise} Resolves if update was successful
	 */
	static UpdateMissionFeature(mid, feature, username, userid) {
		return new Promise((resolve, reject) => {
			request(
				{
					method: "PUT",
					url: CONST.P4R_URL + '/missions/' + mid + '/features/' + feature.id + '?username='+username+'&userid='+userid+'&status='+feature.status
				},
				(err, res, body) => {
					if(err) {
						reject(err);
					}
					else {
						try {
							const data = typeof body === "string" ? JSON.parse(body) : body;
							
							if(data.error) {
								reject(new Error(data.error));
							}
							else {
								resolve();
							}
						}
						catch(e) {
							reject(e);
						}
					}
				}
			);
		});
	}
	
	/**
	 * Get the URL for missing pictures export.
	 * @param {int} mid The mission ID
	 * @param {string} format The export format (gpx, geojson, kml)
	 * @return {string} The URL
	 */
	static GetExportMissingUrl(mid, format) {
		return CONST.P4R_URL + '/missions/' + mid + '/export/missing?format=' + format;
	}
	
	/**
	 * Update an OSM feature by applying some tags.
	 * @param {string} featureId The OSM feature ID (ex: node/1234)
	 * @param {Object} tagsToApply The list of tags to apply on object
	 * @param {string} comment Comment for changeset
	 * @param {int} [changesetId] ID of changeset to reuse
	 * @return {Promise} Resolves when feature was correctly updated (gives an object like { changesetId: int })
	 */
	static UpdateOSMFeature(featureId, tagsToApply, comment, changesetId) {
		return new Promise((resolve, reject) => {
			//Check user auth token
			const wantUser = PubSub.subscribe("USER.INFO.READY", async (msg, user) => {
				PubSub.unsubscribe(wantUser);
				
				if(user) {
					const osm = new OsmRequest({ endpoint: CONST.OSM_API_URL });
					osm._auth = user.auth;
					
					//Get OSM element from API
					try {
						let element = await osm.fetchElement(featureId);
						element = osm.setProperties(element, tagsToApply);
						element = osm.setTimestampToNow(element);
						element = osm.incrementVersion(element);
						
						const isChangesetStillOpen = changesetId ? await osm.isChangesetStillOpen(changesetId) : false;
						
						if(!isChangesetStillOpen) {
							changesetId = await osm.createChangeset('Pic4Review', comment);
						}
						
						const newElementVersion = await osm.sendElement(element, changesetId);
						resolve({ changesetId: changesetId });
					}
					catch(e) {
						reject(e);
					}
				}
				else {
					reject(new Error("Can't verify user credentials"));
				}
			});
			
			PubSub.publish("USER.INFO.WANTS");
		});
	}
}

export default API;
