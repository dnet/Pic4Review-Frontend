import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import MissionSummary from './MissionSummaryComponent';
import MissionSummaryButtons from './MissionSummaryButtonsComponent';
import Typography from 'material-ui/Typography';

/**
 * Missions list component displays a responsive list of {@link Mission|missions}.
 */
class MissionsListComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		if(this.props.missions.length > 0) {
			return <Grid container>
				{this.props.missions.map((m, i) => {
					return <Grid item key={i} xs={12} md={6} lg={4}>
						<Card>
							<CardContent>
								<MissionSummary mission={m} />
							</CardContent>
							<CardActions>
								<MissionSummaryButtons mid={m.id} history={this.props.history} />
							</CardActions>
						</Card>
					</Grid>;
				})}
			</Grid>;
		}
		else {
			return <Typography type="body1" style={{textAlign: "center", margin: 20}}>
				{I18n.t("Oh, there is no mission corresponding to these criterias.")}<br />
				<Link to='/mission/new'>{I18n.t("But you can create your own mission if you want !")}</Link>
			</Typography>;
		}
	}
}

export default withRouter(MissionsListComponent);
