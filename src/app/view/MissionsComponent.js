import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import MissionsFilters from './MissionsFiltersComponent';
import MissionsList from './MissionsListComponent';
import Typography from 'material-ui/Typography';

/**
 * Missions component is the page displaying list of missions to user.
 * There, user can filter missions, select one in the list, and also go to mission creation page.
 */
class MissionsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			showFilters: true,
			missionsDisplay: "list",
			currentFilters: {},
			missions: null
		};
		
		PubSub.subscribe("UI.MISSIONS.FILTER", (msg, data) => {
			this.setState({ currentFilters: data });
		});
		
		PubSub.subscribe("MISSIONS.READY", (msg, data) => {
			this.setState({ missions: data.missions });
		});
		
		PubSub.publish("UI.MISSIONS.WANTS");
	}
	
	render() {
		let missionsarea = null;
		
		if(this.state.missions) {
			missionsarea = <MissionsList filters={this.state.currentFilters} missions={this.state.missions} />;
		}
		else {
			missionsarea = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return <div style={this.props.style}>
			<Grid container>
				<Grid item hidden={{only: "xs"}} sm={4} md={3} lg={2}>
					<Typography type="subheading">{I18n.t("Filters")}</Typography>
					<MissionsFilters values={this.state.currentFilters} />
				</Grid>
				<Grid item xs={12} sm={8} md={9} lg={10}>
					<Typography type="subheading">{I18n.t("Missions")}</Typography>
					{missionsarea}
				</Grid>
			</Grid>
		</div>;
	}
}

export default MissionsComponent;

/**
 * Event sent when missions are required for display
 * @event UI.MISSIONS.WANTS
 * @memberof Events
 */
