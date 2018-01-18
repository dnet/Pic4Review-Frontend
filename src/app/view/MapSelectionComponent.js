import React, { Component } from 'react';
import CONSTS from '../constants';
import Leaflet from 'leaflet';
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
	
	render() {
		const style = Object.assign({}, this.props.style, { width: "100%", marginTop: 10 });
		
		return <div>
			<Typography type="subheading">{I18n.t("Area")}</Typography>
			<Typography type="caption">{I18n.t("Select an area by pressing Ctrl key and dragging over map with left mouse button")}</Typography>
			<Map ref="map" center={[this.state.lat, this.state.lng]} zoom={this.state.zoom} style={style}>
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			</Map>
		</div>;
	}
	
	componentDidMount() {
		this.refs.map.leafletElement.selectArea.enable();
		this.refs.map.leafletElement.on("areaselected", e => {
			this.props.onChange(e.bounds);
			
			//Show selection over map
			if(this.lastSelect) {
				this.refs.map.leafletElement.removeLayer(this.lastSelect);
			}
			
			this.lastSelect = Leaflet.rectangle(e.bounds, { color: "red" });
			this.lastSelect.addTo(this.refs.map.leafletElement);
		});
	}
	
	componentWillUnmount() {
		this.refs.map.leafletElement.off("areaselected");
		
		if(this.lastSelect) {
			this.refs.map.leafletElement.removeLayer(this.lastSelect);
		}
	}
}

export default MapSelectionComponent;
