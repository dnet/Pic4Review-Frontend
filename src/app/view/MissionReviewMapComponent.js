import React, { Component } from 'react';
import CONSTS from '../constants';
import Leaflet from 'leaflet';
import LeafletMarker from './MarkerRotate';
import { Map, Marker, TileLayer } from 'react-leaflet';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
Leaflet.Marker = LeafletMarker;

/**
 * Mission review map component allows to display current feature being reviewed.
 */
class MissionReviewMapComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			zoom: 19
		};
	}
	
	render() {
		return <div>Carte</div>;
	}
}

export default MissionReviewMapComponent;
