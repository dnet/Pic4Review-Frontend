import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom'
import injectTapEventPlugin from 'react-tap-event-plugin';
import BodyComponent from './view/BodyComponent';
import I18n from 'i18nline/lib/i18n';
import OsmAuth from 'osm-auth';
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
		this._initAuth();
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
	 * Initializes authentication system.
	 * @private
	 */
	_initAuth() {
		this.auth = OsmAuth({
			oauth_consumer_key: 'KHkPq0Llu63IWjdchiKALkAcDfJUwqi6GHKM9IY6',
			oauth_secret: 'PWXMH1Ko6vOFFI69wvwv2p9yH8y5Af2cJ8nMkXf0',
			singlepage: true,
			landing: '/',
			auto: true
		});
		
		PubSub.subscribe("UI.LOGIN.SURE", (msg, data) => {
			if(!this.auth.authenticated()) {
				this.auth.authenticate((err, res) => {
					if(err) {
						PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when trying to log you in") });
					}
					else {
						console.log(res);
					}
				});
			}
		});
		
		PubSub.subscribe("UI.LOGOUT.WANTS", (msg, data) => {
			if(this.auth && this.auth.authenticated()) {
				this.auth.logout();
			}
		});
	}
	
	/**
	 * Start DOM rendering
	 * @private
	 */
	_initDomRendering() {
		injectTapEventPlugin();
		render(<HashRouter><BodyComponent /></HashRouter>, document.getElementById('app'));
	}
}

const app = new App();
