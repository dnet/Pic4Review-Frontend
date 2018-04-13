import React, { Component } from 'react';
import { ContentDuplicate, Eye, EyeOff, Information, Pencil } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Filters from './MissionsFiltersComponent';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import IconButton from 'material-ui/IconButton';
import { Link } from 'react-router-dom';
import Pager from '../PagerComponent';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from 'material-ui/Table';
import Tooltip from 'material-ui/Tooltip';
import Wait from '../WaitComponent';

/**
 * Missions admin component is the page where you can set the visibility of existing missions.
 */
class MissionsAdminComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			missions: null,
			nextMissions: null,
			page: 1,
			currentFilters: {},
		};
	}
	
	_fetchMissions(state) {
		this.setState({ missions: null, nextMissions: null });
		
		//Current mission
		API.GetMissions(state.page, state.currentFilters.type, state.currentFilters.theme, state.currentFilters.status || "all")
		.then(missions => { this.setState({ missions: missions }); })
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching missions") });
		});
		
		//Next mission
		API.GetMissions(state.page+1, state.currentFilters.type, state.currentFilters.theme, state.currentFilters.status || "all")
		.then(missions => this.setState({ nextMissions: missions }))
		.catch(e => console.error(e));
	}
	
	_setMissionStatus(m, status) {
		m.status = status;
		API.UpdateMission(m, this.props.user.name, this.props.user.id)
		.then(() => {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Mission visibility was changed") });
			this.setState({ missions: null, nextMissions: null });
			this._fetchMissions(this.state);
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't change mission visibility") });
		});
	}
	
	render() {
		if(this.props.user && this.state.missions) {
			return <Grid container spacing={16}>
				<Grid item hidden={{smDown: true}} md={3} lg={2}>
					<Filters values={this.state.currentFilters} status={true} onChange={d => this.setState({ currentFilters: d })} />
				</Grid>
				<Grid item xs={12} md={9} lg={10}>
					<Paper>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>#</TableCell>
									<TableCell>{I18n.t("Name")}</TableCell>
									<TableCell>{I18n.t("Area")}</TableCell>
									<TableCell style={{textAlign: "center"}}>{I18n.t("Completion")}</TableCell>
									<TableCell style={{textAlign: "center"}}>{I18n.t("Actions")}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{this.state.missions.map(m => {
									const backcolor = m.status === "online" ? "#C8F7C5" : "#DADFE1";
									
									return <TableRow key={m.id} style={{backgroundColor: backcolor}}>
										<TableCell>{m.id}</TableCell>
										<TableCell>{m.description.short}</TableCell>
										<TableCell>{m.area.name}</TableCell>
										<TableCell style={{textAlign: "center"}}>{Math.floor(100 - (m.options.stats.new / m.options.stats.total)*100)+"%"}</TableCell>
										<TableCell style={{textAlign: "center"}}>
											<IconButton
												component={Link}
												to={'/mission/'+m.id}
												target="_blank"
											>
												<Information />
											</IconButton>
											<IconButton
												component={Link}
												to={'/mission/new/'+m.id}
												target="_blank"
											>
												<ContentDuplicate />
											</IconButton>
											<IconButton
												component={Link}
												to={'/mission/'+m.id+'/edit'}
												target="_blank"
											>
												<Pencil />
											</IconButton>
											{m.status === "online" &&
											<IconButton onClick={() => this._setMissionStatus(m, "canceled")}>
												<EyeOff />
											</IconButton>}
											{m.status !== "online" &&
											<IconButton onClick={() => this._setMissionStatus(m, "online")}>
												<Eye />
											</IconButton>}
										</TableCell>
									</TableRow>;
								})}
							</TableBody>
						</Table>
						<Pager
							onChange={p => this.setState({ page: p, missions: null, nextMissions: null })}
							isLast={this.state.nextMissions === null || this.state.nextMissions.length === 0}
							page={this.state.page}
						/>
					</Paper>
				</Grid>
			</Grid>;
		}
		else {
			return <Wait />;
		}
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.RESET");
		this._fetchMissions(this.state);
	}
	
	componentWillUpdate(nextProps, nextState) {
		if(
			Hash(nextState.currentFilters) !== Hash(this.state.currentFilters)
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

export default MissionsAdminComponent;
