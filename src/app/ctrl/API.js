import CONST from '../constants';
import PACKAGE from '../../../package.json';
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
					reject(new Error("Received error from Overpass API " + (err.message ? err.message : "")));
				}
				else {
					resolve(data);
				}
			}, { overpassUrl: CONST.OAPI_URL, flatProperties: true });
		});
	}
	
	/**
	 * Look for similar objects in Overpass API in an area.
	 * @param {Object} tags The list of tags to search on
	 * @param {Object} geom The GeoJSON geometry object to look around
	 * @param {int} radius The search radius (in meters)
	 * @return {Promise} Resolves on GeoJSON entries found
	 */
	static FindSimilarInOverpass(tags, geom, radius) {
		if(geom.type !== "Point") {
			return { type: "FeatureCollection", features: [] };
		}
		
		let request = "[out:json][timeout:10];(";
		
		const around = "(around:"+radius+","+geom.coordinates[1]+","+geom.coordinates[0]+")";
		const tagFilter = Object.entries(tags).map(e => "[\""+e[0]+"\"=\""+e[1]+"\"]").join("");
		
		const types = [ "node", "way" ];
		request += types.map(type => type+tagFilter+around+";").join(" ");
		
		request += "); out body; >; out skel qt;";
		
		return API.QueryOverpass(request);
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
				else {
					data.dataoptions.editors = null;
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
									reject(new Error(data.details_for_humans || data.error));
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
	 * @param {boolean} [hasEditor] True if the mission has a simple editor (false by default)
	 * @param {boolean} [showComplete] True if API should return completed missions
	 * @param {string} [userid] If set, only retrieves missions concerning this user
	 * @return {Promise} A promise resolving on missions
	 */
	static GetMissions(page, type, theme, status, hasEditor, showComplete, userid) {
		return new Promise((resolve, reject) => {
			const p = {
				page: page,
				type: type,
				theme: theme,
				status: status || "online",
				editor: hasEditor || false,
				complete: showComplete || false,
				user: userid || null
			};
			
			request(CONST.P4R_URL + '/missions' + this.ParamsString(p), (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
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
	 * @param {string} [status] The mission status (online by default)
	 * @param {boolean} [hasEditor] True if the mission has a simple editor (false by default)
	 * @param {boolean} [showComplete] True if API should return completed missions
	 * @param {string} [userid] If set, only retrieves missions concerning this user
	 * @return {Promise} A promise resolving on GeoJSON of missions
	 */
	static GetMissionsMap(type, theme, status, hasEditor, showComplete, userid) {
		return new Promise((resolve, reject) => {
			const p = {
				type: type,
				theme: theme,
				status: status || "online",
				editor: hasEditor || false,
				complete: showComplete || false,
				user: userid || null
			};
			
			request(CONST.P4R_URL + '/missions/map' + this.ParamsString(p), (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
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
							reject(new Error(data.details_for_humans || data.error));
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
	 * Get missions synthetic list
	 * @return {Promise} A promise resolving on missions templates { id: int, theme: string, shortdesc: string, fulldesc: string }
	 */
	static GetMissionsTemplates() {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/missions/templates', (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
						}
						else {
							resolve(data.templates);
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
	 * @param {boolean} [synthetic] Retrieve only synthetic data (for mobile)
	 * @return {Promise} A promise resolving on mission with its full details
	 */
	static GetMissionDetails(mid, userid, synthetic) {
		return new Promise((resolve, reject) => {
			const params = {};
			if(userid) { params.userid = userid; }
			if(synthetic) { params.synthetic = "1"; }
			
			const url = CONST.P4R_URL + '/missions/' + mid + API.ParamsString(params);
			
			request(url, (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
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
	 * @param {string} [userid] The user ID (to filter skipped features)
	 * @return {Promise} A promise resolving on next feature, or null if no more available
	 */
	static GetMissionNextFeature(mid, coordinates, userid) {
		return new Promise((resolve, reject) => {
			let url = CONST.P4R_URL + '/missions/' + mid + '/features/next';
			
			const params = {};
			
			if(coordinates) {
				params.lat = coordinates[0];
				params.lng = coordinates[1];
			}
			
			if(userid) {
				params.userid = userid;
			}
			
			url += this.ParamsString(params);
			
			request(url, (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
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
							reject(new Error(data.details_for_humans || data.error));
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
									reject(new Error(data.details_for_humans || data.error));
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
	 * @param {int} uid The user ID
	 * @return {Promise} A promise resolving on features statistics
	 */
	static GetMissionStatistics(mid, uid) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/missions/' + mid + '/stats' + (uid ? '?user='+uid : ''), (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
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
	 * Get mission statistics for given user
	 * @param {int} mid The mission ID
	 * @param {int} uid The user ID
	 * @return {Promise} A promise resolving on features statistics
	 */
	static GetMissionUserStatistics(mid, uid) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/missions/' + mid + '/stats/' + uid, (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
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
							reject(new Error(data.details_for_humans || data.error));
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
							reject(new Error(data.details_for_humans || data.error));
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
	 * @param {int} [uid] User ID (for showing this user ranking even if not in top 20)
	 * @return {Promise} A promise resolving on users statistics
	 */
	static GetUsersStatistics(uid) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/users/stats' + (uid ? '?user='+uid : ''), (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = typeof body === "string" ? JSON.parse(body) : body;
						
						if(data.error) {
							reject(new Error(data.details_for_humans || data.error));
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
			
			if(mission.options && mission.options.template != null) {
				data.template = mission.options.template;
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
								reject(new Error(data.details_for_humans || data.error));
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
								reject(new Error(data.details_for_humans || data.error));
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
	 * Check if given OSM feature can be moved without breaking things
	 * @param {string} featureId The OSM feature ID (ex: node/1234)
	 * @return {Promise} Resolves on boolean letting you know if it can be moved
	 */
	static CanOSMFeatureMove(featureId) {
		return new Promise(async(resolve, reject) => {
			//Only node can be moved
			if(!featureId || !featureId.startsWith("node/")) {
				resolve(false);
			}
			else {
				const osm = new OsmRequest({ endpoint: CONST.OSM_API_URL });
				
				//Call API
				try {
					let ways = await osm.fetchWaysForNode(featureId);
					resolve(!ways || ways.length === 0);
				}
				catch(e) {
					reject(e);
				}
			}
		});
	}
	
	/**
	 * Create a new OSM feature
	 * @param {Object} geometry The geometry to use (geometry property of a GeoJSON feature)
	 * @param {Object} tags The list of tags to use on the object
	 * @param {string} comment Comment for changeset
	 * @param {int} [changesetId] ID of changeset to reuse
	 * @return {Promise} Resolves when feature was correctly created (gives an object like { changesetId: int })
	 */
	static CreateOSMFeature(geometry, tags, comment, changesetId) {
		return new Promise((resolve, reject) => {
			//Check user auth token
			const wantUser = PubSub.subscribe("USER.INFO.READY", async (msg, user) => {
				PubSub.unsubscribe(wantUser);
				
				if(user) {
					const osm = new OsmRequest({ endpoint: CONST.OSM_API_URL });
					osm._auth = user.auth;
					
					try {
						// Only works for node as now
						if(geometry.type !== "Point") {
							throw new Error("Can only create node features on OSM");
						}
						
						//Check tags
						const tagsToRemove = [ "error_id", "title" ];
						tagsToRemove.forEach(k => delete tags[k]);
						
						//Create new node
						let element = osm.createNodeElement(geometry.coordinates[1], geometry.coordinates[0], tags);
						
						//Do we have a valid changeset ID ?
						let changesetOpen = changesetId && !isNaN(parseInt(changesetId));
						
						//Check against OSM API if it's still open
						if(changesetOpen) {
							try {
								await osm.isChangesetStillOpen(changesetId);
							}
							catch(e) {
								changesetOpen = false;
							}
						}
						
						//Create a new changeset if needed
						if(!changesetOpen) {
							changesetId = await osm.createChangeset('Pic4Review '+PACKAGE.version, comment);
						}
						
						//Send element
						await osm.sendElement(element, changesetId);
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
	
	/**
	 * Update an OSM feature by applying some tags.
	 * @param {string} featureId The OSM feature ID (ex: node/1234)
	 * @param {Object} tagsToApply The list of tags to apply on object
	 * @param {string} comment Comment for changeset
	 * @param {int} [changesetId] ID of changeset to reuse
	 * @param {Object} [geometry] The new geometry to use (geometry property of a GeoJSON feature)
	 * @return {Promise} Resolves when feature was correctly updated (gives an object like { changesetId: int })
	 */
	static UpdateOSMFeature(featureId, tagsToApply, comment, changesetId, geometry) {
		return new Promise((resolve, reject) => {
			//Check user auth token
			const wantUser = PubSub.subscribe("USER.INFO.READY", async (msg, user) => {
				PubSub.unsubscribe(wantUser);
				
				if(user) {
					const osm = new OsmRequest({ endpoint: CONST.OSM_API_URL });
					osm._auth = user.auth;
					
					try {
						//Get OSM element from API
						let element = await osm.fetchElement(featureId);
						
						//Handle tags to remove
						Object.keys(tagsToApply).filter(k => k.startsWith("-") && k.length >= 2).forEach(k => {
							delete tagsToApply[k];
							element = osm.removeProperty(element, k.substring(1));
						});
						
						//Handle geometry-specific tags
						Object.keys(tagsToApply).filter(k => k.startsWith("~") && k.length >= 2 && k.indexOf(":") > 0).forEach(k => {
							if(
								(k.startsWith("~node:") && featureId.startsWith("node/"))
								|| (k.startsWith("~way:") && featureId.startsWith("way/"))
								|| (k.startsWith("~relation:") && featureId.startsWith("relation/"))
							) {
								tagsToApply[k.substring(k.indexOf(":")+1)] = tagsToApply[k];
							}
							
							delete tagsToApply[k];
						});
						
						//Change tags and timestamp
						element = osm.setProperties(element, tagsToApply);
						element = osm.setTimestampToNow(element);
						
						//Edit geometry
						if(geometry) {
							if(geometry.type === "Point" && featureId.startsWith("node/")) {
								element = osm.setCoordinates(element, geometry.coordinates[1], geometry.coordinates[0]);
							}
						}
						
						//Do we have a valid changeset ID ?
						let changesetOpen = changesetId && !isNaN(parseInt(changesetId));
						
						//Check against OSM API if it's still open
						if(changesetOpen) {
							try {
								await osm.isChangesetStillOpen(changesetId);
							}
							catch(e) {
								changesetOpen = false;
							}
						}
						
						//Create a new changeset if needed
						if(!changesetOpen) {
							changesetId = await osm.createChangeset('Pic4Review '+PACKAGE.version, comment);
						}
						
						//Send element
						await osm.sendElement(element, changesetId);
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
