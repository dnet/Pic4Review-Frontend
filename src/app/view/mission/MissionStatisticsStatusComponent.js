import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Typography from 'material-ui/Typography';

/**
 * Mission statistics status component allows to see feature status.
 */
class MissionStatisticsStatusComponent extends Component {
	render() {
		const statusColor = { "new": "grey", "reviewed": "green", "skipped": "orange", "nopics": "blue", "cantsee": "red" };
		const statusNames = { "new": I18n.t("To review"), "reviewed": I18n.t("Reviewed"), "skipped": I18n.t("Skipped"), "nopics": I18n.t("No pictures"), "cantsee": I18n.t("Can't see") };
		
		const statuses = Object.keys(this.props.data);
		
		const dataset = {
			labels: statuses.map(s => statusNames[s]),
			datasets: [{
				data: statuses.map(s => this.props.data[s]),
				backgroundColor: statuses.map(s => statusColor[s])
			}]
		};
		
		return <div>
			<Typography type="subheading">{I18n.t("Feature status")}</Typography>
			<div className="chart-container" style={{position: "relative", width: "100%", height: this.props.height, maxHeight: this.props.height}}>
				<Doughnut data={dataset} options={{responsive: true, maintainAspectRatio: false, legend: {position: "bottom"}}} />
			</div>
		</div>;
	}
}

export default MissionStatisticsStatusComponent;
