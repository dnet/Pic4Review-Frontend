import React, { Component } from 'react';
import Button from 'material-ui/Button';
import CONSTS from '../constants';
import Leaflet from 'leaflet';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';

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
			geojson: null
		};
		
		if(this.props.dataset && this.props.dataset.type === "geojson") {
			this.state.geojson = this.props.dataset.data;
		}
	}
	
	render() {
		let position = [this.state.lat, this.state.lng];
		let zoom = this.state.zoom;
		let datalayer = null;
		
		if(this.state.geojson) {
			datalayer = <GeoJSON ref="geojson" data={this.state.geojson} pointToLayer={this._pointToLayer} />;
		}
		
		return <div>
			<Button raised color="primary" onClick={this.startClicked}>{I18n.t("Start review")}</Button>
			<Button raised color="accent">{I18n.t("Clear review")}</Button>
			<Map ref="map" id="p4r-summary-map" center={position} zoom={zoom}>
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
				{datalayer}
			</Map>
		</div>;
	}
	
	componentDidMount() {
		if(this.state.geojson) {
			this._geojsonBounds();
		}
	}
	
	startClicked() {
		PubSub.publish("UI.TAB.SHOW", "review");
	}
	
	_geojsonBounds() {
		if(this.refs.map && this.refs.geojson) {
			this.refs.map.leafletElement.fitBounds(this.refs.geojson.leafletElement.getBounds());
		}
		else {
			setTimeout(this._geojsonBounds.bind(this), 100);
		}
	}
	
	_pointToLayer(geojson, latlng) {
		let color = 'gray';
		switch(geojson.properties.pr4status) {
			case "done":
				color = 'green';
				break;
			case "skip":
				color = 'orange';
				break;
		}
		return Leaflet.circleMarker(latlng, { radius: 5, stroke: false, fill: true, fillColor: color, fillOpacity: 1 });
	}
}

export default Summary;
