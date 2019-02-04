import React, { Component } from 'react';
import TextField from 'material-ui/TextField';

class TagInputComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			text: "",
			error: false
		};
	}
	
	/**
	 * Transform JS object into string representation
	 * @private
	 */
	_tagsToText(tags) {
		return tags ? Object.entries(tags).map(e => e[0] + "=" + e[1]).join("\n") : "";
	}
	
	/**
	 * Convert tags text into JS object
	 * @private
	 */
	_textToTags(text) {
		const tags = {};
		text.split("\n").map(e => e.split("=")).forEach(e => {
			tags[e[0]] = e[1];
		});
		return tags;
	}
	
	_textChanged(newText) {
		this.setState({ text: newText, error: false });
		if(newText.trim().match(/^[a-z0-9_\.:-]+=[^=\n]+(\n[a-z0-9_\.:-]+=[^=\n]+)*$/i)) {
			this.props.onChange(this._textToTags(newText.trim()));
		}
		else {
			this.setState({ error: true });
			this.props.onChange(null);
		}
	}
	
	render() {
		return <TextField
			margin="normal"
			fullWidth multiline required
			error={this.state.error}
			label={I18n.t("OSM tags")}
			helperText={I18n.t("Tags, as key=value (one per line), to apply on feature if answer is selected")}
			placeholder={"amenity=bench\nbackrest=yes\nmaterial=wood".replace(/\\n/g, '\n')}
			rows="4"
			value={this.state.text}
			onChange={ev => this._textChanged(ev.target.value)}
		/>;
	}
	
	componentWillMount() {
		this.setState({ text: this._tagsToText(this.props.tags) });
	}
}

export default TagInputComponent;
