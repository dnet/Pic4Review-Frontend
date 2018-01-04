require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { indigo, red } from 'material-ui/colors';
import Alert from './AlertComponent';
import Header from './HeaderComponent';
import LoginDialog from './LoginDialogComponent';
import Missions from './MissionsComponent';
import WaitDialog from './WaitDialogComponent';
import Welcome from './WelcomeComponent';

/**
 * Body component is the main view component of the application.
 */
class BodyComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			page: "welcome"
		};
		
		this.theme = createMuiTheme({
			palette: {
				primary: indigo,
				secondary: red
			}
		});
		
		PubSub.subscribe("UI.PAGE.SHOW", (msg, data) => {
			this.setState({ page: data.page });
		});
	}
	
	render() {
		const styleContent = { margin: "15px 20px" };
		let page = null;
		
		switch(this.state.page) {
			case "missions":
				page = <Missions style={styleContent} />;
				break;
			
			case "welcome":
			default:
				page = <Welcome style={styleContent} />;
				break;
		}
		
		return <MuiThemeProvider theme={this.theme}><div>
			<Header />
			{page}
			
			<Alert />
			<WaitDialog />
			<LoginDialog />
		</div></MuiThemeProvider>;
	}
}

export default BodyComponent;

/**
 * Event sent when some page should be shown to user.
 * @event UI.PAGE.SHOW
 * @type {Object} Event data
 * @property {string} page The page ID (welcome, missions, mission, commonstats, userstats)
 * @memberof Events
 */
