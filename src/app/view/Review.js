import React, { Component } from 'react';
import CONSTS from '../constants';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import Grid from 'material-ui/Grid';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import Hash from 'object-hash';
import IconButton from 'material-ui/IconButton';
import { Information, Pencil, Check, SkipForward } from 'mdi-material-ui';
import Leaflet from 'leaflet';
import LeafletMarker from './MarkerRotate';
import { Map, Marker, TileLayer } from 'react-leaflet';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Typography from 'material-ui/Typography';
import withWidth from 'material-ui/utils/withWidth';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
Leaflet.Marker = LeafletMarker;

const picIcon = Leaflet.icon({
	iconUrl: 'images/marker_directed_transparent.png',
	iconSize: [22.6, 21.6], //Original 68,65
	iconAnchor: [11.3, 16.3] //Original 34,49
});

const IMG_COLS = { "xs": 1, "sm": 2, "md": 3, "lg": 4, "xl": 5 };
const IMG_HEIGHT = { "xs": 150, "sm": 150, "md": 200, "lg": 200, "xl": 200 };

/**
 * Review component allows to review dataset features one by one.
 */
class Review extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			zoom: 19,
			picId: null,
			dialogOpen: false,
			pictures: null
		};
	}
	
	doneClicked() {
		this.props.feature.status = "reviewed";
		
		/**
		 * Event sent when feature was edited
		 * @event UI.FEATURE.CHANGED
		 * @type {Feature} The feature
		 * @memberof PubSub
		 */
		PubSub.publish("UI.FEATURE.CHANGED", this.props.feature);
	}
	
	skipClicked() {
		this.props.feature.status = "skipped";
		PubSub.publish("UI.FEATURE.CHANGED", this.props.feature);
	}
	
	/**
	 * Opens and zoom in JOSM on current picture area
	 */
	editJOSM() {
		let circle = Leaflet.circle(
			this.props.feature.coordinates,
			{ radius: 50 }
		).addTo(this.refs.map.leafletElement);
		
		let bbox = circle.getBounds();
		this.refs.map.leafletElement.removeLayer(circle);
		
		//Ajax request
		const url = CONSTS.JOSM_URL+"left="+bbox.getWest()+"&right="+bbox.getEast()+"&top="+bbox.getNorth()+"&bottom="+bbox.getSouth();
		const xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = () => {
			if(xmlhttp.readyState === XMLHttpRequest.DONE) {
				if(xmlhttp.status === 200) {
					PubSub.publish("UI.MESSAGE.SHOW", { type: "info", message: I18n.t("Opened in JOSM") });
				}
				else {
					PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: I18n.t("Can't open in JOSM, are you sure remote control is enabled ?") });
				}
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.timeout = 10000;
		xmlhttp.ontimeout = () => {
			PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: I18n.t("Can't open in JOSM, are you sure remote control is enabled ?") });
		};
		xmlhttp.send();
	}
	
	/**
	 * Opens ID editor on current picture area
	 */
	editId() {
		window.open(
			CONSTS.ID_URL+"19/"
				+this.props.feature.coordinates.join("/"),
			"_blank"
		).focus();
	}
	
	/**
	 * Change ID of picture to display
	 */
	setCurrentPic(id) {
		this.setState({ picId: id, dialogOpen: true });
	}
	
	/**
	 * Handler for closing of picture dialog.
	 */
	handleDialogClose() {
		this.setState({ dialogOpen: false });
	}
	
	/**
	 * Update pictures in state
	 * @private
	 */
	_updatePictures() {
		this.props.feature
		.getPictures(this.props.radius)
		.then(pics => {
			this.setState({ pictures: pics });
		})
		.catch(e => {
			PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: I18n.t("Can't retrieve pictures around this feature") });
			console.error(e);
			this.setState({ pictures: [] });
		});
	}
	
	render() {
		const styleBtn = { width: "100%", height: "100%" };
		
		const position = this.props.feature.coordinates;
		const tags = Object.keys(this.props.feature.properties).map(k => {
			return <TableRow key={k}>
				<TableCell>{k}</TableCell>
				<TableCell>{this.props.feature.properties[k]}</TableCell>
			</TableRow>;
		});
		
		let picGallery = null;
		let currentPic = null;
		let markers = null;
		
		if(this.state.pictures !== null && this.state.pictures.length > 0) {
			const pics = [];
			markers = [];
			
			for(let i in this.state.pictures) {
				const p = this.state.pictures[i];
				pics.push(
					<GridListTile key={p.pictureUrl}>
						<img src={p.pictureUrl} onClick={() => { this.setCurrentPic(i); }} style={{cursor:"pointer"}} />
						<GridListTileBar titlePosition="top" style={{background: "none"}} actionIcon={
							<IconButton href={p.detailsUrl} target="_blank">
								<Information style={{color:"white"}} />
							</IconButton>
						} />
					</GridListTile>);
				
				markers.push(<Marker key={p.pictureUrl} position={p.coordinates} icon={picIcon} iconAngle={p.direction} onClick={() => {this.setCurrentPic(i); }} />);
			}
			
			picGallery = <GridList cols={IMG_COLS[this.props.width]} cellHeight={IMG_HEIGHT[this.props.width]}>{pics}</GridList>;
			
			if(this.state.picId) {
				currentPic =
					<Dialog open={this.state.dialogOpen} onClose={this.handleDialogClose.bind(this)} maxWidth="md">
						<img onClick={this.handleDialogClose.bind(this)} src={this.state.pictures[this.state.picId].pictureUrl} style={{maxWidth: "100%", objectFit: "cover"}} />
					</Dialog>;
			}
		}
		else if(this.state.pictures !== null) {
			picGallery = <Typography type="body1" align="center">{I18n.t("No pictures available around this feature")}</Typography>;
		}
		else {
			picGallery = <Grid container><Grid item xs style={{textAlign: "center"}}><CircularProgress size={100} /></Grid></Grid>;
		}
		
		return <div style={this.props.style}>
			<Grid container style={{width: "100%"}}>
				<Grid item xs={12} sm={4} lg={3}>
					<Map ref="map" center={position} zoom={this.state.zoom} style={{width:"100%", height:"200px"}}>
						<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
						<Marker position={position} />
						{markers}
					</Map>
					<Grid container style={{marginTop: 5}}>
						<Grid item xs={6} md={6} xl={3}>
							<Button raised color="default" onClick={this.editJOSM.bind(this)} style={styleBtn}>
								<Pencil />
								{I18n.t("JOSM")}
							</Button>
						</Grid>
						<Grid item xs={6} md={6} xl={3}>
							<Button raised color="default" onClick={this.editId.bind(this)} style={styleBtn}>
								<Pencil />
								{I18n.t("iD")}
							</Button>
						</Grid>
						<Grid item xs={6} md={6} xl={3}>
							<Button raised color="primary" onClick={this.doneClicked.bind(this)} style={styleBtn}>
								<Check />
								{I18n.t("Done")}
							</Button>
						</Grid>
						<Grid item xs={6} md={6} xl={3}>
							<Button raised color="accent" onClick={this.skipClicked.bind(this)} style={styleBtn}>
								<SkipForward />
								{I18n.t("Skip")}
							</Button>
						</Grid>
					</Grid>
					<Table style={{marginTop: 10, border: "1px solid lightgray", borderCollapse: "unset"}}>
						<TableHead>
							<TableRow>
								<TableCell>{I18n.t("Key")}</TableCell>
								<TableCell>{I18n.t("Value")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{tags}
						</TableBody>
					</Table>
				</Grid>
				<Grid item xs={12} sm={8} lg={9} style={{paddingRight: 0}}>
					{picGallery}
				</Grid>
			</Grid>
			{currentPic}
		</div>;
	}
	
	componentWillReceiveProps(nextProps) {
		if(this.props.feature !== nextProps.feature) {
			this._updatePictures();
		}
	}
}

export default withWidth()(Review);
