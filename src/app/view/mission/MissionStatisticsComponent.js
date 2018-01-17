import React, { Component } from 'react';
import API from '../../ctrl/API';
import { CircularProgress } from 'material-ui/Progress';
import Time from './MissionStatisticsTimeComponent';
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
			console.log(this.state.stats);
			content = <div>
				<Time data={this.state.stats.days} />
				<Status data={this.state.stats.status} />
			</div>;
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
