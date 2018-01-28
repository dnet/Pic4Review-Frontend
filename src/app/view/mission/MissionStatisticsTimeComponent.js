import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import Typography from 'material-ui/Typography';

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

Date.prototype.toP4RString = function() {
	return this.toISOString().split("T")[0];
};

/**
 * Mission statistics time component allows to see mission participation through time.
 */
class MissionStatisticsTimeComponent extends Component {
	render() {
		const partialDays = Object.keys(this.props.data);
		partialDays.sort();
		
		//Find missing days
		const days = {};
		let currentDate = new Date(partialDays[0]);
		const lastDate = new Date(Date.now());
		
		while(currentDate <= lastDate) {
			const d = currentDate.toP4RString();
			days[d] = this.props.data[d] ? this.props.data[d] : 0;
			currentDate = currentDate.addDays(1);
		}
		
		const daysList = Object.keys(days);
		daysList.sort();
		
		//Prepare dataset
		const dataset = {
			labels: daysList,
			datasets: [{
				label: I18n.t("Amount of contributions"),
				data: daysList.map(d => days[d]),
				fillColor: "rgba(220,220,220,0.5)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)"
			}]
		};
		
		const opts = {
			responsive: true,
			maintainAspectRatio: false,
			scales: { yAxes: [{ ticks: { min: 0 } }] }
		};
		
		return <div>
			<Typography type="subheading">{I18n.t("Contributions")}</Typography>
			<div className="chart-container" style={{position: "relative", width: "100%", height: this.props.height, maxHeight: this.props.height}}>
				<Line data={dataset} options={opts} />
			</div>
		</div>;
	}
}

export default MissionStatisticsTimeComponent;
