import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import MissionsFilters from './MissionsFiltersComponent';

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
			currentFilters: {}
		};
		
		PubSub.subscribe("UI.MISSIONS.FILTER", (msg, data) => {
			this.setState({ currentFilters: data });
		});
	}
	
	render() {
		return <div style={this.props.style}>
			<Grid container>
				<Grid item hidden={{only: "xs"}} sm={4} md={3} lg={2}>
					<MissionsFilters values={this.state.currentFilters} />
				</Grid>
				<Grid item xs={12} sm={8} md={9} lg={10}>
					{Object.entries(this.state.currentFilters).join(" - ")}
				</Grid>
			</Grid>
		</div>;
	}
}

export default MissionsComponent;
