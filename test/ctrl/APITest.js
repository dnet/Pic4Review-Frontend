/*
 * Test script for ctrl/API.js
 */

import assert from 'assert';
import API from '../../src/app/ctrl/API';
import Mission from '../../src/app/model/Mission';

describe.only("Ctrl > API", () => {
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
		});
	});
});
