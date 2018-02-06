import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import API from '../ctrl/API';
import Themes from './MyStatisticsThemesComponent';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';

/**
 * My statistics component displays user contribution statistics
 */
class MyStatisticsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
		
		this.psTokens = {};
	}
	
	render() {
		let content = null;
		
		//Stats ready
		if(this.props.user && this.state.stats) {
			const style={marginTop: 10};
			
			content = <div>
				<Typography variant="display1">{this.props.user.name}</Typography>
				
				<Typography variant="subheading" style={style}>
					{I18n.t("Position in leaderboard")}
				</Typography>
				<Typography variant="body1">
					{this.state.stats.place ? "#"+this.state.stats.place : I18n.t("Unknown, as you haven't contributed yet")}
				</Typography>
				
				<Typography variant="subheading" style={style}>
					{I18n.t("Features")}
				</Typography>
				<Typography variant="body1">
					{I18n.t({one: "One object reviewed", other: "%{count} objects reviewed"}, {count: this.state.stats.featuresEdited})}
				</Typography>
				
				<Themes data={this.state.stats.themes} height={300} style={style} />
			</div>;
		}
		//Wait for login or stats
		else {
			content = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return content;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.RESET");
		
		if(this.props.user) {
			//Retrieve statistics
			API.GetUserStatistics(this.props.user.id)
			.then(stats => {
				this.setState({ stats: stats });
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get your user statistics") });
			});
		}
	}
}

export default MyStatisticsComponent;
