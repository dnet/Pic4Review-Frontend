import React, { Component } from 'react';
import CONSTS from '../../constants';
import { CursorMove, Check, Close } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Leaflet from 'leaflet';
import LeafletMarker from '../MarkerRotate';
import { Map, GeoJSON, Marker, TileLayer, LayersControl } from 'react-leaflet';
import Tooltip from 'material-ui/Tooltip';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
Leaflet.Marker = LeafletMarker;

const DEFAULT_ZOOM = 18;

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
			editingGeom: false,
			markEditGeom: null
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
					key={i}
					position={p.coordinates}
					icon={this.props.currentPictureId == i || (i === 0 && this.props.currentPictureId === null) ? picSelectedIcon : picIcon}
					iconAngle={p.direction}
					ref={"marker-"+i}
					onClick={() => this.props.onPicClicked(i)}
				/>);
			}
		}
		
		const feature = this.state.markerEditGeom || this.props.feature;
		
		return <Map ref="map" center={this.props.feature.coordinates} zoom={this.props.zoom || DEFAULT_ZOOM} style={style}>
			{this.props.layers ?
				<LayersControl position="topright">
					{this.props.layers.filter(l => l.type === "tms").map((l,i) => {
						const url = l.url
							.replace(/\{zoom\}/g, "{z}")
							.replace(/\{switch:.+?\}/g, "{s}");
						
						return <LayersControl.BaseLayer name={l.name || l.id} key={l.id} checked={(!this.props.baseLayer && i===0) || (this.props.baseLayer === (l.name || l.id))}>
							<TileLayer
								attribution={l.attribution ? '<a href="'+l.attribution.url+'" target="_blank">'+l.attribution.text+'</a>' : ''}
								url={url}
								minZoom={l.min_zoom || 1}
								maxZoom={l.max_zoom || DEFAULT_ZOOM}
							/>
						</LayersControl.BaseLayer>;
					})}
				</LayersControl>
				:
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			}
			
			{this.state.editingGeom ?
				<Marker
					ref="markerEdit"
					position={Leaflet.GeoJSON.coordsToLatLng(feature.geometry.coordinates)}
					draggable={true}
					onDragEnd={() => this.setState({ markerEditGeom: this.refs.markerEdit.leafletElement.toGeoJSON()})}
				/>
				:
				<GeoJSON
					ref="data"
					data={feature.geometry}
					color="red"
					fillColor="red"
					fillOpacity={0.7}
					onClick={() => this.props.onFeatureClicked()}
					pointToLayer={(geojsonPoint, latlng) => { return Leaflet.circleMarker(latlng, { radius: 8, color: "red", fillColor: "red", fillOpacity: 0.7 }); }}
				/>
			}
			
			{this.markers}
			
			{this.props.featureMove ?
				(this.state.editingGeom ?
					<div style={{ position: "absolute", left: 5, bottom: 5, zIndex: 10000 }}>
						<Button
							variant="fab"
							color="primary"
							onClick={() => this._editGeomDone()}
						>
							<Check />
						</Button>
						<Button
							variant="fab"
							onClick={() => this._editGeomCancelled()}
							style={{marginLeft: 5}}
						>
							<Close />
						</Button>
					</div>
					:
					<Button
						variant="fab"
						style={{ position: "absolute", left: 5, bottom: 5, zIndex: 10000 }}
						onClick={() => this._editGeomStart()}
					>
						<CursorMove />
					</Button>
				)
				: null
			}
		</Map>;
	}
	
	_fitBounds() {
		if(this.refs.map && this.refs.data) {
			this.refs.map.leafletElement.setView(this.refs.data.leafletElement.getBounds().getCenter(), this.props.zoom || DEFAULT_ZOOM);
		}
	}
	
	_editGeomStart() {
		this.setState({ editingGeom: true })
	}
	
	_editGeomDone() {
		this.props.onFeatureMove(this.state.markerEditGeom);
		this.setState({ editingGeom: false });
	}
	
	_editGeomCancelled() {
		this.props.onFeatureMove(this.props.feature);
		this.setState({ editingGeom: false, markerEditGeom: null })
	}
	
	componentDidMount() {
		this._fitBounds();
		
		if(this.refs.map) {
			//Zoom
			this.refs.map.leafletElement.on("zoomend", () => {
				const newzoom = this.refs.map.leafletElement.getZoom();
				
				if(this.props.onZoomChange && newzoom !== this.props.zoom) {
					this.props.onZoomChange(newzoom);
				}
			});
			
			//Base layer
			this.refs.map.leafletElement.on("baselayerchange", e => {
				if(this.props.onBaseLayerChange && e.name !== this.props.baseLayer) {
					this.props.onBaseLayerChange(e.name);
				}
			});
		}
	}
	
	componentDidUpdate() {
		this._fitBounds();
	}
	
	componentWillReceiveProps(nextProps) {
		this.markers.forEach((m, i) => {
			this.refs["marker-"+i].leafletElement.setIcon(nextProps.currentPictureId == i ? picSelectedIcon : picIcon);
		});
	}
	
	componentWillUnmount() {
		this.refs.map.leafletElement.off("zoomend");
		this.refs.map.leafletElement.off("baselayerchange");
	}
}

export default MissionReviewMapComponent;
