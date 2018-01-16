import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import API from '../ctrl/API';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import MissionsFilters from './MissionsFiltersComponent';
import MissionsList from './MissionsListComponent';
import Pager from './PagerComponent';
import Typography from 'material-ui/Typography';

/**
 * Missions component is the page displaying list of missions to user.
 * There, user can filter missions, select one in the list, and also go to mission creation page.
 */
class MissionsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			showFilters: true,
			missionsDisplay: "list",
			currentFilters: {},
			missions: null,
			page: 1
		};
		
		this.psTokens = {};
	}
	
	_fetchMissions() {
		this.setState({ missions: null });
		
		API.GetMissions(this.state.page, this.state.currentFilters.type, this.state.currentFilters.theme)
		.then(missions => { this.setState({ missions: missions }); })
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching missions") });
		});
	}
	
	render() {
		let missionsarea = null;
		
		if(this.state.missions) {
			missionsarea = <MissionsList filters={this.state.currentFilters} missions={this.state.missions} />;
		}
		else {
			missionsarea = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return <div style={this.props.style}>
			<Grid container>
				<Grid item hidden={{only: "xs"}} sm={4} md={3} lg={2}>
					<Typography type="subheading">{I18n.t("Filters")}</Typography>
					<MissionsFilters values={this.state.currentFilters} />
				</Grid>
				<Grid item xs={12} sm={8} md={9} lg={10}>
					<Typography type="subheading">{I18n.t("Missions")}</Typography>
					{missionsarea}
					<Pager
						onChange={p => this.setState({ page: p, missions: null })}
						isLast={false}
						page={this.state.page}
					/>
				</Grid>
			</Grid>
		</div>;
	}
	
	componentWillMount() {
		this.psTokens.filter = PubSub.subscribe("UI.MISSIONS.FILTER", (msg, data) => {
			this.setState({ currentFilters: data });
		});
		
		this._fetchMissions();
	}
	
	componentWillUpdate(nextProps, nextState) {
		if(
			Hash(nextState.currentFilters) !== Hash(this.state.currentFilters)
			|| this.state.page !== nextState.page
		) {
			this._fetchMissions();
		}
	}
	
	componentWillUnmount() {
		PubSub.unsubscribe(this.psTokens.filter);
		PubSub.unsubscribe(this.psTokens.ready);
	}
}

export default MissionsComponent;

/**
 * Event sent when missions are required for display
 * @event UI.MISSIONS.WANTS
 * @memberof Events
 */
