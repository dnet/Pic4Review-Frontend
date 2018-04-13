import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import API from '../../../ctrl/API';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import MapSelection from '../../MapSelectionComponent';
import Datasource from './NewMissionDatasourceComponent';
import Details from './NewMissionDetailsComponent';
import Mission from '../../../model/Mission';
import MissionDescription from '../MissionDescriptionComponent';
import Paper from 'material-ui/Paper';
import Preview from './NewMissionPreviewComponent';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';
import Typography from 'material-ui/Typography';

/**
 * New mission component allows to create new missions.
 */
class NewMissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			step: 0,
			datasource: null,
			previewOpen: false,
			details: null,
			mission: null
		};
	}
	
	/**
	 * Go to next step
	 * @private
	 */
	_next() {
		if(this.state.step === 0) {
			if(this._checkDatasource()) {
				this.setState({ step: 1 });
			}
		}
		else if(this.state.step === 1) {
			if(this._checkDetails()) {
				//Try to create mission object
				try {
					const m = new Mission(
						-1,
						this.state.details.type,
						this.state.details.theme,
						{ name: this.state.details.areaname, bbox: this.state.datasource.area },
						{ full: this.state.details.fulldesc, short: this.state.details.shortdesc }
					);
					
					this.setState({ mission: m, step: 2 });
				}
				catch(e) {
					console.error(e);
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something is wrong with your mission.")+" "+e.message });
				}
			}
		}
		else if(this.state.step === 2) {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Please wait while the mission is created, it can take a few minutes.") });
			
			API.CreateMission(
				this.state.mission,
				this.state.datasource.source,
				this.state.datasource.options,
				this.props.user.name,
				this.props.user.id
			)
			.then(d => {
				this._updateCreation(d.id, d.pictoken);
			})
			.catch(e => {
				console.log("Failed creating");
				console.error(e);
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission") });
			});
		}
	}
	
	/**
	 * Go to previous step
	 * @private
	 */
	_prev() {
		this.setState({ step: Math.max(0, this.state.step-1) });
	}
	
	/**
	 * Preview some source
	 * @private
	 */
	_preview(source) {
		if(this._checkDatasource()) {
			this.setState({ previewOpen: true });
		}
	}
	
	/**
	 * Handler for datasource changes
	 * @private
	 */
	_sourceChanged(d) {
		const newState = { datasource: d };
		
		if(
			this.state.datasource
			&& this.state.datasource.area
			&& this.state.datasource.area.toBBoxString
			&& d.area
			&& d.area.toBBoxString
			&& d.area.toBBoxString() != this.state.datasource.area.toBBoxString()
		) {
			const newDetails = Object.assign({}, this.state.details);
			newDetails.areaname = "";
			newState.details = newDetails;
		}
		
		this.setState(newState);
	}
	
	/**
	 * Check data source parameters
	 * @private
	 */
	_checkDatasource() {
		//Check input values
		if(this.state.datasource) {
			if(this.state.datasource.area && this.state.datasource.area.toBBoxString) {
				if(this.state.datasource.source) {
					if(this.state.datasource.options) {
						return true;
					}
					else {
						PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Please select required options for the data source") });
					}
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Please select a data source") });
				}
			}
			else {
				PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Please select an area by using the map") });
			}
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You must choose an area and a datasource before going further") });
		}
		
		return false;
	}
	
	/**
	 * Check details parameters
	 * @private
	 */
	_checkDetails() {
		if(this.state.details) {
			if(this.state.details.theme && Object.keys(THEMES).indexOf(this.state.details.theme) >= 0) {
				if(this.state.details.type && Object.keys(TYPES).indexOf(this.state.details.type) >= 0) {
					if(this.state.details.shortdesc && this.state.details.shortdesc.length >= 5) {
						if(this.state.details.areaname && this.state.details.areaname.length >= 5) {
							if(this.state.details.fulldesc && this.state.details.fulldesc.length >= 50) {
								return true;
							}
							else {
								PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Description is empty or too short, please give us more details") });
							}
						}
						else {
							PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Area name is empty or too short") });
						}
					}
					else {
						PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Mission name is empty or too short") });
					}
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You must choose a type of mission") });
				}
			}
			else {
				PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You must choose a theme for your mission") });
			}
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You must give details about the mission before continuing") });
		}
		
		return false;
	}
	
	/**
	 * Update loading status after creating a mission.
	 * @private
	 */
	_updateCreation(mid, pictoken) {
		API.GetMissionLoading(pictoken)
		.then(loading => {
			if(loading >= 100) {
				//Get details
				API.GetMissionDetails(mid)
				.then(mission => {
					//And publish
					mission.status = "online";
					
					API.UpdateMission(mission, this.props.user.name, this.props.user.id)
					.then(() => {
						PubSub.publish("UI.MESSAGE.WAITDONE");
						PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Your mission was succesfully created !") });
						this.props.history.push("/mission/"+mid);
					})
					.catch(e => {
						console.log("Failed updating");
						console.error(e);
						PubSub.publish("UI.MESSAGE.WAITDONE");
						PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission") });
					});
				})
				.catch(e => {
					console.log("Failed getting details");
					console.error(e);
					PubSub.publish("UI.MESSAGE.WAITDONE");
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission") });
				});
			}
			else {
				PubSub.publish("UI.MESSAGE.WAIT", { progress: loading });
				setTimeout(() => this._updateCreation(mid, pictoken), 2000);
			}
		})
		.catch(e => {
			console.log("Failed getting progress");
			console.error(e);
			PubSub.publish("UI.MESSAGE.WAITDONE");
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission") });
		});
	}
	
	render() {
		let content = null;
		
		switch(this.state.step) {
			case 0:
				content = <Datasource data={this.state.datasource} onChange={d => this._sourceChanged(d)} onPreview={this._preview.bind(this)} />;
				break;
			
			case 1:
				content = <Details data={this.state.details} datasource={this.state.datasource} onChange={d => this.setState({ details: d })} />;
				break;
			
			case 2:
				content = <div>
					<Typography variant="subheading">{I18n.t("Summary")}</Typography>
					<Typography variant="caption">
						{I18n.t("Please check if everything is OK with your mission description. If so, you can publish the mission. If not, you can go back and make appropriate changes")}
					</Typography>
					<Paper elevation={4} style={{padding: 10, marginTop: 10, marginBottom: 10}}>
						<MissionDescription mission={this.state.mission} synthetic={true} />
					</Paper>
				</div>;
				break;
		}
		
		
		return <div>
			<Stepper activeStep={this.state.step}>
				<Step>
					<StepLabel>{I18n.t("Data source and area")}</StepLabel>
				</Step>
				<Step>
					<StepLabel>{I18n.t("Mission details")}</StepLabel>
				</Step>
				<Step>
					<StepLabel>{I18n.t("Publish")}</StepLabel>
				</Step>
			</Stepper>
			
			{content}
			
			<Grid container alignItems="center" direction="row" justify="flex-end" spacing={16}>
				<Grid item>
					<Button variant="raised" disabled={this.state.step === 0} onClick={() => this._prev()}>
						{I18n.t("Back")}
					</Button>
				</Grid>
				<Grid item>
					<Button variant="raised" color="primary" onClick={() => this._next()}>
						{this.state.step === 2 ? I18n.t("Publish") : I18n.t("Next")}
					</Button>
				</Grid>
			</Grid>
			
			<Preview
				open={this.state.previewOpen}
				data={this.state.datasource}
				onClose={() => this.setState({ previewOpen: false })}
			/>
		</div>;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.RESET");
		
		//Load parameters from other mission
		if(this.props.match.params.mid) {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Retrieving information from source mission") });
			
			API.GetMissionDetails(this.props.match.params.mid)
			.then(m => {
				//Remove previously retrieved GeoJSON data
				if(m.options.data.options.geojson) {
					delete m.options.data.options.geojson;
				}
				
				this.setState({
					details: {
						type: m.type,
						theme: m.theme,
						areaname: m.area.name,
						fulldesc: m.description.full,
						shortdesc: m.description.short
					},
					datasource: {
						source: m.options.data.source,
						options: m.options.data.options,
						area: m.area.bbox
					},
					mission: m
				});
				
				PubSub.publish("UI.MESSAGE.WAITDONE");
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get details of this mission") });
			});
		}
	}
}

export default withRouter(NewMissionComponent);
