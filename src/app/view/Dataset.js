import React, { Component } from 'react';
import { Bank, EmoticonPoop, FoodForkDrink, HelpCircle, Tent, Recycle } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';
import List, { ListItem, ListItemText, ListItemIcon } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import Radio, { RadioGroup } from 'material-ui/Radio';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

/**
 * Dataset view handles source format and file selection for user.
 * @name DatasetComponent
 */
class Dataset extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			sourceFormatValue: "osmose",
			sourceFile: null,
			sourceOsmoseThemeId: 0,
			sourceOsmoseAmount: 100,
			sourceOsmosePlace: "",
			sourceOsmoseThemeOpen: false
		};
		
		this.osmoseTypes = [
			{ label: I18n.t("Museum/monument"), description: I18n.t("Given museums or monuments are know from official source, but not present in OpenStreetMap. Please add them if you see it on pictures."), value: "8010", icon: <Bank /> },
			{ label: I18n.t("Missing toilet"), description: I18n.t("Given toilets are known from official source, but not present in OpenStreetMap. Please add them if you see it on pictures."), value: "8180", icon: <EmoticonPoop /> },
			{ label: I18n.t("Recycling container"), description: I18n.t("Given containers might have an invalid description. Check what's wrong (see \"title\" in feature properties) and fix it if possible."), value: "3230", icon: <Recycle /> },
			{ label: I18n.t("Camp site"), description: I18n.t("Given camp sites are know from official source, but not present in OpenStreetMap. Please add them if you see it on pictures."), value: "8140", icon: <Tent /> },
			{ label: I18n.t("Restaurant"), description: I18n.t("Given restaurants are know from official source, but not present in OpenStreetMap. Please add them if you see it on pictures."), value: "8240", icon: <FoodForkDrink /> }
		];
	}
	
	/**
	 * Handler for input file change event.
	 * @memberof DatasetComponent
	 * @instance
	 */
	sourceFileChanged(event) {
		this.setState({ sourceFile: event.target.files[0] });
	}
	
	/**
	 * Upload button clicked.
	 * @memberof DatasetComponent
	 * @instance
	 */
	uploadClick(event) {
		if(this.state.sourceFormatValue === "geojson") {
			if(!this.state.sourceFile) {
				PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("No file selected") });
			}
			else {
				/**
				 * Event sent when a new dataset file was uploaded
				 * @event DATASET.FILE.UPLOADED
				 * @type {Object} Event data
				 * @property {File} file The source file
				 * @property {string} format The source file format (geojson)
				 * @memberof PubSub
				 */
				PubSub.publish("DATASET.FILE.UPLOADED", {
					file: this.state.sourceFile,
					format: this.state.sourceFormatValue
				});
			}
		}
		else if(this.state.sourceFormatValue === "osmose") {
			if(this.state.sourceOsmoseThemeId === null || isNaN(parseInt(this.state.sourceOsmoseThemeId))) {
				PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("Please select an Osmose theme") });
			}
			else if(!this.state.sourceOsmoseAmount || isNaN(parseInt(this.state.sourceOsmoseAmount))) {
				PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("Please select the amount of features you want to review") });
			}
			else {
				/**
				 * Event sent when a new dynamic dataset was defined
				 * @event DATASET.DYNAMIC.DEFINED
				 * @type {Object} Event data
				 * @property {string} type The kind of dataset (osmose)
				 * @property {Object} options The options to pass for dataset creation
				 * @memberof PubSub
				 */
				PubSub.publish("DATASET.DYNAMIC.DEFINED", {
					type: this.state.sourceFormatValue,
					options: {
						itemclass: this.osmoseTypes[this.state.sourceOsmoseThemeId].value,
						amount: parseInt(this.state.sourceOsmoseAmount),
						area: this.state.sourceOsmosePlace.trim().length > 0 ? this.state.sourceOsmosePlace : null
					}
				});
			}
		}
		else {
			PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("No dataset selected") });
		}
	}
	
	render() {
		const styleContainer = Object.assign({}, this.props.style, {textAlign: "center"});
		const styleGroups = {marginBottom: 20};
		
		let fields = null;
		
		switch(this.state.sourceFormatValue) {
			case "geojson":
				fields = <div style={styleGroups}>
					<FormLabel component="legend">{I18n.t("File")}</FormLabel>
					<Input name="sourcefile" type="file" onChange={this.sourceFileChanged.bind(this)} />
				</div>;
				break;
			
			case "osmose":
				fields = <Grid container>
					<Grid item hidden={{only: "xs"}} sm={2} md={3} lg={4}></Grid>
					<Grid item xs={12} sm={8} md={6} lg={4} style={{display: "flex", flexFlow: "column"}}>
						<FormLabel component="legend">{I18n.t("Theme")}</FormLabel>
						<Paper style={{marginTop: 20}}>
							<List>
								<ListItem
									button
									onClick={e => this.setState({ sourceOsmoseThemeOpen: true, sourceOsmoseAnchorEl: e.currentTarget })}
								>
									<ListItemIcon>{this.osmoseTypes[this.state.sourceOsmoseThemeId].icon || <HelpCircle />}</ListItemIcon>
									<ListItemText
										primary={this.osmoseTypes[this.state.sourceOsmoseThemeId].label}
										secondary={this.osmoseTypes[this.state.sourceOsmoseThemeId].description}
									/>
								</ListItem>
							</List>
						</Paper>
						<Menu
							id="osmosetype"
							anchorEl={this.state.sourceOsmoseAnchorEl}
							open={this.state.sourceOsmoseThemeOpen}
							onClose={e => this.setState({ sourceOsmoseThemeOpen: false })}
						>
						{this.osmoseTypes.map((opt, id) => (
							<MenuItem
								key={opt.value}
								selected={id === this.state.sourceOsmoseThemeId}
								onClick={e => this.setState({ sourceOsmoseThemeId: id, sourceOsmoseThemeOpen: false })}
							>
								<ListItemIcon>{opt.icon || <HelpCircle />}</ListItemIcon>
								<ListItemText inset primary={opt.label} />
							</MenuItem>
						))}
						</Menu>
						
						<TextField
							id="place"
							label={I18n.t("Place")}
							value={this.state.sourceOsmosePlace}
							onChange={e => this.setState({sourceOsmosePlace: e.target.value})}
							margin="normal"
							helperText={I18n.t("City or country (empty for whole world)")}
						/>
						
						<TextField
							id="osmoseamount"
							label={I18n.t("Amount of features to review")}
							value={this.state.sourceOsmoseAmount}
							onChange={e => this.setState({sourceOsmoseAmount: e.target.value})}
							type="number"
							margin="normal"
						/>
					</Grid>
				</Grid>;
				break;
		}
		
		return <div style={styleContainer}>
			<FormControl required style={{width: "100%"}}>
				<div style={styleGroups}>
					<FormLabel component="legend">{I18n.t("Source")}</FormLabel>
					<RadioGroup
						name="format"
						value={this.state.sourceFormatValue}
						row
						onChange={(e, v) => this.setState({ sourceFormatValue: v })}
						style={{justifyContent: "space-evenly"}}
					>
						<FormControlLabel value="osmose" control={<Radio />} label={I18n.t("Existing theme")} />
						<FormControlLabel value="geojson" control={<Radio />} label={I18n.t("GeoJSON")} />
					</RadioGroup>
				</div>
				
				{fields}
				
				<div style={{textAlign: "center", marginTop: 20}}>
					<Button
						raised
						color="primary"
						onClick={this.uploadClick.bind(this)}
					>
						{I18n.t("Start")}
					</Button>
				</div>
			</FormControl>
		</div>;
	}
}

export default Dataset;
