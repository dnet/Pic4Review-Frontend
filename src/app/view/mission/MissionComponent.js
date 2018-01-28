import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { CircularProgress } from 'material-ui/Progress';
import API from '../../ctrl/API';
import MissionDescription from './MissionDescriptionComponent';
import MissionReview from './MissionReviewComponent';
import MissionStatistics from './MissionStatisticsComponent';
import Tabs, { Tab } from 'material-ui/Tabs';

const PAGES = [ "summary", "review", "statistics" ];

/**
 * Mission component allows to show details about a given {@link Mission}.
 */
class MissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			mission: null
		};
	}
	
	render() {
		const tab = PAGES.indexOf(this.props.match.params.page || "summary");
		const contentStyle = { marginTop: 10 };
		let content = null;
		
		if(this.state.mission) {
			switch(tab) {
				case 0:
					content = <MissionDescription mission={this.state.mission} style={contentStyle} synthetic={false} />;
					break;
				
				case 1:
					content = <MissionReview mission={this.state.mission} user={this.props.user} style={contentStyle} />;
					break;
				
				case 2:
					content = <MissionStatistics mission={this.state.mission} style={contentStyle} />;
					break;
			}
		}
		else {
			content = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return <div>
			<Tabs
				value={tab}
				onChange={(e,v) => this.props.history.push('/mission/'+this.props.match.params.mid+'/'+PAGES[v])}
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
		API.GetMissionDetails(this.props.match.params.mid)
		.then(m => this.setState({ mission: m }))
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: "Oops ! Can't get details of this mission" });
		});
	}
	
	componentDidUpdate() {
		if(this.state.mission) {
			PubSub.publish("UI.TITLE.SET", { title: this.state.mission.description.short, subtitle: this.state.mission.area.name });
		}
		else {
			PubSub.publish("UI.TITLE.RESET");
		}
	}
}

export default withRouter(MissionComponent);
