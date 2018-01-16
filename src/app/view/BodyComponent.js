require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { indigo, red, grey } from 'material-ui/colors';
import { Switch, Route } from 'react-router-dom';
import Alert from './AlertComponent';
import Header from './HeaderComponent';
import LoginDialog from './LoginDialogComponent';
import Mission from './MissionComponent';
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
			page: "welcome",
			pageData: null
		};
		
		this.theme = createMuiTheme({
			palette: {
				primary: {
					light: indigo[300],
					main: indigo[500],
					dark: indigo[700],
					contrastText: grey[50]
				},
				secondary: {
					light: red[300],
					main: red[500],
					dark: red[700],
					contrastText: grey[50]
				},
				error: red[400]
			}
		});
		
		PubSub.subscribe("UI.PAGE.SHOW", (msg, data) => {
			this.setState({ page: data.page, pageData: data });
		});
	}
	
	render() {
		const styleContent = { margin: "15px 20px" };
		let page = null;
		
		switch(this.state.page) {
			case "missions":
				page = <Missions style={styleContent} />;
				break;
			
			case "mission":
				page = <Mission style={styleContent} mission={this.state.pageData.mission} tab={this.state.pageData.tab} />;
				break;
			
			case "welcome":
			default:
				page = <Welcome style={styleContent} />;
				break;
		}
		
		return <MuiThemeProvider theme={this.theme}><div>
			<Header />
			
			<Switch>
				<Route exact path='/' component={Welcome} />
				<Route path='/missions' component={Missions} />
			</Switch>
			
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
