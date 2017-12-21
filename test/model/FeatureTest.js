/*
 * Test script for model/Feature.js
 */

import assert from 'assert';
import Hash from 'object-hash';
import Feature from '../../src/app/model/Feature';

global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.XMLHttpRequest.DONE = 4;
const TIMEOUT = 10000;

describe("Model > Feature", () => {
	describe("Constructor", () => {
		it("creates the object", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], { "t1": "v1" }, "skipped");
			
			assert.equal(f1.id, 1);
			assert.equal(f1.coordinates[0], 48);
			assert.equal(f1.coordinates[1], -1.7);
			assert.equal(f1.properties.t1, "v1");
			assert.equal(f1.status, "skipped");
		});
		
		it("creates the object with defaults values", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], { "t1": "v1" });
			
			assert.equal(f1.id, 1);
			assert.equal(f1.coordinates[0], 48);
			assert.equal(f1.coordinates[1], -1.7);
			assert.equal(f1.properties.t1, "v1");
			assert.equal(f1.status, "new");
		});
		
		it("fails if no ID is given", () => {
			assert.throws(() => {
				const f1 = new Feature(null, [ 48, -1.7 ], { "t1": "v1" });
			}, TypeError);
		});
		
		it("fails if coordinates are not a float array", () => {
			assert.throws(() => {
				const f1 = new Feature(1, "not an array", { "t1": "v1" });
			}, TypeError);
		});
		
		it("fails if coordinates are not of correct length", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 1, 2, 3 ], { "t1": "v1" });
			}, TypeError);
		});
		
		it("fails if status is invalid", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 48, -1.7 ], { "t1": "v1" }, "not a valid status");
			}, TypeError);
		});
	});
	
	describe("get status", () => {
		it("returns status", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], { "t1": "v1" }, "skipped");
			assert.equal(f1.status, "skipped");
		});
	});
	
	describe("getPictures", () => {
		it("returns pictures around feature", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(pictures => {
				assert.ok(pictures.length > 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("caches pictures", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(p1 => {
				assert.ok(p1.length > 0);
				
				f1.getPictures(30)
				.then(p2 => {
					assert.equal(Hash(p1), Hash(p2));
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
		}).timeout(TIMEOUT);
		
		it("re-dl pictures when radius differs", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(10)
			.then(p1 => {
				f1.getPictures(50)
				.then(p2 => {
					assert.ok(p2.length > 0);
					assert.ok(Hash(p1) !== Hash(p2));
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
		}).timeout(TIMEOUT*2);
		
		it("returns empty list if no pictures around", (done) => {
			const f1 = new Feature(1, [ 49.0091, -22.3242 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(pictures => {
				assert.equal(pictures.length, 0);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("isShownOnPicture", () => {
		it("returns false by default", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(pictures => {
				assert.ok(!f1.isShownOnPicture(0));
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("returns true if set", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(pictures => {
				f1.seenOnPicture(0);
				assert.ok(f1.isShownOnPicture(0));
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("fails if no pictures available", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
				f1.isShownOnPicture(0);
			}, TypeError);
		});
	});
	
	describe("set status", () => {
		it("works if status is valid", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], { "t1": "v1" });
			
			assert.equal(f1.status, "new");
			
			f1.status = "nopics";
			
			assert.equal(f1.status, "nopics");
		});
		
		it("fails if status is not valid", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 48, -1.7 ], { "t1": "v1" });
				f1.status = "not a valid status";
			}, TypeError);
		});
	});
	
	describe("seenOnPicture", () => {
		it("sets properly list of pictures", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(pictures => {
				f1.seenOnPicture(0);
				assert.ok(f1.isShownOnPicture(0));
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
		
		it("sets properly list of pictures when disabling", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(pictures => {
				f1.seenOnPicture(0);
				f1.seenOnPicture(0, false);
				assert.ok(!f1.isShownOnPicture(0));
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
	
	describe("asGeoJSON", () => {
		it("returns GeoJSON representation", (done) => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], { "t1": "v1" });
			f1.getPictures(30)
			.then(pictures => {
				f1.seenOnPicture(0);
				
				const res = f1.asGeoJSON();
				assert.equal(res.type, "Feature");
				assert.equal(res.geometry.type, "Point");
				assert.equal(res.geometry.coordinates[0], -1.6760);
				assert.equal(res.geometry.coordinates[1], 48.1294);
				assert.equal(res.properties.t1, "v1");
				assert.equal(res.properties.pictures[0].url, pictures[0].pictureUrl);
				assert.equal(res.properties.pictures[0].details, pictures[0].detailsUrl);
				assert.equal(res.properties.pictures[0].date, (new Date(pictures[0].date)).toISOString());
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT);
	});
});
