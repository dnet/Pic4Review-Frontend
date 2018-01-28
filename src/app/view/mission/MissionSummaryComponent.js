import React, { Component } from 'react';
import { grey } from 'material-ui/colors';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

const dayOffset = d => {
	d = new Date(d);
	const now = new Date(Date.now());
	const d1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
	const d2 = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
	return Math.floor((d1-d2) / (1000*60*60*24));
};

/**
 * Mission summary component shows the main descriptive elements of a {@link Mission}.
 */
class MissionSummaryComponent extends Component {
	render() {
		return <div>
			<Typography type="headline" style={{verticalAlign: "middle"}}>
				{this.props.mission.description.short}
				
				<span style={{verticalAlign: "middle", color: grey[500], marginLeft: 10}}>
					<Tooltip title={TYPES[this.props.mission.type].name}>
						{TYPES[this.props.mission.type].icon}
					</Tooltip>
					
					<Tooltip title={THEMES[this.props.mission.theme].name}>
						{THEMES[this.props.mission.theme].icon}
					</Tooltip>
				</span>
			</Typography>
			
			<Typography type="subheading">
				{this.props.mission.area.name}
			</Typography>
			
			{this.props.mission.options.stats && <Typography type="caption">
				{I18n.t("%{pct} % complete (%{nb} features)", { pct: Math.floor(100 - (this.props.mission.options.stats.new / this.props.mission.options.stats.total)*100), nb: this.props.mission.options.stats.total })}
				{this.props.mission.options.date && " - "+I18n.t({ zero: "Launched today", one: "Launched yesterday", other: "Launched %{count} days ago" }, { count: dayOffset(this.props.mission.options.date) })}
			</Typography>}
		</div>;
	}
}

export default MissionSummaryComponent;
