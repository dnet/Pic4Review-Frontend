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

describe("Ctrl > API", () => {
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
	
	describe("CreateMission", () => {
		it("works if properly described", done => {
			const m = new Mission(1, "fix", "amenity", AREA, DESC);
			
			API.CreateMission(m, "osmose", { item: 8180, amount: 1 }, "user1", 1)
			.then(mid => {
				assert.ok(mid > 0);
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
			.then(mid => {
				assert.fail("Should not succeed");
				done();
			})
			.catch(e => {
				assert.equal(e.message, "Invalid user info");
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("GetMissionFeatures", () => {
		it("works", done => {
			API.GetMissionFeatures(1)
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
			API.GetMissionNextFeature(1)
			.then(f => {
				assert.ok(f === null || f instanceof Feature);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("UpdateMissionFeature", () => {
		it("works", done => {
			API.GetMissionNextFeature(1)
			.then(f => {
				f.status = "reviewed";
				
				API.UpdateMissionFeature(1, f, "user1", 1)
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
			.then(mid => {
				assert.ok(mid > 0);
				m.id = mid;
				m.status = "online";
				
				API.UpdateMission(m, "user1", 1)
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
		it("works", done => {
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
	});
});
