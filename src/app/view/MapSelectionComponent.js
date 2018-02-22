import React, { Component } from 'react';
import CONSTS from '../constants';
import Leaflet from 'leaflet';
import Geocoder from 'leaflet-control-geocoder';
import { Map, TileLayer } from 'react-leaflet';
import SelectArea from 'leaflet-area-select';
import Typography from 'material-ui/Typography';

/**
 * Mission review map component allows to display current feature being reviewed.
 */
class MapSelectionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			zoom: 0,
			lat: 0,
			lng: 0
		};
	}
	
	/**
	 * Restore eventual bounds from props
	 * @private
	 */
	_boundsFromProps() {
		//Restore previous area
		if(this.props.area) {
			//We recreate because it might be bounds from P4C
			let bounds = Leaflet.latLngBounds([
				this.props.area.getSouth(),
				this.props.area.getWest() ], [
				this.props.area.getNorth(),
				this.props.area.getEast()
			]);
			
			this._showBounds(bounds, false);
		}
	}
	
	_showBounds(bounds, notify) {
		notify = notify !== false;
		
		//Show selection over map
		if(this.lastSelect) {
			this.refs.map.leafletElement.removeLayer(this.lastSelect);
		}
		
		this.lastSelect = Leaflet.rectangle(bounds, { color: "red", interactive: false });
		this.lastSelect.addTo(this.refs.map.leafletElement);
		this.refs.map.leafletElement.fitBounds(bounds);
		
		if(notify) {
			this.props.onChange(bounds);
		}
	}
	
	render() {
		const style = Object.assign({}, this.props.style, { width: "100%", marginTop: 10 });
		
		return <div>
			<Typography variant="subheading">{I18n.t("Area")}</Typography>
			<Typography variant="caption">{I18n.t("Select an area (for example, a city) using the search bar, or by pressing Ctrl key and dragging over map with left mouse button")}</Typography>
			<Map ref="map" center={[this.state.lat, this.state.lng]} zoom={this.state.zoom} style={style}>
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			</Map>
		</div>;
	}
	
	componentDidMount() {
		//Restore previous area
		this._boundsFromProps();
		
		//Enable select
		this.refs.map.leafletElement.selectArea.enable();
		
		//Add geocoder
		Leaflet.Control
		.geocoder({defaultMarkGeocode: false, collapsed: false, placeholder: I18n.t("Area or city name...")})
		.on("markgeocode", e => {
			this._showBounds(e.geocode.bbox);
		})
		.addTo(this.refs.map.leafletElement);
		
		//Show select
		this.refs.map.leafletElement.on("areaselected", e => {
			this._showBounds(e.bounds);
		});
	}
	
	componentDidUpdate() {
		this._boundsFromProps();
	}
	
	componentWillUnmount() {
		this.refs.map.leafletElement.off("areaselected");
		
		if(this.lastSelect) {
			this.refs.map.leafletElement.removeLayer(this.lastSelect);
		}
	}
}

export default MapSelectionComponent;
