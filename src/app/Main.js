import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Tabs, { Tab } from 'material-ui/Tabs';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Input from 'material-ui/Input';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Leaflet from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

Leaflet.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/images/'
const theme = createMuiTheme({});

class Main extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			tabValue: 0,
			sourceFormatValue: "geojson",
			fileLoaded: false,
			lat: 48.1,
			lng: -1.7,
			zoom: 13
		};
	}
	
	changeTab(event, value) {
		this.setState({ tabValue: value });
	}

	render() {
		let content = null;
		const position = [this.state.lat, this.state.lng];
		
		switch(this.state.tabValue) {
			case 0:
				content = <div>
					<FormControl component="sourceselector" required>
						<FormLabel component="legend">{I18n.t("Source format")}</FormLabel>
						<RadioGroup
							aria-label="sourceformat"
							name="format"
							value={this.state.sourceFormatValue}
							row
						>
							<FormControlLabel value="geojson" disabled control={<Radio />} label={I18n.t("GeoJSON")} />
						</RadioGroup>
						
						<FormLabel component="legend">{I18n.t("Source file")}</FormLabel>
						<Input name="sourcefile" type="file" />
						
						<Button raised color="primary">{I18n.t("Upload file")}</Button>
					</FormControl>
				</div>;
				break;
			
			case 1:
				content = <div>
					<Button raised color="primary">{I18n.t("Start review")}</Button>
					<Button raised color="accent">{I18n.t("Clear review")}</Button>
					<Map id="p4r-review-map" center={position} zoom={this.state.zoom}>
						<TileLayer
							attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						<Marker position={position}>
							<Popup>
								<span>
									A pretty CSS3 popup. <br /> Easily customizable.
								</span>
							</Popup>
						</Marker>
					</Map>
				</div>;
				break;
		}
		
		return (
			<MuiThemeProvider theme={theme}>
				<div>
					<AppBar position="static">
						<Toolbar>
							<Typography type="title" gutterBottom color="inherit">
								{I18n.t("Pic4Review")}
							</Typography>
							<Typography type="subtitle" style={{marginLeft: 10}} gutterBottom>
								{I18n.t("Alpha release")}
							</Typography>
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
						<Tab label={I18n.t("Parameters")} />
					</Tabs>
					
					{content}
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
