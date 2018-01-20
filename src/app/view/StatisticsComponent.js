import React, { Component } from 'react';
import API from '../ctrl/API';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import MissingPictures from './MissingPicturesMapComponent';
import UsersScore from './UsersScoreComponent';
import Typography from 'material-ui/Typography';

/**
 * Statistics component shows statistics for all the community.
 */
class StatisticsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
	}
	
	render() {
		if(this.state.stats) {
			return <div>
				<Typography type="display1">{I18n.t("Statistics")}</Typography>
				
				<Grid container>
					<Grid item xs={12} md={6}>
						<UsersScore data={this.state.stats.scores} />
					</Grid>
					<Grid item xs={12} md={6}>
						<Typography type="subheading">{I18n.t("Last missing/bad pictures")}</Typography>
						<MissingPictures style={{height: 400}} />
					</Grid>
				</Grid>
			</div>;
		}
		else {
			return <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
	}
	
	componentWillMount() {
		API.GetUsersStatistics()
		.then(stats => {
			this.setState({ stats: stats });
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get statistics") });
		});
	}
}

export default StatisticsComponent;
