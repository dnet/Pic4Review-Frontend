/*
 * Test script for ctrl/API.js
 */

import assert from 'assert';
import API from '../../src/app/ctrl/API';
import Feature from '../../src/app/model/Feature';
import Mission from '../../src/app/model/Mission';
import P4C from 'pic4carto';

const AREA = { name: "Rennes, France", bbox: new P4C.LatLngBounds(new P4C.LatLng(48.0758, -1.7245), new P4C.LatLng(48.1514, -1.5995)) };
const DESC = { short: "Add those toilets in OSM", full: "Add the toilets from official source into OpenStreetMap. Please create a point following wiki doc." };
const TIMEOUT = 10000;

describe.skip("Ctrl > API", () => {
	let pictoken = null;
	let midNext = null;
	
	describe("ParamsString", () => {
		it("works with 0 param", () => {
			const p = {};
			const res = API.ParamsString(p);
			assert.equal(res, "");
		});
		
		it("works with 1 param", () => {
			const p = { info: "ok" };
			const res = API.ParamsString(p);
			assert.equal(res, "?info=ok");
		});
		
		it("works with n params", () => {
			const p = { info: "ok", info2: true, info3: 42 };
			const res = API.ParamsString(p);
			assert.equal(res, "?info=ok&info2=true&info3=42");
		});
	});
	
	describe("GetMissionDetails", () => {
		it("works", done => {
			API.GetMissionDetails(1)
			.then(m => {
				assert.ok(m instanceof Mission);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("works with user ID", done => {
			API.GetMissionDetails(1, 1)
			.then(m => {
				assert.ok(m instanceof Mission);
				assert.ok(m.options.canEdit);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetMissions", () => {
		it("works without params", done => {
			API.GetMissions()
			.then(missions => {
				assert.ok(missions.length > 0);
				
				missions.forEach(m => {
					assert.ok(m instanceof Mission);
				});
				
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("works with type param", done => {
			API.GetMissions(1, "integrate", null)
			.then(missions => {
				assert.ok(missions.length > 0);
				
				missions.forEach(m => {
					assert.ok(m instanceof Mission);
					assert.equal(m.type, "integrate");
				});
				
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("works with theme param", done => {
			API.GetMissions(1, null, "amenity")
			.then(missions => {
				assert.ok(missions.length > 0);
				
				missions.forEach(m => {
					assert.ok(m instanceof Mission);
					assert.equal(m.theme, "amenity");
				});
				
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetMissionsMap", () => {
		it("works without params", done => {
			API.GetMissionsMap()
			.then(geojson => {
				assert.ok(geojson.features.length > 0);
				
				geojson.features.forEach(f => {
					assert.equal(f.type, "Feature");
				});
				
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("works with type param", done => {
			API.GetMissionsMap("integrate", null)
			.then(geojson => {
				assert.ok(geojson.features.length > 0);
				
				geojson.features.forEach(f => {
					assert.equal(f.type, "Feature");
					assert.equal(f.properties.type, "integrate");
				});
				
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("works with theme param", done => {
			API.GetMissionsMap(null, "amenity")
			.then(geojson => {
				assert.ok(geojson.features.length > 0);
				
				geojson.features.forEach(f => {
					assert.equal(f.type, "Feature");
					assert.equal(f.properties.theme, "amenity");
				});
				
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("CreateMission", () => {
		it("works if properly described", done => {
			const m = new Mission(1, "fix", "amenity", AREA, DESC);
			
			API.CreateMission(m, "osmose", { item: 8180, amount: 1 }, null, "user1", 1)
			.then(d => {
				const mid = d.id;
				pictoken = d.pictoken;
				assert.ok(mid > 0);
				assert.ok(pictoken >= 0);
				midNext = mid;
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT * 2);
		
		it("fails if some parameter is missing", done => {
			const m = new Mission(1, "fix", "amenity", AREA, DESC);
			
			API.CreateMission(m, "osmose", { item: 8180 })
			.then(d => {
				assert.fail("Should not succeed");
				done();
			})
			.catch(e => {
				assert.equal(e.message, "Invalid user info");
				done();
			});
		}).timeout(TIMEOUT);
		
		it("works for overpass", done => {
			const m = new Mission(1, "fix", "amenity", AREA, DESC);
			
			API.CreateMission(m, "overpass", { query: '[out:json][timeout:25];(way["station"="subway"]({{bbox}}););out center;' }, null, "user1", 1)
			.then(d => {
				const mid = d.id;
				assert.ok(mid > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT * 2);
	});
	
	describe("GetMissionLoading", () => {
		it("works", done => {
			API.GetMissionLoading(pictoken)
			.then(loading => {
				assert.equal(loading, 100);
				
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetMissionFeatures", () => {
		it("works", done => {
			API.GetMissionFeatures(midNext)
			.then(features => {
				assert.ok(features.length > 0);
				features.forEach(f => {
					assert.ok(f instanceof Feature);
				});
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetMissionNextFeature", () => {
		it("works", done => {
			API.GetMissionNextFeature(midNext)
			.then(f => {
				assert.ok(f === null || f instanceof Feature);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT * 3);
	});
	
	describe("UpdateMissionFeature", () => {
		it("works", done => {
			API.GetMissionNextFeature(midNext)
			.then(f => {
				assert.ok(f !== null);
				f.status = "reviewed";
				
				API.UpdateMissionFeature(midNext, f, "user1", 1)
				.then(done)
				.catch(e => {
					assert.fail(e);
					done();
				});
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT * 2);
	});
	
	describe("GetMissionStatistics", () => {
		it("works", done => {
			API.GetMissionStatistics(1)
			.then(s => {
				assert.ok(s.status.nopics > 0);
				assert.ok(s.users.length > 0);
				assert.ok(Object.keys(s.days).length > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("UpdateMission", () => {
		it("works", done => {
			const m = new Mission(-1, "fix", "amenity", AREA, DESC);
			
			API.CreateMission(m, "osmose", { item: 8180, amount: 1 }, "user1", 1)
			.then(d => {
				const mid = d.id;
				assert.ok(mid > 0);
				
				const mUp = new Mission(mid, "integrate", "amenity", AREA, DESC);
				mUp.status = "online";
				
				API.UpdateMission(mUp, "user1", 1)
				.then(() => {
					done();
				})
				.catch(e => {
					assert.fail(e);
					done();
				});
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT * 3);
	});
	
	describe("GetPicturesMissing", () => {
		it("works", done => {
			API.GetPicturesMissing()
			.then(geojson => {
				assert.equal(geojson.type, "FeatureCollection");
				assert.ok(geojson.features.length > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetUserStatistics", () => {
		it("works", done => {
			API.GetUserStatistics(1)
			.then(stats => {
				assert.ok(stats.featuresEdited > 0);
				assert.ok(stats.themes.amenity > 0);
				assert.ok(stats.place > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetUsersStatistics", () => {
		it("works", done => {
			API.GetUsersStatistics()
			.then(stats => {
				assert.ok(stats.scores[0].featuresEdited > 0);
				assert.ok(stats.scores[0].user.length > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetMissionPreview", () => {
		it("works with osmose", done => {
			API.GetMissionPreview(
				new P4C.LatLngBounds(new P4C.LatLng(48.1006, -1.6936), new P4C.LatLng(48.1265, -1.6678)),
				"osmose",
				{ item: 8180 }
			)
			.then(features => {
				assert.ok(features.length > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("works with overpass", done => {
			API.GetMissionPreview(
				new P4C.LatLngBounds(new P4C.LatLng(48.1006, -1.6936), new P4C.LatLng(48.1265, -1.6678)),
				"overpass",
				{ query: '[out:json][timeout:25];(way["station"="subway"]({{bbox}}););out center;' }
			)
			.then(features => {
				assert.ok(features.length > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
});
