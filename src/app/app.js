import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import BodyComponent from './view/BodyComponent';
import I18n from 'i18nline/lib/i18n';
import MissionManager from './ctrl/MissionManager';
import PubSub from 'pubsub-js';

const LOCALES = [ "en", "fr" ];

/**
 * Application main launcher
 */
class App {
	constructor() {
		/**
		 * Every component of the application is able to send or listen to events through a publish/subscribe system (PubSub).
		 * Available events are documented here. For usage of PubSub methods, see {@link https://github.com/mroderick/PubSubJS|official documentation}.
		 * @name Events
		 */
		window.PubSub = PubSub;
		
		//Init various systems
		this._initI18n();
		this._initMissions();
		this._initDomRendering();
	}
	
	/**
	 * Initializes internationalization system
	 * @private
	 */
	_initI18n() {
		I18n.locale = window.navigator.userLanguage || window.navigator.language;
		I18n.fallbacks = true;
		
		//Load translation files
		for(const l of LOCALES) {
			Object.assign(I18n.translations, require("../config/locales/"+l+".json"));
		}
		
		window.I18n = I18n;
	}
	
	/**
	 * Initializes missions management
	 * @private
	 */
	_initMissions() {
		this.missionManager = new MissionManager();
		
		PubSub.subscribe("UI.MISSIONS.WANTS", (msg, data) => {
			this.missionManager
			.getMissions()
			.then(missions => {
				PubSub.publish("MISSIONS.READY", { missions: missions });
			})
			.catch(e => {
				PubSub.publish("UI.MESSAGE.BASIC", { message: I18n.t("Oops ! Can't get the list of available missions"), type: "error" });
			});
		});
	}
	
// 	/**
// 	 * Initializes publisher/subscriber system
// 	 */
// 	initPubSub() {
// 		/**
// 		 * PubSub is a system for communicating between objects.
// 		 * You can publish events and subscribe to listen to other objects events.
// 		 * @name PubSub
// 		 */
// 		
// 		
// 		PubSub.subscribe("DATASET.FILE.UPLOADED", (msg, data) => {
// 			if(data.format == "geojson") {
// 				this.datasetManager
// 				.loadGeoJSON(data.file)
// 				.then(dataset => {
// 					this.dataset = dataset;
// 					PubSub.publish("DATASET.READY", this.dataset);
// 				})
// 				.catch(e => {
// 					PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: e.message });
// 				});
// 			}
// 		});
// 		
// 		PubSub.subscribe("DATASET.DYNAMIC.DEFINED", (msg, data) => {
// 			if(data.type === "osmose") {
// 				const itemclass = data.options.itemclass.split("-");
// 				const item = itemclass[0];
// 				
// 				this.dataset = new Osmose(item, data.options.amount, { area: data.options.area });
// 				this.timerOsmoseReview = setInterval(() => {
// 					if(!this.dataset.isDownloading && !this.dataset.isGeocoding) {
// 						this.dataset = this.datasetManager.loadReview(this.dataset);
// 						PubSub.publish("DATASET.FEATURE.CHANGED", this.dataset);
// 						
// 						//Stop watching
// 						clearInterval(this.timerOsmoseReview);
// 						delete this.timerOsmoseReview;
// 					}
// 				}, 100);
// 				PubSub.publish("DATASET.READY", this.dataset);
// 			}
// 		});
// 		
// 		PubSub.subscribe("DATASET.FEATURE.CHANGED", (msg, id) => {
// 			this.dataset = this.datasetManager.saveReview(this.dataset);
// 		});
// 		
// 		PubSub.subscribe("DATASET.CLEAR", (msg, id) => {
// 			this.dataset = this.datasetManager.clearReview(this.dataset);
// 			PubSub.publish("DATASET.UPDATED", this.dataset);
// 		});
// 	}
	
	/**
	 * Start DOM rendering
	 * @private
	 */
	_initDomRendering() {
		injectTapEventPlugin();
		render(<BodyComponent />, document.getElementById('app'));
	}
}

const app = new App();

/**
 * Event sent when missions are ready to use
 * @event MISSIONS.READY
 * @type {Object} Event data
 * @property {Mission[]} missions The list of missions
 * @memberof Events
 */
