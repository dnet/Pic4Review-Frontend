import React, { Component } from 'react';
import PaginatedList from './PaginatedMissionListComponent';
import Wait from '../WaitComponent';

/**
 * Missions component is the page displaying list of missions to user.
 * There, user can filter missions, select one in the list, and also go to mission creation page.
 */
class MissionsComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		if(this.props.user) {
			return <PaginatedList
				user={this.props.user}
				synthetic={true}
			/>;
		}
		else {
			return <Wait />;
		}
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Your missions") });
	}
}

export default MissionsComponent;
