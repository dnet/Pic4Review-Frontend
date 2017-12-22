/*
 * Test script for model/dataset/GeoJSON.js
 */

import assert from 'assert';
import Feature from '../../../src/app/model/Feature';
import GeoJSON from '../../../src/app/model/dataset/GeoJSON';

const TIMEOUT = 10000;
const GJ1 = '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -13.9526 , 47.9016 ] } }, { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -1.6832758, 48.12771 ] } }, { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -1.6831709, 48.1277262 ] } } ] }';

describe("Model > Dataset > GeoJSON", () => {
	describe("Constructor", () => {
		it("works with valid GeoJSON data", () => {
			const g1 = new GeoJSON(GJ1);
			assert.equal(g1.features.length, 3);
			
			g1.features.forEach(f => {
				assert.ok(f instanceof Feature);
				assert.equal(f.properties.highway, "traffic_signals");
				assert.equal(f.status, "new");
			});
		});
		
		it("fails if no data provided", () => {
			assert.throws(() => {
				const g1 = new GeoJSON();
			}, TypeError);
		});
		
		it("fails if not a GeoJSON feature collection", () => {
			assert.throws(() => {
				const g1 = new GeoJSON('{ "type": "Feature" }');
			}, TypeError);
		});
		
		it("fails if GeoJSON has no features", () => {
			assert.throws(() => {
				const g1 = new GeoJSON('{ "type": "FeatureCollection", "features": [] }');
			}, TypeError);
		});
		
		it("fails if GeoJSON has not point-based features", () => {
			assert.throws(() => {
				const g1 = new GeoJSON('{ "type": "FeatureCollection", "features": [ { "type": "Feature","geometry": {"type": "LineString","coordinates": [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]}} ] }');
			}, TypeError);
		});
	});
	
	describe("getNextFeature", () => {
		it("returns first feature having pictures", done => {
			const g1 = new GeoJSON(GJ1);
			g1.getNextFeature()
			.then(f => {
				assert.ok(f !== null);
				assert.equal(f.coordinates[0], 48.12771);
				assert.equal(f.coordinates[1], -1.6832758);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT*2);
		
		it("returns first unreviewed picture", done => {
			const g1 = new GeoJSON(GJ1);
			g1.features[1].status = "reviewed";
			
			g1.getNextFeature()
			.then(f => {
				assert.equal(f.coordinates[0], 48.1277262);
				assert.equal(f.coordinates[1], -1.6831709);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT*3);
		
		it("returns null when no more feature can be reviewed", done => {
			const g1 = new GeoJSON(GJ1);
			g1.features.forEach(f => { f.status = "reviewed"; });
			
			g1.getNextFeature()
			.then(f => {
				assert.equal(f, null);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		});
		
		it("returns past features if status changed", done => {
			const g1 = new GeoJSON(GJ1);
			
			g1.getNextFeature()
			.then(f => {
				g1.getNextFeature()
				.then(f2 => {
					//Edit first feature
					g1.features[1].status = "new";
					
					//Get again next feature
					g1.getNextFeature()
					.then(f3 => {
						assert.equal(f3, f);
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
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT*3);
	});
	
	describe("isDynamic", () => {
		it("works", () => {
			const g1 = new GeoJSON(GJ1);
			assert.ok(!g1.isDynamic());
		});
	});
});
