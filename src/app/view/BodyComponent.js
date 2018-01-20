require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
require("leaflet_geocoder_css");
require("leaflet_geocoder_throbber");
require("leaflet_geocoder_icon");
require("leaflet_cluster_css");
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { indigo, red, grey } from 'material-ui/colors';
import { Switch, Route } from 'react-router-dom';
import Alert from './AlertComponent';
import Authorize from './AuthorizeComponent';
import Header from './HeaderComponent';
import LoginDialog from './LoginDialogComponent';
import Mission from './mission/MissionComponent';
import Missions from './mission/MissionsComponent';
import MyStatistics from './MyStatisticsComponent';
import NewMission from './mission/new/NewMissionComponent';
import Statistics from './StatisticsComponent';
import WaitDialog from './WaitDialogComponent';
import Welcome from './WelcomeComponent';

/**
 * Body component is the main view component of the application.
 */
class BodyComponent extends Component {
	constructor() {
		super();
		
		this.theme = createMuiTheme({
			palette: {
				primary: {
					light: indigo[300],
					main: indigo[500],
					dark: indigo[700],
					contrastText: grey[50]
				},
				secondary: {
					light: red[400],
					main: red[600],
					dark: red[900],
					contrastText: grey[50]
				},
				error: red[400]
			}
		});
	}
	
	render() {
		return <MuiThemeProvider theme={this.theme}><div>
			<Header />
			
			<div style={{margin: "15px 20px"}}>
				<Switch>
					<Route exact path='/' component={Welcome} />
					<Route exact path='/missions' component={Missions} />
					<Route exact path='/mission/new' component={Authorize.For(NewMission)} />
					<Route exact path='/mission/:mid' component={Mission} />
					<Route exact path='/mission/:mid/:page' component={Authorize.For(Mission)} />
					<Route exact path='/my/statistics' component={Authorize.For(MyStatistics)} />
					<Route exact path='/statistics' component={Statistics} />
				</Switch>
			</div>
			
			<Alert />
			<WaitDialog />
			<LoginDialog />
		</div></MuiThemeProvider>;
	}
}

export default BodyComponent;
