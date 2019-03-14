import React, { Component } from 'react';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import P4C from 'pic4carto';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';

/**
 * New mission datasource detections component allows user to input settings for missions around automated picture detections.
 */
class NewMissionDatasourceDetectionsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			selectedType: "",
			allowedEditors: [ "importer" ]
		};
	}
	
	/**
	 * Restore options from props
	 * @private
	 */
	_restore(props) {
		if(props.data && props.data.type !== this.state.selectedType) {
			this.setState({
				selectedType: props.data.type
			});
		}
	}
	
	/**
	 * Called when a value has changed
	 * @private
	 */
	_changed(what, value) {
		if(what === "type" && value !== this.state.selectedType) {
			if(value === "") {
				this.props.onChange(null);
				this.setState({ selectedType: null });
			}
			else {
				value = parseInt(value);
				
				let importer = null;
				if(P4C.Detection.TYPE_DETAILS[value]) {
					importer = { mainTags: P4C.Detection.TYPE_DETAILS[value].osmTags, conflation: 10 };
				}
				
				this.props.onChange({ type: value, importer: importer });
				this.setState({ selectedType: value });
			}
		}
	}
	
	render() {
		return <FormControl style={{ width: "100%" }}>
			<InputLabel htmlFor="detection-type">{I18n.t("Kind of feature")}</InputLabel>
			<Select
				native
				value={this.state.selectedType || ""}
				onChange={e => this._changed("type", e.target.value)}
				input={<Input id="detection-type" />}
			>
				<option value="" />
				{Object.entries(P4C.Detection.TYPE_DETAILS).map((e, i) => {
					return <option value={e[0]} key={i}>{e[1].name}</option>;
				})}
			</Select>
		</FormControl>;
	}
	
	componentWillReceiveProps(nextProps) {
		this._restore(nextProps);
	}
	
	componentWillMount() {
		this._restore(this.props);
	}
}

export default NewMissionDatasourceDetectionsComponent;
