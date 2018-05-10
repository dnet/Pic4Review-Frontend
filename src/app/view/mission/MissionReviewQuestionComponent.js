import React, { Component } from 'react';
import { Pencil } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

/**
 * Mission review progress component displays a progress bar for the current review session.
 */
class MissionReviewQuestionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
	}
	
	render() {
		const question = null;
		
		if(question) {
		}
		else {
			return <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 20 }}>
				<Typography variant="headline">{I18n.t("This need an advanced edit !")}</Typography>
				<Typography variant="subheading">{I18n.t("Edit the feature according to mission description below")}</Typography>
				
				<Button variant="raised" onClick={this.props.onOpenEditor} style={{ margin: 20, minWidth: 150 }}>
					<Pencil /> {I18n.t("Edit")}
				</Button>
			</div>;
		}
	}
}

export default MissionReviewQuestionComponent;
