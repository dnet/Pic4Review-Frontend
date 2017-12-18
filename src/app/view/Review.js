import React, { Component } from 'react';
import CONSTS from '../constants';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import { GridList, GridListTile } from 'material-ui/GridList';
import Leaflet from 'leaflet';
import { Map, Marker, TileLayer } from 'react-leaflet';
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
			zoom: 16
		};
	}
	
	doneClicked() {
		PubSub.publish("UI.FEATURE.DONE");
	}
	
	skipClicked() {
		PubSub.publish("UI.FEATURE.SKIP");
	}
	
	render() {
		const position = [ this.props.feature.geometry.coordinates[1], this.props.feature.geometry.coordinates[0] ];
		const tags = Object.keys(this.props.feature.properties).filter(k => k !== "p4rid").map(k => {
			return <TableRow key={k}>
				<TableCell>{k}</TableCell>
				<TableCell>{this.props.feature.properties[k]}</TableCell>
			</TableRow>;
		});
		
		return <div>
			<Grid container style={{width: "100%"}}>
				<Grid item xs={3}>
					<Typography type="subheading">{I18n.t("Details")}</Typography>
					<Map id="p4r-review-map" center={position} zoom={this.state.zoom}>
						<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
						<Marker position={position} />
					</Map>
					<Grid container>
						<Grid item xs={6}>
							<Button raised color="primary" onClick={this.doneClicked}>{I18n.t("Done")}</Button>
						</Grid>
						<Grid item xs={6}>
							<Button raised color="default" onClick={this.skipClicked}>{I18n.t("Skip")}</Button>
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
					<GridList cols={4} cellHeight={100} style={{flexWrap: "nowrap"}}>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
					</GridList>
					<Grid container>
						<Grid item xs={12}>
							<img style={{ width: "100%" }} src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" />
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</div>;
	}
}

export default Review;
