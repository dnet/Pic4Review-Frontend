import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Car, Cart, Cctv, CupWater, Download, PineTree, TagPlus, Wrench, SubwayVariant, HelpCircle, WheelchairAccessibility } from 'mdi-material-ui';
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
		this._initGlobalVars();
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
			PubSub.publish("USER.INFO.READY", this.user);
		});
		
		PubSub.subscribe("USER.INFO.WANTS", (msg, data) => {
			PubSub.publish("USER.INFO.READY", this.user);
		});
	}
	
	/**
	 * Creates some global variables (needing I18n)
	 * @private
	 */
	_initGlobalVars() {
		window.TYPES = {
			integrate: { name: I18n.t("Integrate new data"), icon: <Download /> },
			fix: { name: I18n.t("Fix existing data"), icon: <Wrench /> },
			improve: { name: I18n.t("Augment existing data"), icon: <TagPlus /> }
		};
		
		window.THEMES = {
			accessibility: { name: I18n.t("Accessibility"), color: "#1BA39C", icon: <WheelchairAccessibility /> },
			amenity: { name: I18n.t("Amenity"), color: "#F5D76E", icon: <CupWater /> },
			equipment: { name: I18n.t("Equipment"), color: "#96281B", icon: <Cctv /> },
			nature: { name: I18n.t("Nature"), color: "#26A65B", icon: <PineTree /> },
			shop: { name: I18n.t("Shop"), color: "#674172", icon: <Cart /> },
			transport: { name: I18n.t("Transport"), color: "#2574A9", icon: <SubwayVariant /> },
			road: { name: I18n.t("Road"), color: "#22313F", icon: <Car /> },
			other: { name: I18n.t("Other"), color: "#6C7A89", icon: <HelpCircle /> }
		};
		
		window.STATUSES = {
			"new": { name: I18n.t("To review"), color: "grey", priority: 1 },
			reviewed: { name: I18n.t("Reviewed"), color: "green", priority: 4 },
			skipped: { name: I18n.t("Skipped"), color: "orange", priority: 2 },
			nopics: { name: I18n.t("No pictures"), color: "blue", priority: 0 },
			cantsee: { name: I18n.t("Can't see"), color: "red", priority: 3 }
		};
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

/**
 * Event to ask for user data
 * @event USER.INFO.WANTS
 * @memberof Events
 */

/**
 * Event in response to {@link Events#USER.INFO.WANTS|USER.INFO.WANTS}
 * @event USER.INFO.READY
 * @type {Object} Event data
 * @property {string} name The user name
 * @property {int} id The user ID
 * @memberof Events
 */
