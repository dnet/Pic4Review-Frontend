import React, { Component } from 'react';
import Button from 'material-ui/Button';
import CONSTS from '../constants';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import Leaflet from 'leaflet';
import { Map, TileLayer, FeatureGroup, CircleMarker } from 'react-leaflet';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
const STATUS_COLOR = { "new": "grey", "reviewed": "green", "skipped": "orange", "nopics": "blue" };

/**
 * Summary view allows to display dataset main statistics and features to user.
 * @name SummaryComponent
 */
class Summary extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			lat: 0,
			lng: 0,
			zoom: 1,
			datasetShown: false
		};
	}
	
	/**
	 * Handler for click event on "Start review" button.
	 * @memberof SummaryComponent
	 * @instance
	 */
	startClicked() {
		PubSub.publish("UI.TAB.SHOW", "review");
	}
	
	/**
	 * Handler for click event on "Clear review" button.
	 * @memberof SummaryComponent
	 * @instance
	 */
	clearClicked() {
		/**
		 * Event sent when UI was clicked to ask for dataset review clearing
		 * @event UI.ASK.CLEAR
		 * @memberof PubSub
		 */
		PubSub.publish("UI.ASK.CLEAR");
	}
	
	/**
	 * Set map view around feature layer bounds.
	 * @memberof SummaryComponent
	 * @instance
	 * @private
	 */
	_featureLayerBounds() {
		if(this.refs.map && this.refs.featureslayer) {
			this.refs.map.leafletElement.fitBounds(this.refs.featureslayer.leafletElement.getBounds());
			this.setState({ datasetShown: true });
		}
		else {
			setTimeout(this._featureLayerBounds.bind(this), 100);
		}
	}
	
	/**
	 * Removes feature layers from map.
	 * @memberof SummaryComponent
	 * @instance
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
		let zoom = this.state.zoom;
		let datalayer = null;
		
		//Legend
		const statusNames = { "new": I18n.t("To review"), "reviewed": I18n.t("Reviewed"), "skipped": I18n.t("Skipped"), "nopics": I18n.t("No pictures") };
		const legend = Object.keys(statusNames).map(s => {
			return <span className="p4r-legend" key={s}>
				<span style={{backgroundColor: STATUS_COLOR[s]}}> </span>
				{statusNames[s]}
			</span>;
		});
		
		//Render features
		if(this.props.dataset) {
			const features = this.props.dataset.getAllFeatures();
			
			if(features && features.length > 0) {
				const featurelayers = features.map(f => {
					const color = STATUS_COLOR[f.status] || STATUS_COLOR.new;
					const click = () => {
						/**
						* Event sent when a feature should be shown in review tab
						* @event UI.FEATURE.SHOW
						* @type {string} The feature ID
						* @memberof PubSub
						*/
						PubSub.publish("UI.FEATURE.SHOW", f.id);
					};
					
					return <CircleMarker center={f.coordinates} key={f.id} radius={7} stroke={false} fill={true} fillColor={color} fillOpacity={1} onClick={click}></CircleMarker>
				});
				
				datalayer = <FeatureGroup ref="featureslayer">{featurelayers}</FeatureGroup>;
			}
		}
		
		return <div style={this.props.style}>
			<Grid container justify="space-between" style={{marginBottom: 10}}>
				<Grid item xs={12} sm={6} style={{lineHeight: "32px"}}>
					{legend}
				</Grid>
				<Grid item hidden={{mdDown: true}} md={2}>
				</Grid>
				<Grid item xs={6} sm={3} md={2}>
					<Button raised color="primary" onClick={this.startClicked} style={{width: "100%"}}>{I18n.t("Start review")}</Button>
				</Grid>
				<Grid item xs={6} sm={3} md={2}>
					<Button raised color="accent" onClick={this.clearClicked} style={{width: "100%"}}>{I18n.t("Clear review")}</Button>
				</Grid>
			</Grid>
			<Map ref="map" center={position} zoom={zoom} style={{width:"100%", height:"400px"}}>
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
				{datalayer}
			</Map>
		</div>;
	}
	
	componentDidMount() {
		if(!this.state.datasetShown) {
			this._featureLayerBounds();
		}
	}
	
	componentWillUnmount() {
		this._clearDataLayers();
	}
}

export default Summary;
