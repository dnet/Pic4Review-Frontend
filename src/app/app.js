import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import DatasetManager from './ctrl/DatasetManager';
import Main from './view/Main';
import I18n from 'i18nline/lib/i18n';
import PubSub from 'pubsub-js';

const LOCALES = [ "en", "fr" ];

/**
 * Application main launcher
 */
class App {
	constructor() {
		//Init controllers
		this.datasetManager = new DatasetManager();
		this.dataset = null;
		
		//Init various systems
		this.initI18n();
		this.initPubSub();
		this.initDomRendering();
	}
	
	/**
	 * Initializes internationalization system
	 */
	initI18n() {
		I18n.locale = window.navigator.userLanguage || window.navigator.language;
		I18n.fallbacks = true;
		
		//Load translation files
		for(const l of LOCALES) {
			Object.assign(I18n.translations, require("../config/locales/"+l+".json"));
		}
		
		window.I18n = I18n;
	}
	
	/**
	 * Initializes publisher/subscriber system
	 */
	initPubSub() {
		/**
		 * PubSub is a system for communicating between objects.
		 * You can publish events and subscribe to listen to other objects events.
		 * @name PubSub
		 */
		window.PubSub = PubSub;
		
		PubSub.subscribe("DATASET.FILE.UPLOADED", (msg, data) => {
			if(data.format == "geojson") {
				this.datasetManager
				.loadGeoJSON(data.file)
				.then(dataset => {
					this.dataset = dataset;
					PubSub.publish("DATASET.READY", this.dataset);
				})
				.catch(e => {
					PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: e.message });
				});
			}
		});
		
		PubSub.subscribe("DATASET.FEATURE", (msg, id) => {
			const msgToStatus = { "DATASET.FEATURE.SKIP": "skip", "DATASET.FEATURE.DONE": "reviewed" };
			this.dataset = this.datasetManager.saveReview(this.dataset);
		});
		
		PubSub.subscribe("DATASET.CLEAR", (msg, id) => {
			this.dataset = this.datasetManager.clearReview(this.dataset);
			PubSub.publish("DATASET.UPDATED", this.dataset);
		});
	}
	
	/**
	 * Start DOM rendering
	 */
	initDomRendering() {
		injectTapEventPlugin();
		render(<Main />, document.getElementById('app'));
	}
}

const app = new App();
