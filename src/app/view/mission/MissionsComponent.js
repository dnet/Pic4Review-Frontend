import React, { Component } from 'react';
import withWidth from 'material-ui/utils/withWidth';
import { ChevronDown } from 'mdi-material-ui';
import { CircularProgress } from 'material-ui/Progress';
import { Link } from 'react-router-dom';
import API from '../../ctrl/API';
import ExpansionPanel, { ExpansionPanelSummary, ExpansionPanelDetails } from 'material-ui/ExpansionPanel';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import MissionsFilters from './MissionsFiltersComponent';
import MissionsList from './MissionsListComponent';
import MissionsMap from './MissionsMapComponent';
import Pager from '../PagerComponent';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';

const MAP_HEIGHT = { "xs": 300, "sm": 400, "md": 500, "lg": 600, "xl": 700 };

/**
 * Missions component is the page displaying list of missions to user.
 * There, user can filter missions, select one in the list, and also go to mission creation page.
 */
class MissionsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			showFilters: true,
			currentFilters: {},
			missions: null,
			nextMissions: null,
			map: null,
			page: 1,
			tab: 0
		};
	}
	
	_fetchMissions(state) {
		if(state.tab === 0) {
			this.setState({ missions: null, nextMissions: null });
			
			//Current mission
			API.GetMissions(state.page, state.currentFilters.type, state.currentFilters.theme)
			.then(missions => { this.setState({ missions: missions }); })
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching missions") });
			});
			
			//Next mission
			API.GetMissions(state.page+1, state.currentFilters.type, state.currentFilters.theme)
			.then(missions => this.setState({ nextMissions: missions }))
			.catch(e => console.error(e));
		}
		else {
			this.setState({ map: null });
			
			API.GetMissionsMap(state.currentFilters.type, state.currentFilters.theme)
			.then(missions => { this.setState({ map: missions }); })
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching missions") });
			});
		}
	}
	
	render() {
		let missionsarea = null;
		const noMission = <Typography variant="body1" style={{textAlign: "center", margin: 20}}>
			{I18n.t("Oh, there is no mission corresponding to these criterias.")}<br />
			<Link to='/mission/new'>{I18n.t("But you can create your own mission if you want !")}</Link>
		</Typography>;
		
		const noMoreMission = (this.state.nextMissions === null || this.state.nextMissions.length === 0) ? <Typography variant="body1" style={{textAlign: "center", margin: 20}}>
			{I18n.t("Oh, there is no more missions matching these criterias.")}<br />
			<Link to='/mission/new'>{I18n.t("But you can create your own mission if you want !")}</Link>
		</Typography> : null;
		
		if(this.state.tab === 0 && this.state.missions) {
			missionsarea = this.state.missions.length > 0 ? <div>
				<MissionsList missions={this.state.missions} />
				{noMoreMission}
				<Pager
					style={{marginTop: 10}}
					onChange={p => this.setState({ page: p, missions: null, nextMissions: null })}
					isLast={this.state.nextMissions === null || this.state.nextMissions.length === 0}
					page={this.state.page}
				/>
			</div> : noMission;
		}
		else if(this.state.tab === 1 && this.state.map) {
			missionsarea = this.state.map.features.length > 0 ? <MissionsMap missions={this.state.map} style={{height: MAP_HEIGHT[this.props.width]}} /> : noMission;
		}
		else {
			missionsarea = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return <div style={this.props.style}>
			<Grid container>
				<Grid item hidden={{only: "xs"}} sm={4} md={3} lg={2}>
					<Typography variant="subheading">{I18n.t("Filters")}</Typography>
					<MissionsFilters values={this.state.currentFilters} onChange={d => this.setState({ currentFilters: d })} />
				</Grid>
				<Grid item xs={12} hidden={{smUp: true}}>
					<ExpansionPanel>
						<ExpansionPanelSummary expandIcon={<ChevronDown />}>
							<Typography variant="subheading">{I18n.t("Filters")}</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails>
							<MissionsFilters values={this.state.currentFilters} onChange={d => this.setState({ currentFilters: d })} />
						</ExpansionPanelDetails>
					</ExpansionPanel>
				</Grid>
				<Grid item xs={12} sm={8} md={9} lg={10}>
					<Tabs
						value={this.state.tab}
						style={{marginBottom: 10}}
						indicatorColor="primary"
						textColor="primary"
						onChange={(e,v) => this.setState({ tab: v }) }
					>
						<Tab label={I18n.t("List")} />
						<Tab label={I18n.t("Map")} />
					</Tabs>
					{missionsarea}
				</Grid>
			</Grid>
		</div>;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.RESET");
		this._fetchMissions(this.state);
	}
	
	componentWillUpdate(nextProps, nextState) {
		if(
			this.state.tab !== nextState.tab
			|| Hash(nextState.currentFilters) !== Hash(this.state.currentFilters)
			|| this.state.page !== nextState.page
		) {
			const newState = Object.assign({}, nextState);
			
			if(Hash(nextState.currentFilters) !== Hash(this.state.currentFilters)) {
				newState.page = 1;
				this.setState({ page: 1 });
			}
			
			this._fetchMissions(newState);
		}
	}
}

export default withWidth()(MissionsComponent);
