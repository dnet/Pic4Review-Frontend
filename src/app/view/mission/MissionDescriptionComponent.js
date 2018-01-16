import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { Play } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Button from 'material-ui/Button';
import CONSTS from '../../constants';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import Leaflet from 'leaflet';
import { Map, TileLayer, FeatureGroup, CircleMarker } from 'react-leaflet';
import { Link } from 'react-router-dom';
import MissionSummary from './MissionSummaryComponent';
import ReactMarkdown from 'react-markdown';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;

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
		
		this.statusColor = { "new": "grey", "reviewed": "green", "skipped": "orange", "nopics": "blue", "cantsee": "red" };
		this.statusNames = { "new": I18n.t("To review"), "reviewed": I18n.t("Reviewed"), "skipped": I18n.t("Skipped"), "nopics": I18n.t("No pictures"), "cantsee": I18n.t("Can't see") };
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
	
	/**
	 * Set map view around feature layer bounds.
	 * @private
	 */
	_featureLayerBounds() {
		if(this.refs.map && this.refs.featureslayer) {
			this.refs.map.leafletElement.fitBounds(this.refs.featureslayer.leafletElement.getBounds());
		}
		else {
			setTimeout(this._featureLayerBounds.bind(this), 100);
		}
	}
	
	/**
	 * Removes feature layers from map.
	 * @private
	 */
	_clearDataLayers() {
		if(this.refs && this.refs.map && this.refs.featureslayer) {
			if(this.refs.map.leafletElement.hasLayer(this.refs.featureslayer.leafletElement)) {
				this.refs.map.leafletElement.removeLayer(this.refs.featureslayer.leafletElement);
				delete this.refs.featureslayer;
			}
		}
	}
	
	render() {
		let position = [this.state.lat, this.state.lng];
		let datalayer = null;
		
		//Legend
		const legend = Object.keys(this.statusNames).map(s => {
			return <span className="p4r-legend" key={s}>
			<span style={{backgroundColor: this.statusColor[s]}}> </span>
			{this.statusNames[s]}
			</span>;
		});
		
		//Features
		if(this.state.features !== null && this.state.features.length > 0) {
			let featurelayers = this.state.features.map(f => {
				const color = this.statusColor[f.status] || this.statusColor.new;
				return <CircleMarker center={f.coordinates} key={f.id} radius={7} stroke={false} fill={true} fillColor={color} fillOpacity={1} />;
			});
			
			if(featurelayers.length === 1) { featurelayers = featurelayers[0]; } //Convert if single item in order to avoid FeatureGroup bug
			
			datalayer = <FeatureGroup ref="featureslayer">{featurelayers}</FeatureGroup>;
		}
		
		return <div style={this.props.style}>
			<MissionSummary mission={this.props.mission} />
			<ReactMarkdown className={this.props.classes.root} source={this.props.mission.description.full} />
			
			<Grid container style={{marginBottom: 10}}>
				<Grid item xs={12} sm={8} md={9}>
					{legend}
				</Grid>
				<Grid item xs={12} sm={4} md={3}>
					<Button
						raised
						color="primary"
						style={{width: "100%"}}
						component={Link}
						to={'/mission/'+this.props.mission.id+'/review'}
					>
						<Play />
						{I18n.t("Start review")}
					</Button>
				</Grid>
			</Grid>
			
			<Map ref="map" center={position} zoom={this.state.zoom} style={{width:"100%", height:"400px"}}>
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
				{datalayer}
			</Map>
		</div>;
	}
	
	componentWillMount() {
		this._updateFeatures();
	}
	
	componentWillUpdate(nextProps, nextState) {
		if(this.props.mission.id !== nextProps.mission.id) {
			this._clearDataLayers();
			this._updateFeatures();
		}
		
		if(
			nextState.features
			&& (
				!this.state.features
				|| nextState.features.length !== this.state.features.length
				|| Hash(nextState.features) !== Hash(this.state.features)
			)
		) {
			this._featureLayerBounds();
		}
	}
	
	componentDidMount() {
		if(!this.state.features !== null) {
			this._featureLayerBounds();
		}
	}
	
	componentWillUnmount() {
		this._clearDataLayers();
	}
}

export default withStyles(styles)(MissionDescriptionComponent);
