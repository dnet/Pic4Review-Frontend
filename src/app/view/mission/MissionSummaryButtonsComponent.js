import React, { Component } from 'react';
import { Information, Play } from 'mdi-material-ui';
import withWidth from 'material-ui/utils/withWidth';
import Button from 'material-ui/Button';

/**
 * Missions summary buttons show buttons to start mission or see details.
 */
class MissionSummaryButtonsComponent extends Component {
	render() {
		return <div>
			<Button
				color="secondary"
				size={this.props.width === "xs" ? "small" : "medium"}
				onClick={() => this.props.history.push('/mission/'+this.props.mid)}
			>
				<Information />
				{I18n.t("Details")}
			</Button>
			<Button
				color="secondary"
				size={this.props.width === "xs" ? "small" : "medium"}
				onClick={() => this.props.history.push('/mission/'+this.props.mid+'/review')}
			>
				<Play />
				{I18n.t("Start")}
			</Button>
		</div>;
	}
}

export default withWidth()(MissionSummaryButtonsComponent);
