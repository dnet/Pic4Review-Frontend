/*
 * Test script for model/Mission.js
 */

import assert from 'assert';
import GeoJSON from '../../src/app/model/dataset/GeoJSON.js';
import P4C from 'pic4carto';
import Mission from '../../src/app/model/Mission.js';

const AREA = { name: "Rennes, France", bbox: new P4C.LatLngBounds(new P4C.LatLng(48.0758, -1.7245), new P4C.LatLng(48.1514, -1.5995)) };
const GJ1 = '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -13.9526 , 47.9016 ] } }, { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -1.6832758, 48.12771 ] } }, { "type": "Feature", "properties": { "highway": "traffic_signals" }, "geometry": { "type": "Point", "coordinates": [ -1.6831709, 48.1277262 ] } } ] }';
const G1 = new GeoJSON(GJ1);

describe("Model > Mission", () => {
	describe("Constructor", () => {
		it("creates the object", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.equal(m1.type, "integrate");
			assert.equal(m1.theme, "amenity");
			assert.equal(m1.dataset, G1);
			assert.equal(m1.area.name, AREA.name);
			assert.ok(m1.area.bbox.equals(AREA.bbox));
		});
		
		it("doesn't allow rewrite type", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.throws(() => { m1.type = "test"; }, TypeError);
		});
		
		it("doesn't allow rewrite theme", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.throws(() => { m1.theme = "test"; }, TypeError);
		});
		
		it("doesn't allow rewrite dataset", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.throws(() => { m1.dataset = "test"; }, TypeError);
		});
		
		it("doesn't allow rewrite area", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.throws(() => { m1.area = "test"; }, TypeError);
		});
		
		it("fails if no type is defined", () => {
			assert.throws(() => { new Mission(null, "amenity", G1, AREA); }, TypeError);
		});
		
		it("fails if type is invalid", () => {
			assert.throws(() => { new Mission("not a valid type", "amenity", G1, AREA); }, TypeError);
		});
		
		it("fails if no theme is defined", () => {
			assert.throws(() => { new Mission("fix", null, G1, AREA); }, TypeError);
		});
		
		it("fails if theme is invalid", () => {
			assert.throws(() => { new Mission("fix", "not a valid theme", G1, AREA); }, TypeError);
		});
		
		it("fails if dataset is invalid", () => {
			assert.throws(() => { new Mission("fix", "amenity", {}, AREA); }, TypeError);
		});
		
		it("fails if area is invalid", () => {
			assert.throws(() => { new Mission("fix", "amenity", G1, {}); }, TypeError);
		});
	});
	
	describe("passFilter", () => {
		it("works with empty filters", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.ok(m1.passFilter({}));
		});
		
		it("works with empty string filters", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.ok(m1.passFilter({ theme: "" }));
		});
		
		it("works with non empty filters and meets criterias", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.ok(m1.passFilter({ type: "integrate", theme: "amenity" }));
		});
		
		it("works with non empty filters and meets criterias on single filter", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.ok(m1.passFilter({ type: "integrate" }));
		});
		
		it("works with non empty filters and doesnt meet criterias", () => {
			const m1 = new Mission("integrate", "amenity", G1, AREA);
			assert.ok(!m1.passFilter({ type: "fix", theme: "amenity" }));
		});
	});
});
