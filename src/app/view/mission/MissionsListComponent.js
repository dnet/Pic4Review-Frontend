import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Information, Play } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import MissionSummary from './MissionSummaryComponent';
import Typography from 'material-ui/Typography';

/**
 * Missions list component displays a responsive list of {@link Mission|missions}.
 */
class MissionsListComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		const filtered = this.props.missions.filter(m => m.passFilter(this.props.filters));
		
		if(filtered.length > 0) {
			return <Grid container>
				{filtered.map((m, i) => {
					return <Grid item key={i} xs={12} md={6} lg={4}>
						<Card>
							<CardContent>
								<MissionSummary mission={m} />
							</CardContent>
							<CardActions>
								<Button
									color="secondary"
									component={Link}
									to={'/mission/'+m.id}
								>
									<Information />
									{I18n.t("Details")}
								</Button>
								<Button
									color="secondary"
									component={Link}
									to={'/mission/'+m.id+'/review'}
								>
									<Play />
									{I18n.t("Start")}
								</Button>
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

export default MissionsListComponent;
