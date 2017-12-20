import React, { Component } from 'react';
import Button from 'material-ui/Button';
import CONSTS from '../constants';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import Leaflet from 'leaflet';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
const STATUS_COLOR = { "new": "grey", "ok": "green", "skip": "orange" };

/**
 * Summary view allows to display dataset main statistics and features to user.
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
	
	startClicked() {
		PubSub.publish("UI.TAB.SHOW", "review");
	}
	
	clearClicked() {
		PubSub.publish("UI.ASK.CLEAR");
	}
	
	_geojsonBounds() {
		if(this.refs.map && this.refs.geojson) {
			this.refs.map.leafletElement.fitBounds(this.refs.geojson.leafletElement.getBounds());
			this.setState({ datasetShown: true });
		}
		else {
			setTimeout(this._geojsonBounds.bind(this), 100);
		}
	}
	
	_pointToLayer(geojson, latlng) {
		let color = STATUS_COLOR[this.props.dataset.review[geojson.properties.p4rid]] || STATUS_COLOR.new;
		return Leaflet.circleMarker(latlng, { radius: 7, stroke: false, fill: true, fillColor: color, fillOpacity: 1 }).on("click", () => {
			PubSub.publish("UI.FEATURE.SHOW", geojson.properties.p4rid);
		});
	}
	
	_clearDataLayers() {
		if(this.refs && this.refs.map && this.refs.geojson) {
			if(this.refs.map.leafletElement.hasLayer(this.refs.geojson.leafletElement)) {
				this.refs.map.leafletElement.removeLayer(this.refs.geojson.leafletElement);
				delete this.refs.geojson;
			}
		}
	}
	
	render() {
		const statusNames = { "new": I18n.t("To review"), "ok": I18n.t("Reviewed"), "skip": I18n.t("Skipped") };
		const legend = Object.keys(statusNames).map(s => {
			return <span className="p4r-legend" key={s}>
				<span style={{backgroundColor: STATUS_COLOR[s]}}> </span>
				{statusNames[s]}
			</span>;
		});
		
		let position = [this.state.lat, this.state.lng];
		let zoom = this.state.zoom;
		let datalayer = null;
		
		if(this.props.dataset) {
			if(this.props.dataset.type === "geojson") {
				datalayer = <GeoJSON ref="geojson" data={this.props.dataset.data} pointToLayer={this._pointToLayer.bind(this)} />;
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
			this._geojsonBounds();
		}
	}
	
	componentWillUnmount() {
		this._clearDataLayers();
	}
}

export default Summary;
