/*
 * Test script for model/Dataset.js
 */

import assert from 'assert';
import Dataset from '../../src/app/model/Dataset';
import Feature from '../../src/app/model/Feature';

class Datatest1 extends Dataset {
	constructor() {
		super();
		this.features = [
			new Feature(1, [ 48.12771, -1.6832758 ]),
			new Feature(2, [ 48.12771, -1.6832758 ]),
			new Feature(3, [ 48.12771, -1.6832758 ])
		];
		
		this.features.forEach(f => {
			f.pictures = [ { pictureUrl: "" } ];
		});
	}
	
	getNextFeature() {
		return new Promise(resolve => {
			const nextFtId = this.currentFeatureId === null ? 0 : this.currentFeatureId + 1;
			if(this.features.length > nextFtId) {
				this.lastFeatureId = this.currentFeatureId;
				this.currentFeatureId = nextFtId;
				resolve(this.features[nextFtId]);
			}
			else {
				resolve(null);
			}
		});
	}
	
	getProgress() {
		return this._getProgressNotDynamic();
	}
	
	isDynamic() {
		return false;
	}
	
	updateCurrentFeature(status, seenOnPictures) {
		return this._updateCurrentFeatureNotDynamic(status, seenOnPictures);
	}
}

class Datatest2 extends Dataset {
	constructor() {
		super();
		this.features = [ { id: 1 }, { id: 2 }, { id: 3 } ];
	}
}

describe("Model > Dataset", () => {
	describe("Constructor", () => {
		it("can't be instantiated directly", () => {
			assert.throws(() => {
				const d1 = new Dataset();
			}, TypeError);
		});
		
		it("works for subclass", () => {
			const d1 = new Datatest1();
			assert.ok(Array.isArray(d1.features));
			assert.equal(d1.features.length, 3);
			assert.equal(d1.lastFeatureId, null);
			assert.equal(d1.currentFeatureId, null);
		});
	});
	
	describe("getNextFeature", () => {
		it("can't be called directly", () => {
			assert.throws(() => {
				const d1 = new Datatest2();
				d1.getNextFeature();
			}, TypeError);
		});
		
		it("works for subclass", (done) => {
			const d1 = new Datatest1();
			d1.getNextFeature()
			.then(f => {
				assert.equal(f.id, 1);
				assert.equal(d1.currentFeatureId, 0);
				assert.equal(d1.lastFeatureId, null);
				
				d1.getNextFeature()
				.then(f2 => {
					assert.equal(f2.id, 2);
					assert.equal(d1.currentFeatureId, 1);
					assert.equal(d1.lastFeatureId, 0);
					
					d1.getNextFeature()
					.then(f3 => {
						assert.equal(f3.id, 3);
						assert.equal(d1.currentFeatureId, 2);
						assert.equal(d1.lastFeatureId, 1);
						
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
		});
	});
	
	describe("getPreviousFeature", () => {
		it("works for subclass", (done) => {
			const d1 = new Datatest1();
			
			d1.getNextFeature()
			.then(d1.getNextFeature.bind(d1))
			.then(f2 => {
				const pf = d1.getPreviousFeature();
				assert.equal(pf.id, 1);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		});
		
		it("returns null if first item", () => {
			const d1 = new Datatest1();
			assert.equal(d1.getPreviousFeature(), null);
		});
	});
	
	describe("getProgress", () => {
		it("can't be called directly", () => {
			assert.throws(() => {
				const d1 = new Datatest2();
				d1.getProgress();
			}, TypeError);
		});
		
		it("works for subclass", (done) => {
			const d1 = new Datatest1();
			assert.equal(d1.getProgress(), 0);
			d1.getNextFeature()
			.then(f => {
				assert.equal(d1.getProgress(), 1/3*100);
				done();
			})
			.catch(e => {
				assert.fail(e);
				done();
			});
		});
	});
	
	describe("getAllFeatures", () => {
		it("works for subclass", () => {
			const d1 = new Datatest1();
			const res = d1.getAllFeatures();
			assert.equal(res[0].id, 1);
			assert.equal(res[1].id, 2);
			assert.equal(res[2].id, 3);
		});
	});
	
	describe("isDynamic", () => {
		it("can't be called directly", () => {
			assert.throws(() => {
				const d1 = new Datatest2();
				d1.isDynamic();
			}, TypeError);
		});
		
		it("works for subclass", () => {
			const d1 = new Datatest1();
			assert.ok(!d1.isDynamic());
		});
	});
	
	describe("updateCurrentFeature", () => {
		it("can't be called directly", () => {
			assert.throws(() => {
				const d1 = new Datatest2();
				d1.updateCurrentFeature();
			}, TypeError);
		});
		
		it("works for subclass", done => {
			const d1 = new Datatest1();
			
			d1.getNextFeature()
			.then(f => {
				d1.updateCurrentFeature("skipped", { "0": true })
				.then(() => {
					assert.equal(f.status, "skipped");
					assert.ok(f.isShownOnPicture(0));
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
		
		it("dont change status if not specified", done => {
			const d1 = new Datatest1();
			
			d1.getNextFeature()
			.then(f => {
				const prev = f.status;
				d1.updateCurrentFeature(null, { "0": true })
				.then(() => {
					assert.equal(f.status, prev);
					assert.ok(f.isShownOnPicture(0));
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
		
		it("fails if no current feature", done => {
			const d1 = new Datatest1();
			
			d1.updateCurrentFeature("skipped", { "0": true })
			.then(() => {
				assert.fail("should not succeed");
				done();
			})
			.catch(e => {
				assert.equal(e.message, "Feature is unknown");
				done();
			});
		});
	});
});
