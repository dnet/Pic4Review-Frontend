import React, { Component } from 'react';
import API from '../../ctrl/API';
import { LinearProgress } from 'material-ui/Progress';
import Tooltip from 'material-ui/Tooltip';

/**
 * Mission review progress component displays a progress bar for the current review session.
 */
class MissionReviewProgressComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
	}
	
	_fetchStats() {
		API.GetMissionStatistics(this.props.mid)
		.then(stats => this.setState({ stats: stats }))
		.catch(e => console.error(e));
	}
	
	render() {
		if(this.state.stats) {
			let total = 0;
			let done = 0;
			
			Object.entries(this.state.stats.status).forEach(e => {
				total += e[1];
				if(e[0] !== "new") { done += e[1]; }
			});
			
			const pct = Math.floor(done / total * 100);
			
			return <Tooltip title={I18n.t("Mission done at %{pct}%", { pct: pct})}>
				<LinearProgress variant="determinate" value={pct} />
			</Tooltip>;
		}
		else {
			return null;
		}
	}
	
	componentDidMount() {
		this._fetchStats();
	}
	
	componentWillUnmount() {
		clearInterval(this.timer);
	}
}

export default MissionReviewProgressComponent;
