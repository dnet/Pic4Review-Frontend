import React, { Component } from 'react';
import CONSTS from '../constants';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import Grid from 'material-ui/Grid';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import Hash from 'object-hash';
import IconButton from 'material-ui/IconButton';
import { Information } from 'mdi-material-ui';
import Leaflet from 'leaflet';
import LeafletMarker from './MarkerRotate';
import { Map, Marker, TileLayer } from 'react-leaflet';
import P4C from 'pic4carto';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Typography from 'material-ui/Typography';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
Leaflet.Marker = LeafletMarker;

const picIcon = Leaflet.icon({
	iconUrl: 'images/marker_directed_transparent.png',
	iconSize: [22.6, 21.6], //Original 68,65
	iconAnchor: [11.3, 16.3] //Original 34,49
});

/**
 * Review component allows to review dataset features one by one.
 */
class Review extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			zoom: 19,
			radius: 20,
			pictures: null,
			lastStatus: null,
			updatePictures: true,
			picId: null,
			dialogOpen: false
		};
		
		this.picMan = new P4C.PicturesManager();
	}
	
	doneClicked() {
		PubSub.publish("UI.FEATURE.DONE");
	}
	
	skipClicked() {
		PubSub.publish("UI.FEATURE.SKIP");
	}
	
	/**
	 * Opens and zoom in JOSM on current picture area
	 */
	editJOSM() {
		let circle = Leaflet.circle(
			[
				this.props.feature.geometry.coordinates[1],
				this.props.feature.geometry.coordinates[0]
			],
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
				+this.props.feature.geometry.coordinates[1]
				+"/"
				+this.props.feature.geometry.coordinates[0],
			"_blank"
		).focus();
	}
	
	/**
	 * Change ID of picture to display
	 */
	setCurrentPic(id) {
		this.setState({ picId: id, dialogOpen: true });
	}
	
	handleDialogClose() {
		this.setState({ dialogOpen: false });
	}
	
	/**
	 * Update pictures shown in gallery
	 * @private
	 */
	_updatePictures() {
		if(this.props.feature && this.state.updatePictures) {
			this.picMan.startPicsRetrievalAround(
				new P4C.LatLng(this.props.feature.geometry.coordinates[1], this.props.feature.geometry.coordinates[0]),
				this.state.radius,
				{
					towardscenter: true
				}
			)
			.then(pictures => {
				if(pictures.length > 0) {
					this.setState({ pictures: pictures, lastStatus: "ok", updatePictures: false, picId: 0 });
				}
				else {
					this.setState({ pictures: null, lastStatus: "ok", updatePictures: false, picId: null });
				}
			})
			.catch(e => {
				this.setState({ pictures: null, lastStatus: "fail", updatePictures: false, picId: null });
			});
		}
	}
	
	render() {
		const position = [ this.props.feature.geometry.coordinates[1], this.props.feature.geometry.coordinates[0] ];
		const tags = Object.keys(this.props.feature.properties).filter(k => k !== "p4rid").map(k => {
			return <TableRow key={k}>
				<TableCell>{k}</TableCell>
				<TableCell>{this.props.feature.properties[k]}</TableCell>
			</TableRow>;
		});
		
		let picGallery = null;
		let currentPic = null;
		let markers = null;
		
		if(this.state.pictures) {
			const pics = [];
			markers = [];
			
			for(let i in this.state.pictures) {
				const p = this.state.pictures[i];
				pics.push(
					<GridListTile key={p.pictureUrl}>
						<img src={p.pictureUrl} onClick={() => {this.setCurrentPic(i); }} style={{cursor:"pointer"}} />
						<GridListTileBar titlePosition="top" style={{background: "none"}} actionIcon={
							<IconButton href={p.detailsUrl} target="_blank">
								<Information style={{color:"white"}} />
							</IconButton>
						} />
					</GridListTile>);
				
				markers.push(<Marker key={p.pictureUrl} position={p.coordinates} icon={picIcon} iconAngle={p.direction} onClick={() => {this.setCurrentPic(i); }} />);
			}
			
			picGallery = <GridList cols={4} cellHeight={200}>{pics}</GridList>;
			
			currentPic =
				<Dialog open={this.state.dialogOpen} onClose={this.handleDialogClose.bind(this)} maxWidth="md">
					<img onClick={this.handleDialogClose.bind(this)} src={this.state.pictures[this.state.picId].pictureUrl} />
				</Dialog>;
		}
		else if(this.state.pictures === null && this.state.lastStatus === "ok") {
			picGallery = <Typography type="body1" align="center">{I18n.t("No pictures available around this feature")}</Typography>;
		}
		else if(this.state.pictures === null && this.state.lastStatus === "fail") {
			picGallery = <Typography type="body1" align="center">{I18n.t("Images are temporarily unavailable for this feature")}</Typography>;
		}
		else {
			picGallery = <Grid container><Grid item xs style={{textAlign: "center"}}><CircularProgress size={100} /></Grid></Grid>;
		}
		
		return <div style={this.props.style}>
			<Grid container style={{width: "100%"}}>
				<Grid item xs={3}>
					<Map ref="map" center={position} zoom={this.state.zoom} style={{width:"100%", height:"200px"}}>
						<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
						<Marker position={position} />
						{markers}
					</Map>
					<Grid container>
						<Grid item xs>
							<Button raised color="default" onClick={this.editJOSM.bind(this)}>{I18n.t("Edit in JOSM")}</Button>
						</Grid>
						<Grid item xs>
							<Button raised color="default" onClick={this.editId.bind(this)}>{I18n.t("Edit in iD")}</Button>
						</Grid>
						<Grid item xs>
							<Button raised color="primary" onClick={this.doneClicked}>{I18n.t("Done")}</Button>
						</Grid>
						<Grid item xs>
							<Button raised color="accent" onClick={this.skipClicked}>{I18n.t("Skip")}</Button>
						</Grid>
					</Grid>
					<Table>
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
				<Grid item xs={9} style={{paddingRight: 0}}>
					{picGallery}
				</Grid>
			</Grid>
			{currentPic}
		</div>;
	}
	
	componentWillReceiveProps(nextProps, nextState) {
		//Check if pictures should be downloaded
		if(this.state.pictures === null && nextProps.feature && this.lastStatus === null) {
			this.setState({ updatePictures: true, pictures: null, lastStatus: null, picId: null });
		}
		else if(this.props.feature && nextProps.feature && Hash(this.props.feature) !== Hash(nextProps.feature)) {
			this.setState({ updatePictures: true, pictures: null, lastStatus: null, picId: null });
		}
		else {
			this.setState({ updatePictures: false });
		}
	}
	
	componentDidUpdate() {
		this._updatePictures();
	}
	
	componentDidMount() {
		this._updatePictures();
	}
}

export default Review;
