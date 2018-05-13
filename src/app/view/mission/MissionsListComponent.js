import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withWidth from 'material-ui/utils/withWidth';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import MissionSummary from './MissionSummaryComponent';
import MissionSummaryButtons from './MissionSummaryButtonsComponent';

/**
 * Missions list component displays a responsive list of {@link Mission|missions}.
 */
class MissionsListComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		return <Grid container spacing={16}>
			{this.props.missions.map((m, i) => {
				return <Grid item key={i} xs={12} lg={6}>
					<Card>
						<CardContent style={this.props.width === "xs" ? { paddingBottom: 0 } : null}>
							<MissionSummary mission={m} onClick={() => this.props.history.push('/mission/'+m.id)} />
						</CardContent>
						<CardActions>
							<MissionSummaryButtons mid={m.id} history={this.props.history} />
						</CardActions>
					</Card>
				</Grid>;
			})}
		</Grid>;
	}
}

export default withWidth()(withRouter(MissionsListComponent));
