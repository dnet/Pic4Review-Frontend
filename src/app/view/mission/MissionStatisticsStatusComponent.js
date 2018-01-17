import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs';
import Typography from 'material-ui/Typography';

/**
 * Mission statistics status component allows to see feature status.
 */
class MissionStatisticsStatusComponent extends Component {
	render() {
		const statusColor = { "new": "grey", "reviewed": "green", "skipped": "orange", "nopics": "blue", "cantsee": "red" };
		const statusNames = { "new": I18n.t("To review"), "reviewed": I18n.t("Reviewed"), "skipped": I18n.t("Skipped"), "nopics": I18n.t("No pictures"), "cantsee": I18n.t("Can't see") };
		
		const dataset = Object.entries(this.props.data).map(e => {
			return { value: e[1], label: statusNames[e[0]], color: statusColor[e[0]] };
		});
		
		return <div>
			<Typography type="subheading">{I18n.t("Feature status")}</Typography>
			<Doughnut data={dataset} width="500" height="250" />
		</div>;
	}
}

export default MissionStatisticsStatusComponent;
