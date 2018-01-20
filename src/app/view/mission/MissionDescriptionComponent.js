import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { Play } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';
import MissionMap from './MissionMapComponent';
import MissionSummary from './MissionSummaryComponent';
import ReactMarkdown from 'react-markdown';

const styles = theme => ({
	root: theme.typography.body1
});

/**
 * Mission description component show a full description of a {@link Mission}.
 * It shows summary, full description and map of features.
 */
class MissionDescriptionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			lat: 0,
			lng: 0,
			zoom: 0,
			features: null
		};
	}
	
	/**
	 * Function to refresh features shown on map.
	 * @private
	 */
	_updateFeatures() {
		API.GetMissionFeatures(this.props.mission.id)
		.then(features => {
			this.setState({ features: features });
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't retrieve features for this mission.") });
			this.setState({ features: null });
		});
	}
	
	render() {
		return <div style={this.props.style}>
			<MissionSummary mission={this.props.mission} />
			<ReactMarkdown className={this.props.classes.root} source={this.props.mission.description.full} />
			
			{!this.props.synthetic && <div>
			<div style={{textAlign: "right"}}>
				<Button
					raised
					color="primary"
					component={Link}
					to={'/mission/'+this.props.mission.id+'/review'}
				>
					<Play />
					{I18n.t("Start review")}
				</Button>
			</div>
			
			<MissionMap features={this.state.features} />
			</div>}
		</div>;
	}
	
	componentWillMount() {
		if(!this.props.synthetic) {
			this._updateFeatures();
		}
	}
	
	componentWillUpdate(nextProps, nextState) {
		if(!this.props.synthetic && this.props.mission.id !== nextProps.mission.id) {
			this._updateFeatures();
		}
	}
}

export default withStyles(styles)(MissionDescriptionComponent);
