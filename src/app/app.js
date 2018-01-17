import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom'
import injectTapEventPlugin from 'react-tap-event-plugin';
import BodyComponent from './view/BodyComponent';
import CONSTS from './constants';
import I18n from 'i18nline/lib/i18n';
import OsmAuth from 'osm-auth';
import PubSub from 'pubsub-js';

const LOCALES = [ "en", "fr" ];

const readURLParams = str => {
	const u = str.split('?');
	
	if(u.length > 1) {
		const p = u[1].split('#')[0];
		
		return p.split('&').filter(function (pair) {
			return pair !== '';
		}).reduce(function(obj, pair){
			var parts = pair.split('=');
			obj[decodeURIComponent(parts[0])] = (null === parts[1]) ?
				'' : decodeURIComponent(parts[1]);
			return obj;
		}, {});
	}
	else {
		return {};
	}
};

/**
 * Application main launcher
 */
class App {
	constructor() {
		/*
		 * Auth
		 */
		const params = readURLParams(window.location.href);
		
		if(params.oauth_token && opener) {
			opener.authComplete(window.location.href);
			window.close();
		}
		
		
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
			oauth_consumer_key: CONSTS.OAUTH_CONSUMER_KEY,
			oauth_secret: CONSTS.OAUTH_SECRET,
			landing: '/'
		});
		
		//Check if we receive auth token
		this._checkAuth();
		this.authWait = setInterval(this._checkAuth.bind(this), 100);
		
		PubSub.subscribe("UI.LOGIN.SURE", (msg, data) => {
			if(!this.auth.authenticated()) {
				this.auth.authenticate((err, res) => {
					if(err) {
						PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when trying to log you in") });
					}
					else {
						this._checkAuth();
					}
				});
			}
		});
		
		PubSub.subscribe("UI.LOGOUT.WANTS", (msg, data) => {
			if(this.auth && this.auth.authenticated()) {
				this.auth.logout();
			}
			
			this.user = null;
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
	
	/**
	 * Check if authentication happened
	 * @private
	 */
	_checkAuth() {
		if(this.auth.authenticated()) {
			if(this.authWait) {
				clearInterval(this.authWait);
			}
			
			//Get user details
			this.auth.xhr({
				method: 'GET',
				path: '/api/0.6/user/details'
			}, (err, details) => {
				if(err) {
					console.log(err);
				}
				else {
					try {
						this.user = {
							id: details.firstChild.childNodes[1].attributes.id.value,
							name: details.firstChild.childNodes[1].attributes.display_name.value
						};
						
						PubSub.publish("UI.LOGIN.DONE", { username: this.user.name });
					}
					catch(e) {
						console.error(e);
						PubSub.publish("UI.LOGOUT.WANTS");
					}
				}
			});
		}
	}
}

const app = new App();
