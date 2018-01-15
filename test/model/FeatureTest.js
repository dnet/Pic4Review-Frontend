/*
 * Test script for model/Feature.js
 */

import assert from 'assert';
import Hash from 'object-hash';
import Feature from '../../src/app/model/Feature';
import P4C from 'pic4carto';

const pic1 = new P4C.Picture("http://data.net/pic.jpg", 1000, new P4C.LatLng(0.1,0.1), "Custom");

describe("Model > Feature", () => {
	describe("Constructor", () => {
		it("creates the object", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], [ pic1 ], { "t1": "v1" }, "skipped");
			
			assert.equal(f1.id, 1);
			assert.equal(f1.coordinates[0], 48);
			assert.equal(f1.coordinates[1], -1.7);
			assert.equal(f1.properties.t1, "v1");
			assert.equal(f1.status, "skipped");
			assert.equal(f1.pictures.length, 1);
		});
		
		it("creates the object with defaults values", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], null, { "t1": "v1" });
			
			assert.equal(f1.id, 1);
			assert.equal(f1.coordinates[0], 48);
			assert.equal(f1.coordinates[1], -1.7);
			assert.equal(f1.properties.t1, "v1");
			assert.equal(f1.status, "new");
			assert.equal(f1.pictures, null);
		});
		
		it("fails if no ID is given", () => {
			assert.throws(() => {
				const f1 = new Feature(null, [ 48, -1.7 ], [ pic1 ], { "t1": "v1" });
			}, TypeError);
		});
		
		it("fails if coordinates are not a float array", () => {
			assert.throws(() => {
				const f1 = new Feature(1, "not an array", [ pic1 ], { "t1": "v1" });
			}, TypeError);
		});
		
		it("fails if coordinates are not of correct length", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 1, 2, 3 ], [ pic1 ], { "t1": "v1" });
			}, TypeError);
		});
		
		it("fails if status is invalid", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 48, -1.7 ], [ pic1 ], { "t1": "v1" }, "not a valid status");
			}, TypeError);
		});
	});
	
	describe("get status", () => {
		it("returns status", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], [ pic1 ], { "t1": "v1" }, "skipped");
			assert.equal(f1.status, "skipped");
		});
	});
	
	describe("pictures", () => {
		it("returns pictures", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], [ pic1 ], { "t1": "v1" }, "skipped");
			const pics = f1.pictures;
			assert.equal(pics[0], pic1);
		});
		
		it("returns null if no pictures", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], [], { "t1": "v1" }, "skipped");
			const pics = f1.pictures;
			assert.equal(pics, null);
		});
	});
	
	describe("isShownOnPicture", () => {
		it("returns false by default", () => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], [ pic1 ], { "t1": "v1" });
			assert.ok(!f1.isShownOnPicture(0));
		});
		
		it("returns true if set", () => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], [ pic1 ], { "t1": "v1" });
			f1.seenOnPicture(0);
			assert.ok(f1.isShownOnPicture(0));
		});
		
		it("fails if no pictures available", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 48.1294, -1.6760 ], [ ], { "t1": "v1" });
				f1.isShownOnPicture(0);
			}, TypeError);
		});
	});
	
	describe("set status", () => {
		it("works if status is valid", () => {
			const f1 = new Feature(1, [ 48, -1.7 ], [ pic1 ], { "t1": "v1" });
			
			assert.equal(f1.status, "new");
			
			f1.status = "nopics";
			
			assert.equal(f1.status, "nopics");
		});
		
		it("fails if status is not valid", () => {
			assert.throws(() => {
				const f1 = new Feature(1, [ 48, -1.7 ], [ pic1 ], { "t1": "v1" });
				f1.status = "not a valid status";
			}, TypeError);
		});
	});
	
	describe("seenOnPicture", () => {
		it("sets properly list of pictures", () => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], [ pic1 ], { "t1": "v1" });
			
			f1.seenOnPicture(0);
			assert.ok(f1.isShownOnPicture(0));
		});
		
		it("sets properly list of pictures when disabling", () => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], [ pic1 ], { "t1": "v1" });
			
			f1.seenOnPicture(0);
			f1.seenOnPicture(0, false);
			assert.ok(!f1.isShownOnPicture(0));
		});
	});
	
	describe("asGeoJSON", () => {
		it("returns GeoJSON representation", () => {
			const f1 = new Feature(1, [ 48.1294, -1.6760 ], [ pic1 ], { "t1": "v1" });
			
			f1.seenOnPicture(0);
			
			const res = f1.asGeoJSON();
			assert.equal(res.type, "Feature");
			assert.equal(res.geometry.type, "Point");
			assert.equal(res.geometry.coordinates[0], -1.6760);
			assert.equal(res.geometry.coordinates[1], 48.1294);
			assert.equal(res.properties.t1, "v1");
			assert.equal(res.properties.pictures[0].url, pic1.pictureUrl);
			assert.equal(res.properties.pictures[0].details, pic1.detailsUrl);
			assert.equal(res.properties.pictures[0].date, (new Date(pic1.date)).toISOString());
		});
	});
});
