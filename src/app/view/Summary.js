import React, { Component } from 'react';
import Button from 'material-ui/Button';
import CONSTS from '../constants';
import Leaflet from 'leaflet';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import Hash from 'object-hash';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;

/**
 * Summary view allows to display dataset main statistics and features to user.
 */
class Summary extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			lat: 48.1,
			lng: -1.7,
			zoom: 13,
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
		let color = 'gray';
		switch(this.props.dataset.review[geojson.properties.p4rid]) {
			case "done":
				color = 'green';
				break;
			case "skip":
				color = 'orange';
				break;
		}
		return Leaflet.circleMarker(latlng, { radius: 5, stroke: false, fill: true, fillColor: color, fillOpacity: 1 });
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
		let position = [this.state.lat, this.state.lng];
		let zoom = this.state.zoom;
		let datalayer = null;
		
		if(this.props.dataset) {
			if(this.props.dataset.type === "geojson") {
				datalayer = <GeoJSON ref="geojson" data={this.props.dataset.data} pointToLayer={this._pointToLayer.bind(this)} />;
			}
		}
		
		return <div style={this.props.style}>
			<Button raised color="primary" onClick={this.startClicked}>{I18n.t("Start review")}</Button>
			<Button raised color="accent" onClick={this.clearClicked}>{I18n.t("Clear review")}</Button>
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
