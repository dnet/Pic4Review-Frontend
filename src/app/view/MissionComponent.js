import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { Play } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import MissionSummary from './MissionSummaryComponent';
import ReactMarkdown from 'react-markdown';

const styles = theme => ({
	root: theme.typography.body1
});

/**
 * Mission component allows to show details about a given {@link Mission}.
 */
class MissionComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		return <div style={this.props.style}>
			<MissionSummary mission={this.props.mission} />
			<ReactMarkdown className={this.props.classes.root} source={this.props.mission.description.full} />
			<Button raised color="primary">
				<Play />
				{I18n.t("Start review")}
			</Button>
		</div>;
	}
}

export default withStyles(styles)(MissionComponent);
