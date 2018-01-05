import React, { Component } from 'react';
import MissionDescription from './MissionDescriptionComponent';
import MissionReview from './MissionReviewComponent';
import Tabs, { Tab } from 'material-ui/Tabs';

/**
 * Mission component allows to show details about a given {@link Mission}.
 */
class MissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			tab: 0
		};
	}
	
	render() {
		let content = null;
		
		switch(this.state.tab) {
			case 0:
				content = <MissionDescription mission={this.props.mission} style={this.props.style} />;
				break;
			
			case 1:
				content = <MissionReview mission={this.props.mission} style={this.props.style} />;
				break;
		}
		
		return <div>
			<Tabs
				value={this.state.tab}
				onChange={(e,v) => this.setState({ tab: v })}
				indicatorColor="primary"
				textColor="primary"
			>
				<Tab label={I18n.t("Summary")} />
				<Tab label={I18n.t("Review")} />
				<Tab label={I18n.t("Statistics")} />
			</Tabs>
			{content}
		</div>;
	}
}

export default MissionComponent;
