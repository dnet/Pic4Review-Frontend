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
		const position = [this.state.lat, this.state.lng];
		let datalayer = null;
		
		if(this.state.geojson) {
			datalayer = <GeoJSON data={this.state.geojson} />;
		}
		
		return <div>
			<Button raised color="primary">{I18n.t("Start review")}</Button>
			<Button raised color="accent">{I18n.t("Clear review")}</Button>
			<Map id="p4r-summary-map" center={position} zoom={this.state.zoom}>
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
				{datalayer}
			</Map>
		</div>;
	}
}

export default Summary;
