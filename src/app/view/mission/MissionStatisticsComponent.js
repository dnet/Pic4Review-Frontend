import React, { Component } from 'react';
import API from '../../ctrl/API';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Time from './MissionStatisticsTimeComponent';
import Score from '../UsersScoreComponent';
import Status from './MissionStatisticsStatusComponent';

/**
 * Mission statistics component show statistics for a given mission.
 */
class MissionStatisticsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
	}
	
	render() {
		let content = null;
		
		if(this.state.stats) {
			content = <Grid container>
				<Grid item xs={12} md={7} lg={8} xl={9}>
					<Time data={this.state.stats.days} height={300} />
				</Grid>
				<Grid item xs={12} md={5} lg={4} xl={3}>
					<Status data={this.state.stats.status} height={300} />
				</Grid>
				<Grid item md={3}></Grid>
				<Grid item xs={12} md={6}>
					<Score data={this.state.stats.users} />
				</Grid>
			</Grid>;
		}
		else {
			content = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return <div style={this.props.style}>
			{content}
		</div>;
	}
	
	componentWillMount() {
		API.GetMissionStatistics(this.props.mission.id)
		.then(s => this.setState({ stats: s }))
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get statistics for this mission") });
		});
	}
}

export default MissionStatisticsComponent;
