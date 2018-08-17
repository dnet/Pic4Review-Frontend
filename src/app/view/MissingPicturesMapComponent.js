import React, { Component } from 'react';
import API from '../ctrl/API';
import CONSTS from '../constants';
import Leaflet from 'leaflet';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

/**
 * Missing pictures map component shows a map of pictures which were needed, but not available
 */
class MissingPicturesMapComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			zoom: 0,
			lat: 0,
			lng: 0,
			pics: null
		};
	}
	
	render() {
		const style = Object.assign({}, this.props.style, { width: "100%" });
		
		return <Map ref="map" center={[this.state.lat, this.state.lng]} zoom={this.state.zoom} style={style}>
			<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			{this.state.pics && <MarkerClusterGroup maxClusterRadius={50}>
				<GeoJSON data={this.state.pics} />
			</MarkerClusterGroup>}
		</Map>;
	}
	
	componentWillMount() {
		API.GetPicturesMissing()
		.then(d => this.setState({ pics: d }))
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get missing pictures"), details: e.message });
		});
	}
}

export default MissingPicturesMapComponent;
