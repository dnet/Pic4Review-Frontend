/*
 * Test script for model/Feature.js
 */

import assert from 'assert';
import Feature from '../../src/app/model/Feature';

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
});
