import React, { Component } from 'react';
import Button from 'material-ui/Button';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Input from 'material-ui/Input';
import Radio, { RadioGroup } from 'material-ui/Radio';

/**
 * Dataset view handles source format and file selection for user.
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
	 */
	sourceFileChanged(event) {
		this.setState({ sourceFile: event.target.files[0] });
	}
	
	/**
	 * Upload button clicked.
	 */
	uploadClick(event) {
		if(!this.state.sourceFile || !this.state.sourceFormatValue) {
			PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("No file or format selected") });
		}
		
		PubSub.publish("DATASET.FILE.UPLOADED", {
			file: this.state.sourceFile,
			format: this.state.sourceFormatValue
		});
	}
	
	render() {
		return <div>
			<FormControl required>
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
				<Input
					name="sourcefile"
					type="file"
					onChange={this.sourceFileChanged.bind(this)}
				/>
				
				<Button
					raised
					color="primary"
					onClick={this.uploadClick.bind(this)}
				>
					{I18n.t("Upload file")}
				</Button>
			</FormControl>
		</div>;
	}
}

export default Dataset;
