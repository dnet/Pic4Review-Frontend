import React, { Component } from 'react';
import CONSTS from '../constants';
import Leaflet from 'leaflet';
import LeafletMarker from './MarkerRotate';
import { Map, Marker, TileLayer } from 'react-leaflet';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
Leaflet.Marker = LeafletMarker;

const picIcon = Leaflet.icon({
	iconUrl: 'images/marker_directed_transparent.png',
	iconSize: [22.6, 21.6],
	iconAnchor: [11.3, 16.3]
});

/**
 * Mission review map component allows to display current feature being reviewed.
 */
class MissionReviewMapComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			zoom: 18
		};
	}
	
	render() {
		const style = Object.assign({}, this.props.style, { width: "100%" });
		let markers = null;
		
		if(this.props.pictures !== null && this.props.pictures.length > 0) {
			markers = [];
			
			for(let i in this.props.pictures) {
				const p = this.props.pictures[i];
				markers.push(<Marker
					key={p.pictureUrl}
					position={p.coordinates}
					icon={picIcon}
					iconAngle={p.direction}
					onClick={() => { PubSub.publish("UI.MISSION.PIC.CLICKED", { id: i }); }}
				/>);
			}
		}
		
		return <Map ref="map" center={this.props.feature.coordinates} zoom={this.state.zoom} style={style}>
			<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			<Marker position={this.props.feature.coordinates} />
			{markers}
		</Map>;
	}
}

export default MissionReviewMapComponent;
