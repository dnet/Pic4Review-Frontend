import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Dataset from './Dataset';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import Input from 'material-ui/Input';
import Leaflet from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Snackbar from 'material-ui/Snackbar';
import Summary from './Summary';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Tabs, { Tab } from 'material-ui/Tabs';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

Leaflet.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/images/'
const theme = createMuiTheme({});

/**
 * Main view is the top-level component handling user interface.
 */
class Main extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			tabValue: 0,
			lat: 48.1,
			lng: -1.7,
			zoom: 13,
			snackOpen: false,
			snackMessage: "",
			dataset: null
		};
		
		PubSub.subscribe("UI.MESSAGE.SHOW", (msg, data) => {
			this.setState({
				snackOpen: true,
				snackMessage: data.message
			});
		});
		
		PubSub.subscribe("UI.TAB.SHOW", (msg, data) => {
			const corresp = { "dataset": 0, "summary": 1, "review": 2 };
			this.changeTab(null, corresp[data]);
		});
		
		PubSub.subscribe("DATASET.READY", (msg, data) => {
			this.setState({ dataset: data });
		});
	}
	
	/**
	 * Change the currently shown tab.
	 * @private
	 */
	changeTab(event, value) {
		this.setState({ tabValue: value });
	}
	
	/**
	 * Close the snackbar.
	 */
	closeSnackbar() {
		this.setState({ snackOpen: false });
	}

	render() {
		let content = null;
		const position = [this.state.lat, this.state.lng];
		
		switch(this.state.tabValue) {
			case 0:
				content = <Dataset />;
				break;
			
			case 1:
				content = <Summary dataset={this.state.dataset} />;
				break;
			
			case 2:
				content = <div>
					<Grid container style={{width: "100%"}}>
						<Grid item xs="3">
							<Typography type="subheading">{I18n.t("Details")}</Typography>
							<Map id="p4r-review-map" center={position} zoom={this.state.zoom}>
								<TileLayer
								attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								<Marker position={position}>
								</Marker>
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
									<TableRow>
										<TableCell>Key</TableCell>
										<TableCell>Value</TableCell>
									</TableRow>
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
				break;
		}
		
		return (
			<MuiThemeProvider theme={theme}>
				<div>
					<AppBar position="static">
						<Toolbar>
							<Typography type="title" gutterBottom color="inherit">{I18n.t("Pic4Review")}</Typography>
							<Typography type="subtitle" style={{marginLeft: 10}} gutterBottom>{I18n.t("Alpha release")}</Typography>
						</Toolbar>
					</AppBar>
					
					<Tabs
						value={this.state.tabValue}
						onChange={this.changeTab.bind(this)}
						indicatorColor="primary"
						textColor="primary"
						centered
					>
						<Tab label={I18n.t("Dataset")} />
						<Tab label={I18n.t("Summary")} />
						<Tab label={I18n.t("Review")} />
					</Tabs>
					
					{content}
					
					<Snackbar
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center',
						}}
						open={this.state.snackOpen}
						autoHideDuration={3000}
						onRequestClose={this.closeSnackbar.bind(this)}
						message={this.state.snackMessage}
					/>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
