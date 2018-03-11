import React, { Component } from 'react';
import API from '../../ctrl/API';
import { withRouter } from 'react-router-dom';
import Button from 'material-ui/Button';
import Details from './new/NewMissionDetailsComponent';
import Grid from 'material-ui/Grid';
import Mission from '../../model/Mission';
import Typography from 'material-ui/Typography';
import Wait from '../WaitComponent';

/**
 * Mission edit component allows to change description of an existing mission.
 */
class MissionEditComponent extends Component {
	constructor() {
		super();
		
		this.state = {};
		this.psTokens = {};
	}
	
	/**
	 * Handler for save button click
	 * @private
	 */
	_save() {
		if(this._checkDetails()) {
			//Try to create updated mission
			try {
				const mUpdated = new Mission(
					this.state.mission.id,
					this.state.details.type,
					this.state.details.theme,
					{ name: this.state.details.areaname, bbox: this.state.mission.area.bbox },
					{ full: this.state.details.fulldesc, short: this.state.details.shortdesc }
				);
				
				PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Please wait while the mission is updated.") });
				
				//Call API to save changes
				API.UpdateMission(mUpdated, this.state.user.name, this.state.user.id)
				.then(() => {
					PubSub.publish("UI.MESSAGE.WAITDONE");
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Mission was successfully updated") });
					this.props.history.push("/mission/"+this.state.mission.id);
				})
				.catch(e => {
					console.log("Failed updating");
					console.error(e);
					PubSub.publish("UI.MESSAGE.WAITDONE");
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when updating the mission") });
				});
			}
			catch(e) {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something is wrong with your mission.")+" "+e.message });
			}
		}
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
	
	render() {
		if(this.state.details) {
			return <div>
				<Typography variant="display1">{I18n.t("Edit")}</Typography>
				<Details data={this.state.details} onChange={d => this.setState({ details: d })} />
				<Grid container alignItems="center" direction="row" justify="flex-end">
					<Grid item>
						<Button variant="raised" color="primary" onClick={() => this._save()}>
							{I18n.t("Save")}
						</Button>
					</Grid>
				</Grid>
			</div>;
		}
		else {
			return <Wait />;
		}
	}
	
	componentDidMount() {
		this.psTokens.wantUser = PubSub.subscribe("USER.INFO.READY", (msg, data) => {
			API.GetMissionDetails(this.props.match.params.mid, data.id !== -1 ? data.id : undefined)
			.then(m => {
				if(m.options.canEdit) {
					this.setState({
						details: {
							theme: m.theme,
							type: m.type,
							shortdesc: m.description.short,
							areaname: m.area.name,
							fulldesc: m.description.full
						},
						mission: m,
						user: data
					});
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You're not authorized to edit this mission") });
					this.props.history.push("/mission/"+m.id);
				}
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get details of this mission") });
			});
		});
		setTimeout(() => PubSub.publish("USER.INFO.WANTS"), 1000);
	}
	
	componentWillUnmount() {
		if(this.psTokens.wantUser) {
			PubSub.unsubscribe(this.psTokens.wantUser);
		}
	}
}

export default withRouter(MissionEditComponent);
