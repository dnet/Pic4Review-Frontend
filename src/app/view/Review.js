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
			zoom: 19
		};
	}
	
	render() {
		return <div>
			<Grid container style={{width: "100%"}}>
				<Grid item xs="3">
					<Typography type="subheading">{I18n.t("Details")}</Typography>
					<Map id="p4r-review-map" position={this.props.feature.geometry.coordinates} zoom={this.state.zoom}>
						<TileLayer
							attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						<Marker position={this.props.feature.geometry.coordinates} />
					</Map>
					<Grid container>
						<Grid item xs="6">
							<Button raised color="primary">{I18n.t("Done")}</Button>
						</Grid>
						<Grid item xs="6">
							<Button raised color="default">{I18n.t("Skip")}</Button>
						</Grid>
					</Grid>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Key</TableCell>
								<TableCell>Value</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell>Key</TableCell>
								<TableCell>Value</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Grid>
				<Grid item xs="9" style={{paddingRight: 0}}>
					<Typography type="subheading">{I18n.t("Pictures")}</Typography>
					<GridList cols={4} cellHeight={100} style={{flexWrap: "nowrap"}}>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
						<GridListTile><img src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" /></GridListTile>
					</GridList>
					<Grid container>
						<Grid item xs="12">
							<img style={{ width: "100%" }} src="https://d1cuyjsrcm0gby.cloudfront.net/qWShq9KX3I4U8Aprgo_95g/thumb-2048.jpg" />
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</div>;
	}
}

export default Review;
