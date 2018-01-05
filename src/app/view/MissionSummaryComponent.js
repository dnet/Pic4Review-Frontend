import React, { Component } from 'react';
import { grey } from 'material-ui/colors';
import { CupWater, Download, Help, TagPlus, Wrench } from 'mdi-material-ui';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

/**
 * Mission summary component shows the main descriptive elements of a {@link Mission}.
 */
class MissionSummaryComponent extends Component {
	constructor() {
		super();
		
		this.themes = { "amenity": I18n.t("Amenity") };
		this.types = { "fix": I18n.t("Fix existing data"), "improve": I18n.t("Augment existing data"), "integrate": I18n.t("Integrate new data") };
		this.themeIcons = { "amenity": <CupWater />, "default": <Help /> };
		this.typeIcons = { "fix": <Wrench />, "integrate": <Download />, "improve": <TagPlus /> };
	}
	
	render() {
		return <div>
			<Typography type="headline">
				{this.props.mission.description.short}
				<span style={{float: "right", color: grey[500]}}>
					<Tooltip title={this.types[this.props.mission.type]}>
						{this.typeIcons[this.props.mission.type]}
					</Tooltip>
					<Tooltip title={this.themes[this.props.mission.theme] || I18n.t("Unknown")}>
						{this.themeIcons[this.props.mission.theme] || this.themeIcons.default}
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
