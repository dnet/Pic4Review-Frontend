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
	
	render() {
		let position = [this.state.lat, this.state.lng];
		let zoom = this.state.zoom;
		let datalayer = null;
		
		//Clear previous dataset
		console.log(this.refs);
		if(this.refs.geojson) {
			console.log("map", this.refs.geojson.map);
			console.log("elem", this.refs.geojson.leafletElement);
			console.log("has", this.refs.geojson.map && this.refs.geojson.map.hasLayer(this.refs.geojson.leafletElement));
			if(this.refs.geojson.map && this.refs.geojson.map.hasLayer(this.refs.geojson.leafletElement)) {
				console.log("delete");
				this.refs.geojson.map.removeLayer(this.refs.geojson.leafletElement);
			}
			
			delete this.refs.geojson;
		}
		
		if(this.props.dataset) {
			if(this.props.dataset.type === "geojson") {
				datalayer = <GeoJSON ref="geojson" data={this.props.dataset.data} pointToLayer={this._pointToLayer.bind(this)} />;
			}
		}
		
		return <div>
			<Button raised color="primary" onClick={this.startClicked}>{I18n.t("Start review")}</Button>
			<Button raised color="accent" onClick={this.clearClicked}>{I18n.t("Clear review")}</Button>
			<Map ref="map" id="p4r-summary-map" center={position} zoom={zoom}>
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
}

export default Summary;
