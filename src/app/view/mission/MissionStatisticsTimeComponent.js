import React, { Component } from 'react';
import { Line } from 'react-chartjs';
import Typography from 'material-ui/Typography';

/**
 * Mission statistics time component allows to see mission participation through time.
 */
class MissionStatisticsTimeComponent extends Component {
	render() {
		const days = Object.keys(this.props.data);
		days.sort();
		
		const dataset = {
			labels: days,
			datasets: [{
				label: I18n.t("Contributions"),
				data: days.map(d => this.props.data[d]),
				fillColor: "rgba(220,220,220,0.5)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)"
			}]
		};
		
		return <div>
			<Typography type="subheading">{I18n.t("Contributions")}</Typography>
			<Line data={dataset} width="500" height="250" />
		</div>;
	}
}

export default MissionStatisticsTimeComponent;
