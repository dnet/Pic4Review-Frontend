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
			API.GetMissions(1, "fix", null)
			.then(missions => {
				assert.ok(missions.length > 0);
				
				missions.forEach(m => {
					assert.ok(m instanceof Mission);
					assert.equal(m.type, "fix");
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
			const m = new Mission("fix", "amenity", AREA, DESC);
			
			API.CreateMission(m, "osmose", { item: 8120, amount: 1 }, "user1", 1)
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
			const m = new Mission("fix", "amenity", AREA, DESC);
			
			API.CreateMission(m, "osmose", { item: 8120 })
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
});
