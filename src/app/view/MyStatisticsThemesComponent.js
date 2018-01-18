import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Typography from 'material-ui/Typography';

const title = s => s.substring(0,1).toUpperCase()+s.substring(1);
const getRandomColor = () => {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for(let i=0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

/**
 * My statistics theme component allows to display what are the favourite contribution themes of an user.
 */
class MyStatisticsThemesComponent extends Component {
	render() {
		const themes = Object.keys(this.props.data);
		
		const dataset = {
			labels: themes.map(t => I18n.t(title(t))),
			datasets: [{
				data: themes.map(t => this.props.data[t]),
				backgroundColor: themes.map(getRandomColor)
			}]
		};
		
		const opts = {
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'bottom'
			}
		};
		
		return <div style={this.props.style}>
			<Typography type="subheading">{I18n.t("Contribution themes")}</Typography>
			<div className="chart-container" style={{position: "relative", width: "100%", height: this.props.height, maxHeight: this.props.height}}>
				<Doughnut data={dataset} options={opts} />
			</div>
		</div>;
	}
}

export default MyStatisticsThemesComponent;
