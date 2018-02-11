import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { CameraOff, Play } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Button from 'material-ui/Button';
import ExportMenu from './MissionDescriptionExportComponent';
import Grid from 'material-ui/Grid';
import { Link } from 'react-router-dom';
import MissionMap from './MissionMapComponent';
import MissionSummary from './MissionSummaryComponent';
import ReactMarkdown from 'react-markdown';
import Typography from 'material-ui/Typography';

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
			features: null,
			openExport: false,
			exportAnchor: null
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
		const percentNoPics = this.state.features ? this.state.features.filter(f => f.status === 'nopics').length / this.state.features.length * 100 : 0;
		
		return <div style={this.props.style}>
			<MissionSummary mission={this.props.mission} />
			<ReactMarkdown className={this.props.classes.root} source={this.props.mission.description.full} />
			
			{this.props.synthetic == false && <div>
				{percentNoPics >= 20 &&
					<Typography variant="body2" style={{marginBottom: 10}}>
						{I18n.t("Hey ! This mission is missing a lot of pictures (%{cnt}% of the features). If you have some time and live near this area, you should consider going out and take some pictures. You can export the list of features without pictures using the button below.", { cnt: Math.round(percentNoPics) })}
					</Typography>
				}
				<Grid container justify="center" alignItems="center" style={{marginBottom: 10}}>
					<Grid item>
						<Button
							variant="raised"
							color="primary"
							component={Link}
							to={'/mission/'+this.props.mission.id+'/review'}
						>
							<Play />
							{I18n.t("Start review")}
						</Button>
					</Grid>
					
					<Grid item>
						<Button variant="raised" onClick={e => this.setState({ openExport: true, exportAnchor: e.currentTarget})}>
							<CameraOff /> {I18n.t("Export missing pics")}
						</Button>
					</Grid>
				</Grid>
				
				<MissionMap features={this.state.features} />
				
				<ExportMenu
					open={this.state.openExport}
					anchor={this.state.exportAnchor}
					onSelect={f => window.open(API.GetExportMissingUrl(this.props.mission.id, f))}
					onClose={() => this.setState({openExport: false})}
				/>
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
