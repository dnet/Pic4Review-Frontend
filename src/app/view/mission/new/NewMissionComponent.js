import React, { Component } from 'react';
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
			step: 0
		};
	}
	
	render() {
		let content = null;
		
		if(this.state.step === 0) {
			content = <Datasource />;
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
		</div>;
	}
}

export default NewMissionComponent;
