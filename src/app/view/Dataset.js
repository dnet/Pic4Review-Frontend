import React, { Component } from 'react';
import Button from 'material-ui/Button';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';
import MenuItem from 'material-ui/Menu/MenuItem';
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
			sourceOsmoseType: "8180",
			sourceOsmoseTime: "10",
			sourceOsmosePlace: ""
		};
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
			if(!this.state.sourceOsmoseType || isNaN(parseInt(this.state.sourceOsmoseType))) {
				PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("Please select an Osmose theme") });
			}
			else if(!this.state.sourceOsmoseTime || isNaN(parseInt(this.state.sourceOsmoseTime))) {
				PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("Please select the time you have to contribute") });
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
						itemclass: this.state.sourceOsmoseType,
						time: parseInt(this.state.sourceOsmoseTime)
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
				const types = [
					{ label: I18n.t("Missing toilets"), description: I18n.t("Given toilets are known from official source, but not present in OpenStreetMap. Please add them if you see it on pictures."), value: "8180" },
					{ label: I18n.t("Recycling container"), description: I18n.t("Given containers might have an invalid description. Check what's wrong (see \"title\" in feature properties) and fix it if possible."), value: "3230" }
				];
				fields = <div>
					<FormLabel component="legend">{I18n.t("Available time")}</FormLabel>
					<RadioGroup
						name="time"
						value={this.state.sourceOsmoseTime}
						row
						onChange={(e, v) => this.setState({ sourceOsmoseTime: v })}
						style={{justifyContent: "space-evenly"}}
					>
						<FormControlLabel value="10" control={<Radio />} label={I18n.t("10 minutes")} />
						<FormControlLabel value="30" control={<Radio />} label={I18n.t("30 minutes")} />
						<FormControlLabel value="60" control={<Radio />} label={I18n.t("1 hour")} />
					</RadioGroup>
					
					<TextField
						id="osmosetype"
						select
						label={I18n.t("Theme")}
						value={this.state.sourceOsmoseType}
						onChange={e => this.setState({sourceOsmoseType: e.target.value})}
						margin="normal"
					>
					{types.map(opt => (
						<MenuItem key={opt.value} value={opt.value}>
							{opt.label}
						</MenuItem>
					))}
					</TextField>
					
					<Typography type="caption">
						{types.filter(t => t.value == this.state.sourceOsmoseType)[0].description}
					</Typography>
					
					<TextField
						id="place"
						label={I18n.t("Place")}
						value={this.state.sourceOsmosePlace}
						onChange={e => this.setState({sourceOsmosePlace: e.target.value})}
						margin="normal"
						helperText={I18n.t("City or country (empty for whole world)")}
					/>
				</div>;
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
						<FormControlLabel value="osmose" control={<Radio />} label={I18n.t("Osmose")} />
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
