import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import API from '../../../ctrl/API';
import Button from 'material-ui/Button';
import Datasource from './NewMissionDatasourceComponent';
import Details from './NewMissionDetailsComponent';
import Editors from './NewMissionEditorsComponent';
import Grid from 'material-ui/Grid';
import MapSelection from '../../MapSelectionComponent';
import Mission from '../../../model/Mission';
import MissionDescription from '../MissionDescriptionComponent';
import Paper from 'material-ui/Paper';
import Preview from './NewMissionPreviewComponent';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';
import Typography from 'material-ui/Typography';

const STEPS = { "datasource": 0, "details": 1, "editors": 2, "publish": 3 };

/**
 * New mission component allows to create new missions.
 */
class NewMissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			step: STEPS.datasource,
			datasource: null,
			previewOpen: false,
			details: null,
			mission: null,
			editors: null
		};
	}
	
	/**
	 * Go to next step
	 * @private
	 */
	_next() {
		if(this.state.step === STEPS.datasource) {
			if(this._checkDatasource()) {
				this.setState({ step: STEPS.details });
			}
		}
		else if(this.state.step === STEPS.details) {
			if(NewMissionComponent.CheckDetails(this.state)) {
				//Try to create mission object
				try {
					const m = new Mission(
						-1,
						this.state.details.type,
						this.state.details.theme,
						{ name: this.state.details.areaname, bbox: this.state.datasource.area },
						{ full: this.state.details.fulldesc, short: this.state.details.shortdesc }
					);
					
					this.setState({ mission: m, step: STEPS.editors });
				}
				catch(e) {
					console.error(e);
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something is wrong with your mission."), details: e.message });
				}
			}
		}
		else if(this.state.step === STEPS.editors) {
			if(NewMissionComponent.CheckEditors(this.state)) {
				this.setState({ step: STEPS.publish });
			}
		}
		else if(this.state.step === STEPS.publish) {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Please wait while the mission is created, it can take a few minutes.") });
			
			API.CreateMission(
				this.state.mission,
				this.state.datasource.source,
				this.state.datasource.options,
				NewMissionComponent.UIEditorsToDb(this.state),
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
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission"), details: e.message });
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
	 * @param {Object} state The component state containing details parameters
	 * @return {boolean} True if details are valid
	 */
	static CheckDetails(state) {
		if(state.details) {
			if(state.details.theme && Object.keys(THEMES).indexOf(state.details.theme) >= 0) {
				if(state.details.type && Object.keys(TYPES).indexOf(state.details.type) >= 0) {
					if(state.details.shortdesc && state.details.shortdesc.length >= 10) {
						if(state.details.areaname && state.details.areaname.length >= 5) {
							if(state.details.fulldesc && state.details.fulldesc.length >= 50) {
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
	 * Check editors parameters
	 * @param {Object} state The component state containing editors parameters
	 * @return {boolean} True if editors are valid
	 */
	static CheckEditors(state) {
		if(
			state.editors
			&& state.editors.editor === "singlechoice"
			&& state.editors.data && state.editors.data.singlechoice
		) {
			if(state.editors.data.singlechoice.question && state.editors.data.singlechoice.question.trim().match(/^.{5,150}$/)) {
				if(state.editors.data.singlechoice.answers && state.editors.data.singlechoice.answers.length >= 2) {
					for(let a of state.editors.data.singlechoice.answers) {
						if(!a.label || !a.tags) {
							PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("One of the given answer is invalid (missing label or tags)") });
							return false;
						}
					}
					
					return true;
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Your question must have at least two answers (it's not a question otherwise)"), smiley: "😜" });
				}
			}
			else {
				PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Your question must contains between 5 and 150 characters") });
			}
		}
		else if(state.editors && state.editors.editor === "disabled") {
			return true;
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You must set up the editor before continuing") });
		}
		
		return false;
	}
	
	/**
	 * Convert UI editors data into DB data
	 * @param {Object} state The component state
	 * @return {Object} Object which can be stored in DB
	 */
	static UIEditorsToDb(state) {
		let e = null;
		
		if(state.editors.editor === "singlechoice") {
			e = state.editors.data.singlechoice;
			e.type = "choice";
			
			if(state.editors.data.singlechoice.answers.filter(a => a.image).length === state.editors.data.singlechoice.answers.length) {
				e.type = "images";
			}
		}
		
		return e;
	}
	
	/**
	 * Update loading status after creating a mission.
	 * @private
	 */
	_updateCreation(mid, pictoken) {
		API.GetMissionLoading(pictoken)
		.then(loading => {
			if(loading >= 100) {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Your mission was succesfully created !") });
				this.props.history.push("/mission/"+mid);
			}
			else {
				PubSub.publish("UI.MESSAGE.WAIT", { progress: loading });
				setTimeout(() => this._updateCreation(mid, pictoken), 2000);
			}
		})
		.catch(e => {
			console.log("Failed getting progress");
			console.error(e);
			setTimeout(() => this._updateCreation(mid, pictoken), 2000);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission"), details: e.message });
		});
	}
	
	render() {
		let content = null;
		
		switch(this.state.step) {
			case STEPS.datasource:
				content = <Datasource data={this.state.datasource} onChange={d => this._sourceChanged(d)} onPreview={this._preview.bind(this)} />;
				break;
			
			case STEPS.details:
				content = <Details data={this.state.details} datasource={this.state.datasource} onChange={d => this.setState({ details: d })} />;
				break;
			
			case STEPS.editors:
				content = <Editors data={this.state.editors} onChange={d => this.setState({ editors: d })} />;
				break;
			
			case STEPS.publish:
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
					<StepLabel>{I18n.t("Editor setup")}</StepLabel>
				</Step>
				<Step>
					<StepLabel>{I18n.t("Publishing")}</StepLabel>
				</Step>
			</Stepper>
			
			{content}
			
			<Grid container alignItems="center" direction="row" justify="flex-end" spacing={16}>
				<Grid item>
					<Button variant="raised" disabled={this.state.step === STEPS.datasource} onClick={() => this._prev()}>
						{I18n.t("Back")}
					</Button>
				</Grid>
				<Grid item>
					<Button variant="raised" color="primary" onClick={() => this._next()}>
						{this.state.step === STEPS.publish ? I18n.t("Publish") : I18n.t("Next")}
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
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("New mission") });
		
		//Load parameters from other mission
		if(this.props.match.params.mid) {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Retrieving information from source mission") });
			
			API.GetMissionDetails(this.props.match.params.mid)
			.then(m => {
				//Remove previously retrieved GeoJSON data
				if(m.options && m.options.data && m.options.data.options && m.options.data.options.geojson) {
					delete m.options.data.options.geojson;
				}
				
				this.setState(NewMissionComponent.MissionToState(m));
				
				PubSub.publish("UI.MESSAGE.WAITDONE");
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get details of this mission"), details: e.message });
			});
		}
	}
	
	static MissionToState(m) {
		return Object.assign({}, NewMissionComponent.RestoreEditors(m), {
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
	}
	
	static RestoreEditors(m) {
		//Restore editors data
		if(m.options.data.options.editors) {
			const editors = { data: {} };
			
			if(m.options.data.options.editors.type === "choice" || m.options.data.options.editors.type === "images") {
				editors.editor = "singlechoice";
				editors.data.singlechoice = m.options.data.options.editors;
			}
			else {
				editors.editor = "disabled";
			}
			
			return { editors: editors };
		}
		else {
			return { editors: {
				editor: "disabled"
			}};
		}
	}
}

export default withRouter(NewMissionComponent);
