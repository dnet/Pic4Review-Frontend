import React, { Component } from 'react';
import CONSTS from '../../constants';
import Leaflet from 'leaflet';
import LeafletMarker from '../MarkerRotate';
import { Map, CircleMarker, Marker, TileLayer } from 'react-leaflet';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
Leaflet.Marker = LeafletMarker;

const picIcon = Leaflet.icon({
	iconUrl: 'images/marker_directed_transparent.png',
	iconSize: [22.6, 21.6],
	iconAnchor: [11.3, 16.3]
});

const picSelectedIcon = Leaflet.icon({
	iconUrl: 'images/marker_directed_opaque.png',
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
		this.markers = null;
		
		if(this.props.pictures !== null && this.props.pictures.length > 0) {
			this.markers = [];
			
			for(let i in this.props.pictures) {
				const p = this.props.pictures[i];
				this.markers.push(<Marker
					key={p.pictureUrl}
					position={p.coordinates}
					icon={this.props.currentPictureId == i || (i === 0 && this.props.currentPictureId === null) ? picSelectedIcon : picIcon}
					iconAngle={p.direction}
					ref={"marker-"+i}
					onClick={() => this.props.onPicClicked(i)}
				/>);
			}
		}
		
		return <Map ref="map" center={this.props.feature.coordinates} zoom={this.state.zoom} style={style}>
			<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			<CircleMarker center={this.props.feature.coordinates} radius={8} color="red" fillColor="red" fillOpacity={0.7} />
			{this.markers}
		</Map>;
	}
	
	componentWillReceiveProps(nextProps) {
		this.markers.forEach((m, i) => {
			this.refs["marker-"+i].leafletElement.setIcon(nextProps.currentPictureId == i ? picSelectedIcon : picIcon);
		});
	}
}

export default MissionReviewMapComponent;
