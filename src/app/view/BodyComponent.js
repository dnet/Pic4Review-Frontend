require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { indigo, red } from 'material-ui/colors';
import Alert from './AlertComponent';
import WaitDialog from './WaitDialogComponent';

/**
 * Body component is the main view component of the application.
 */
class BodyComponent extends Component {
	constructor() {
		super();
		
		this.theme = createMuiTheme({
			palette: {
				primary: indigo,
				secondary: red
			}
		});
	}
	
	render() {
		return <MuiThemeProvider theme={this.theme}><div>
			<Alert />
			<WaitDialog />
		</div></MuiThemeProvider>;
	}
}

export default BodyComponent;
