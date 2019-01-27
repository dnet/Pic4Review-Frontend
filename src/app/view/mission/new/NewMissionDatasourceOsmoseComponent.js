import React, { Component } from 'react';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import OsmoseRequest from 'osmose-request';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';
import Wait from '../../WaitComponent';

/*
 * Definition of editors according to error type
 */
const ERROR_TO_EDITORS = {
	"1110": "all",
	"1140": "all",
	"1210": "all",
	"2010": "all",
	"2030": "all",
	"2060": "all",
	"2080": "all",
	"2090": "all",
	"2100": "all",
	"2110": "all",
	"2120": "all",
	"2130": "all",
	"2140": "all",
	"3080": "all",
	"3160": "all",
	"3210": "all",
	"3220": "all",
	"3230": "all",
	"3240": "all",
	"4030": [ "disabled" ],
	"4070": "all",
	"7011": "all",
	"7012": "all",
	"7040": "all",
	"7130": "all",
	"7140": "all",
	"7150": "all",
	"7170": "all",
	"7190": "all",
	"8__1": "all",
	"8__0": [ "disabled" ] //importer
};

/**
 * New mission datasource osmose component allows user to input settings for Osmose datasource
 */
class NewMissionDatasourceOsmoseComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			items: null,
			selectedItem: "",
			allowedEditors: "all"
		};
		
		this.request = new OsmoseRequest();
	}
	
	/**
	 * Restore options from props
	 * @private
	 */
	_restore(props) {
		if(props.data && props.data.item !== this.state.selectedItem) {
			this.setState({
				selectedItem: props.data.item
			});
		}
	}
	
	/**
	 * Called when a value has changed
	 * @private
	 */
	_changed(what, value) {
		if(what === "item" && value !== this.state.selectedItem) {
			if(value === "") { value = null; }
			this.props.onChange({ item: value, allowedEditors: this._getEditorsForError({ id: value }) || this.state.allowedEditors });
			this.setState({ selectedItem: value });
		}
	}
	
	_getEditorsForError(item) {
		const itemId = item.id.toString();
		if(ERROR_TO_EDITORS[itemId]) {
			return ERROR_TO_EDITORS[itemId];
		}
		else {
			const keyMatchers = Object.keys(ERROR_TO_EDITORS).filter(k => k.indexOf("_") >= 0);
			for(const km of keyMatchers) {
				if(
					itemId.length == km.length
					&& itemId.match(km.replace(/_/g, "[0-9]"))
				) {
					return ERROR_TO_EDITORS[km];
				}
			}
			return null;
		}
	}
	
	render() {
		if(this.state.items) {
			return <div>
				<FormControl>
					<InputLabel htmlFor="osmose-item">{I18n.t("Kind of error")}</InputLabel>
					<Select
						native
						value={this.state.selectedItem || ""}
						onChange={e => this._changed("item", e.target.value)}
						input={<Input id="osmose-item" />}
					>
						<option value="" />
						{this.state.items.map(i => {
							return <option value={i.id} key={i.id}>{i.id} - {i.name[I18n.locale] ? i.name[I18n.locale] : i.name.en}</option>;
						})}
					</Select>
					<FormHelperText><a href="https://wiki.openstreetmap.org/wiki/Osmose/issues" target="_blank">{I18n.t("Documentation of Osmose error types")}</a></FormHelperText>
				</FormControl>
			</div>;
		}
		else {
			return <Wait />;
		}
	}
	
	componentWillReceiveProps(nextProps) {
		this._restore(nextProps);
	}
	
	componentWillMount() {
		this._restore(this.props);
	}
	
	componentDidMount() {
		//Fetch item list from Osmose
		if(!this.state.items) {
			this.request
			.fetchItems()
			.then(items => {
				items = items.filter(i => {
					if(i.name && i.id && i.name.en) {
						return this._getEditorsForError(i) !== null;
					}
					else {
						return false;
					}
				});
				this.setState({ items: items });
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get options for this data source") });
			});
		}
	}
}

export default NewMissionDatasourceOsmoseComponent;
