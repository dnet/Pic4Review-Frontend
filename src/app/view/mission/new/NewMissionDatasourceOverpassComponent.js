import React, { Component } from 'react';
import { FormControl, FormHelperText } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

/**
 * New mission datasource overpass component allows user to input settings for Overpass datasource
 */
class NewMissionDatasourceOverpassComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			oapiQuery: ""
		};
	}
	
	/**
	 * Called when a value has changed
	 * @private
	 */
	_changed(what, value) {
		if(what === "query" && value !== this.state.oapiQuery) {
			if(value === "") { value = null; }
			this.props.onChange({ query: value });
			this.setState({ oapiQuery: value });
		}
	}
	
	render() {
		return <div>
			<FormControl style={{width: "100%"}}>
				<Typography variant="caption">{I18n.t("Insert the full Overpass query below. Note that your query must only return points (as JSON), so consider using \"[out:json]\" and \"out center;\" commands. \"bbox\" parameter will be replaced by selected area.")}</Typography>
				<TextField
					id="oapi-query"
					label={I18n.t("Full Overpass API query")}
					multiline
					rows="4"
					value={this.state.oapiQuery || ""}
					onChange={e => this._changed("query", e.target.value)}
					margin="normal"
				/>
				<FormHelperText><a href="https://overpass-turbo.eu" target="_blank">{I18n.t("Create your query on Overpass Turbo")}</a> | <a href="https://wiki.openstreetmap.org/wiki/Overpass_API" target="_blank">{I18n.t("Overpass API documentation")}</a></FormHelperText>
			</FormControl>
		</div>;
	}
	
	componentWillMount() {
		if(this.props.data) {
			this.setState({
				oapiQuery: this.props.data.query
			});
		}
	}
}

export default NewMissionDatasourceOverpassComponent;
