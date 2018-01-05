/*
 * Test script for ctrl/MissionManager.js
 */

import assert from 'assert';
import Mission from '../../src/app/model/Mission';
import MissionManager from '../../src/app/ctrl/MissionManager';

describe("Ctrl > MissionManager", () => {
	describe("Constructor", () => {
		it("works", () => {
			const mm1 = new MissionManager();
			assert.ok(mm1 instanceof MissionManager);
		});
	});
	
	describe("getMissions", () => {
		it("retrieves correctly missions first time", done => {
			const mm1 = new MissionManager();
			
			mm1.getMissions()
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
		});
		
		it("retrieves correctly missions second time", done => {
			const mm1 = new MissionManager();
			
			mm1.getMissions()
			.then(m1 => {
				mm1.getMissions()
				.then(m2 => {
					assert.ok(m2.length > 0);
					assert.equal(m1, m2);
					m2.forEach(m => {
						assert.ok(m instanceof Mission);
					});
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
		});
	});
});
