import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import MapSelection from '../../MapSelectionComponent';
import Datasource from './NewMissionDatasourceComponent';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';

/**
 * New mission component allows to create new missions.
 */
class NewMissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			step: 0,
			datasource: null
		};
	}
	
	/**
	 * Go to next step
	 * @private
	 */
	_next() {
		if(this.state.step === 0) {
			//Check input values
			if(this.state.datasource) {
				if(this.state.datasource.area && this.state.datasource.area.toBBoxString) {
					if(this.state.datasource.source) {
						if(this.state.datasource.options) {
							this.setState({ step: 1 });
						}
						else {
							PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: "Please select required options for the data source" });
						}
					}
					else {
						PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: "Please select a data source" });
					}
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: "Please select an area by using the map" });
				}
			}
			else {
				PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: "You must choose an area and a datasource before going further" });
			}
		}
		else if(this.state.step === 1) {
			//TODO Check given parameters
			
			this.setState({ step: 2 });
		}
		else if(this.state.step === 2) {
			//TODO
			console.log("publish");
		}
	}
	
	/**
	 * Go to previous step
	 * @private
	 */
	_prev() {
		this.setState({ step: Math.max(0, this.state.step-1) });
	}
	
	render() {
		let content = null;
		
		if(this.state.step === 0) {
			content = <Datasource data={this.state.datasource} onChange={d => this.setState({ datasource: d })} />;
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
			
			<Grid container alignItems="center" direction="row" justify="flex-end">
				<Grid item>
					<Button raised disabled={this.state.step === 0} onClick={() => this._prev()}>
						{I18n.t("Back")}
					</Button>
				</Grid>
				<Grid item>
					<Button raised color="primary" onClick={() => this._next()}>
						{this.state.step === 2 ? I18n.t("Publish") : I18n.t("Next")}
					</Button>
				</Grid>
			</Grid>
		</div>;
	}
}

export default NewMissionComponent;
