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
			user: null,
			stats: null
		};
		
		this.psTokens = {};
	}
	
	render() {
		//Not logged in
		if(this.state.user === -1) {
			this.props.history.push('/');
			PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You need to be logged in to see this page") });
			return <div></div>;
		}
		//Logged in and stats ready
		else if(this.state.user && this.state.stats) {
			const style={marginTop: 10};
			
			return <div>
				<Typography type="display1">{this.state.user.name}</Typography>
				
				<Typography type="subheading" style={style}>
					{I18n.t("Position in leaderboard")}
				</Typography>
				<Typography type="body1">
					{this.state.stats.place ? "#"+this.state.stats.place : I18n.t("Unknown, as you haven't contributed yet")}
				</Typography>
				
				<Typography type="subheading" style={style}>
					{I18n.t("Features")}
				</Typography>
				<Typography type="body1">
					{I18n.t({one: "One object reviewed", other: "%{count} objects reviewed"}, {count: this.state.stats.featuresEdited})}
				</Typography>
				
				<Themes data={this.state.stats.themes} height={300} style={style} />
			</div>;
		}
		//Wait for login or stats
		else {
			return <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
	}
	
	componentDidMount() {
		this.psTokens.wantUser = PubSub.subscribe("USER.INFO.READY", (msg, data) => {
			this.setState({ user: data ? data : -1 });
			
			//Retrieve statistics
			if(data) {
				API.GetUserStatistics(data.id)
				.then(stats => {
					this.setState({ stats: stats });
				})
				.catch(e => {
					console.error(e);
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get your user statistics") });
				});
			}
		});
		
		setTimeout(() => PubSub.publish("USER.INFO.WANTS"), 1000);
	}
	
	componentWillUnmount() {
		if(this.psTokens.wantUser) {
			PubSub.unsubscribe(this.psTokens.wantUser);
		}
	}
}

export default MyStatisticsComponent;
