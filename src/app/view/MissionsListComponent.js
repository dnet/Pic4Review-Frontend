import React, { Component } from 'react';
import { Information, Play } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import MissionSummary from './MissionSummaryComponent';

/**
 * Missions list component displays a responsive list of {@link Mission|missions}.
 */
class MissionsListComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		return <Grid container>
			{this.props.missions.filter(m => m.passFilter(this.props.filters)).map((m, i) => {
				return <Grid item key={i} xs={12} md={6} lg={4}>
					<Card>
						<CardContent>
							<MissionSummary mission={m} />
						</CardContent>
						<CardActions>
							<Button
								color="accent"
								onClick={() => PubSub.publish("UI.PAGE.SHOW", { page: "mission", mission: m })}
							>
								<Information />
								{I18n.t("Details")}
							</Button>
							<Button
								color="accent"
								onClick={() => PubSub.publish("UI.PAGE.SHOW", { page: "review", mission: m })}
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
}

export default MissionsListComponent;
