import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import DatasetManager from './ctrl/DatasetManager';
import Main from './view/Main';
import I18n from 'i18nline/lib/i18n';
import PubSub from 'pubsub-js';

const LOCALES = [ "en" ];

/**
 * Application main launcher
 */
class App {
	constructor() {
		//Init controllers
		this.datasetManager = new DatasetManager();
		
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
		window.PubSub = PubSub;
		
		PubSub.subscribe("DATASET.FILE.UPLOADED", (msg, data) => {
			if(data.format == "geojson") {
				this.datasetManager
				.readGeoJSON(data.file)
				.then(geojson => {
					PubSub.publish("DATASET.READY", { type: "geojson", data: geojson });
				})
				.catch(e => {
					PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: e.message });
				});
			}
		});
		
		PubSub.subscribe("DATASET.READY", (msg, data) => {
			PubSub.publish("UI.TAB.SHOW", "summary");
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
