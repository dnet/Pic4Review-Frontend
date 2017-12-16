import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './Main';
import I18n from 'i18nline/lib/i18n';

const LOCALES = [ "en" ];

/**
 * Application main launcher
 */

/*
 * Internationalization
 */

I18n.locale = window.navigator.userLanguage || window.navigator.language;
I18n.fallbacks = true;

//Load translation files
for(const l of LOCALES) {
	Object.assign(I18n.translations, require("../config/locales/"+l+".json"));
}

window.I18n = I18n;


/*
 * Component rendering
 */

injectTapEventPlugin();
render(<Main />, document.getElementById('app'));
