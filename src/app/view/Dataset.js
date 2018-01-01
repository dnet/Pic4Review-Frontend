import React, { Component } from 'react';
import Button from 'material-ui/Button';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';
import Radio, { RadioGroup } from 'material-ui/Radio';

/**
 * Dataset view handles source format and file selection for user.
 * @name DatasetComponent
 */
class Dataset extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			sourceFormatValue: "geojson",
			sourceFile: null
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
		if(!this.state.sourceFile || !this.state.sourceFormatValue) {
			PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("No file or format selected") });
		}
		
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
	
	render() {
		const styleContainer = Object.assign({}, this.props.style, {textAlign: "center"});
		const styleGroups = {marginBottom: 20};
		
		return <div style={styleContainer}>
			<FormControl required style={{width: "100%"}}>
				<div style={styleGroups}>
					<FormLabel component="legend">{I18n.t("Source format")}</FormLabel>
					<RadioGroup
						aria-label="sourceformat"
						name="format"
						value={this.state.sourceFormatValue}
						row
						style={{justifyContent: "space-evenly"}}
					>
						<FormControlLabel value="geojson" disabled control={<Radio />} label={I18n.t("GeoJSON")} />
					</RadioGroup>
				</div>
				
				<div style={styleGroups}>
					<FormLabel component="legend">{I18n.t("Source file")}</FormLabel>
					<Input
						name="sourcefile"
						type="file"
						onChange={this.sourceFileChanged.bind(this)}
					/>
				</div>
				
				<div style={{textAlign: "center"}}>
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
