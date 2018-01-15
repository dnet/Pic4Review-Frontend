/*
 * Test script for model/Mission.js
 */

import assert from 'assert';
import P4C from 'pic4carto';
import Mission from '../../src/app/model/Mission.js';

const AREA = { name: "Rennes, France", bbox: new P4C.LatLngBounds(new P4C.LatLng(48.0758, -1.7245), new P4C.LatLng(48.1514, -1.5995)) };
const DESC = { short: "Add those toilets in OSM", full: "Add the toilets from official source into OpenStreetMap. Please create a point following wiki doc." };

describe("Model > Mission", () => {
	describe("Constructor", () => {
		it("creates the object", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.equal(m1.type, "integrate");
			assert.equal(m1.theme, "amenity");
			assert.equal(m1.area.name, AREA.name);
			assert.ok(m1.area.bbox.equals(AREA.bbox));
		});
		
		it("doesn't allow rewrite type", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.throws(() => { m1.type = "test"; }, TypeError);
		});
		
		it("doesn't allow rewrite theme", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.throws(() => { m1.theme = "test"; }, TypeError);
		});
		
		it("doesn't allow rewrite area", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.throws(() => { m1.area = "test"; }, TypeError);
		});
		
		it("allows rewrite features", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.equal(m1.features, null);
			m1.features = [ "test" ];
			assert.equal(m1.features.length, 1);
		});
		
		it("fails if no type is defined", () => {
			assert.throws(() => { new Mission(null, "amenity", AREA, DESC); }, TypeError);
		});
		
		it("fails if type is invalid", () => {
			assert.throws(() => { new Mission("not a valid type", "amenity", AREA, DESC); }, TypeError);
		});
		
		it("fails if no theme is defined", () => {
			assert.throws(() => { new Mission("fix", null, AREA, DESC); }, TypeError);
		});
		
		it("fails if theme is invalid", () => {
			assert.throws(() => { new Mission("fix", "not a valid theme", AREA, DESC); }, TypeError);
		});
		
		it("fails if area is invalid", () => {
			assert.throws(() => { new Mission("fix", "amenity", {}); }, TypeError);
		});
		
		it("fails if no short description is defined", () => {
			assert.throws(() => { new Mission("fix", "amenity", AREA, {}); }, TypeError);
		});
	});
	
	describe("CreateFromAPI", () => {
		it("works with synthetic response", () => {
			const m1 = Mission.CreateFromAPI({
				"id":"1",
				"type":"integrate",
				"theme":"amenity",
				"areaname":"Rennes, France, Europe",
				"shortdesc":"Missing toilets"
			});
			
			assert.equal(m1.type, "integrate");
			assert.equal(m1.theme, "amenity");
			assert.equal(m1.area.name, "Rennes, France, Europe");
			assert.equal(m1.description.short, "Missing toilets");
		});
		
		it("works with full response", () => {
			const m1 = Mission.CreateFromAPI({
				"id":"1",
				"type":"integrate",
				"theme":"amenity",
				"areaname":"Rennes, France, Europe",
				"shortdesc":"Missing toilets",
				"fulldesc":"These toilets are known from an official source, but are missing in OpenStreetMap. Please add them using one of the editors (iD or JOSM), following [documentation](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dtoilets), if you are able to see them in pictures.",
				"geom":{
					"type":"Polygon",
					"coordinates":[[
						[-1.7525876,48.0769155],
						[-1.6244045,48.0769155],
						[-1.6244045,48.1549705],
						[-1.7525876,48.1549705],
						[-1.7525876,48.0769155]
					]]
				}
			});
			
			assert.equal(m1.type, "integrate");
			assert.equal(m1.theme, "amenity");
			assert.equal(m1.area.name, "Rennes, France, Europe");
			assert.equal(m1.description.short, "Missing toilets");
			assert.ok(m1.description.full.startsWith("These toilets"));
			assert.equal(m1.area.bbox.getSouth(), 48.0769155);
		});
	});
	
	describe("passFilter", () => {
		it("works with empty filters", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.ok(m1.passFilter({}));
		});
		
		it("works with empty string filters", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.ok(m1.passFilter({ theme: "" }));
		});
		
		it("works with non empty filters and meets criterias", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.ok(m1.passFilter({ type: "integrate", theme: "amenity" }));
		});
		
		it("works with non empty filters and meets criterias on single filter", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.ok(m1.passFilter({ type: "integrate" }));
		});
		
		it("works with non empty filters and doesnt meet criterias", () => {
			const m1 = new Mission("integrate", "amenity", AREA, DESC);
			assert.ok(!m1.passFilter({ type: "fix", theme: "amenity" }));
		});
	});
});
