import React, { Component } from 'react';
import CONSTS from '../constants';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import { GridList, GridListTile } from 'material-ui/GridList';
import Hash from 'object-hash';
import Leaflet from 'leaflet';
import { Map, Marker, TileLayer } from 'react-leaflet';
import P4C from 'pic4carto';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Typography from 'material-ui/Typography';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;

/**
 * Review component allows to review dataset features one by one.
 */
class Review extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			zoom: 16,
			radius: 20,
			pictures: null,
			lastStatus: null,
			updatePictures: true,
			picId: null
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
		this.setState({ picId: id });
	}
	
	/**
	 * Update pictures shown in gallery
	 * @private
	 */
	_updatePictures() {
		console.log("update pics", this.props.feature, this.state.updatePictures);
		if(this.props.feature && this.state.updatePictures) {
			console.log("start dl");
			this.picMan.startPicsRetrievalAround(
				new P4C.LatLng(this.props.feature.geometry.coordinates[1], this.props.feature.geometry.coordinates[0]),
				this.state.radius,
				{
					towardsCenter: true
				}
			)
			.then(pictures => {
				console.log("dl done");
				if(pictures.length > 0) {
					this.setState({ pictures: pictures, lastStatus: "ok", updatePictures: false, picId: 0 });
				}
				else {
					this.setState({ pictures: null, lastStatus: "ok", updatePictures: false, picId: null });
					PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("No images available for this feature") });
				}
			})
			.catch(e => {
				console.log("dl failed");
				this.setState({ pictures: null, lastStatus: "fail", updatePictures: false, picId: null });
				PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: I18n.t("Can't get images for this feature") });
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
		if(this.state.pictures) {
			const pics = [];
			for(let i in this.state.pictures) {
				const p = this.state.pictures[i];
				pics.push(<GridListTile key={p.pictureUrl}><img src={p.pictureUrl} onClick={() => {this.setCurrentPic(i); }} /></GridListTile>);
			}
			picGallery = <GridList cols={4} cellHeight={100} style={{flexWrap: "nowrap"}}>{pics}</GridList>;
			currentPic = <img style={{ maxWidth: "100%", maxHeight: "70%" }} src={this.state.pictures[this.state.picId].pictureUrl} />
		}
		
		return <div>
			<Grid container style={{width: "100%"}}>
				<Grid item xs={3}>
					<Typography type="subheading">{I18n.t("Details")}</Typography>
					<Map id="p4r-review-map" center={position} zoom={this.state.zoom} ref="map">
						<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
						<Marker position={position} />
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
					<Typography type="subheading">{I18n.t("Pictures")}</Typography>
					{picGallery}
					<Grid container>
						<Grid item xs={12} style={{textAlign: "center"}}>
							{currentPic}
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</div>;
	}
	
	componentWillReceiveProps(nextProps, nextState) {
		//Check if pictures should be downloaded
		if(this.state.pictures === null && nextProps.feature && this.lastStatus === null) {
			this.setState({ updatePictures: true });
		}
		else if(this.props.feature && nextProps.feature && Hash(this.props.feature) !== Hash(nextProps.feature)) {
			this.setState({ updatePictures: true });
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
