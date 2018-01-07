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
		
		PubSub.subscribe("UI.MISSION.TAB", (msg, data) => {
			const tabs = { "summary": 0, "review": 1, "statistics": 2 };
			this.setState({ tab: tabs[data.tab] });
		});
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
	
	componentWillMount() {
		if(this.props.tab) {
			PubSub.publish("UI.MISSION.TAB", { tab: this.props.tab });
		}
	}
}

export default MissionComponent;

/**
 * Event sent when mission component should switch tab
 * @event UI.MISSION.TAB
 * @type {Object} Event data
 * @property {string} tab The tab name (summary, review, statistics)
 * @memberof Events
 */
