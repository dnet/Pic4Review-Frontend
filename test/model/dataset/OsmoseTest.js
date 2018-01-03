/*
 * Test script for model/dataset/Osmose.js
 */

import assert from 'assert';
import Osmose from '../../../src/app/model/dataset/Osmose';

const TIMEOUT = 10000;
global.PubSub = null;

describe("Model > Dataset > Osmose", () => {
	describe("Constructor", () => {
		it("works with valid parameters", () => {
			const d1 = new Osmose(1070, 10);
			assert.equal(d1.searchOptions.item, 1070);
			assert.equal(d1.searchOptions.limit, 10);
		});
		
		it("fails if no item ID is given", () => {
			assert.throws(() => {
				new Osmose();
			}, TypeError);
		});
		
		it("fails if no amount is given", () => {
			assert.throws(() => {
				new Osmose(1070);
			}, TypeError);
		});
	});
	
	describe("getId", () => {
		it("returns ID", () => {
			const d1 = new Osmose(1070, 10);
			assert.ok(d1.getId().length > 0);
		});
	});
	
	describe("getNextFeature", () => {
		it("returns first feature having pictures", done => {
			const d1 = new Osmose(3230, 10, { bbox: "2.2556,48.8141,2.4184,48.9022" });
			d1.getNextFeature()
			.then(f => {
				assert.ok(f !== null);
				assert.ok(!isNaN(f.coordinates[0]));
				assert.ok(!isNaN(f.coordinates[1]));
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT*3);
		
		it.skip("returns first feature having pictures when searching in given area", done => {
			const d1 = new Osmose(3230, 10, { area: "rennes, france" });
			d1.getNextFeature()
			.then(f => {
				assert.ok(f !== null);
				assert.ok(!isNaN(f.coordinates[0]));
				assert.ok(!isNaN(f.coordinates[1]));
				
				assert.ok(f.coordinates[0] >= 48.0769155);
				assert.ok(f.coordinates[0] <= 48.1549705);
				assert.ok(f.coordinates[1] >= -1.7525876);
				assert.ok(f.coordinates[1] <= -1.6244045);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		}).timeout(TIMEOUT*3);
	});
	
	describe("isDynamic", () => {
		it("works", () => {
			const d1 = new Osmose(1070, 10);
			assert.ok(d1.isDynamic());
		});
	});
});
