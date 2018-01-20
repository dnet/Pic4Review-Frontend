import React, { Component } from 'react';
import { grey } from 'material-ui/colors';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

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
		</div>;
	}
}

export default MissionSummaryComponent;
