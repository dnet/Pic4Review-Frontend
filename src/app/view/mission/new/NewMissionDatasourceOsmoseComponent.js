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
	"1110": [ "singlechoice", "usertext", "disabled" ],
	"1140": [ "singlechoice", "usertext", "disabled" ],
	"1210": [ "singlechoice", "usertext", "disabled" ],
	"2010": [ "singlechoice", "usertext", "disabled" ],
	"2030": [ "singlechoice", "usertext", "disabled" ],
	"2060": [ "singlechoice", "usertext", "disabled" ],
	"2080": [ "singlechoice", "usertext", "disabled" ],
	"2090": [ "singlechoice", "usertext", "disabled" ],
	"2100": [ "singlechoice", "usertext", "disabled" ],
	"2110": [ "singlechoice", "usertext", "disabled" ],
	"2120": [ "singlechoice", "usertext", "disabled" ],
	"2130": [ "singlechoice", "usertext", "disabled" ],
	"2140": [ "singlechoice", "usertext", "disabled" ],
	"3080": [ "singlechoice", "usertext", "disabled" ],
	"3160": [ "singlechoice", "usertext", "disabled" ],
	"3210": [ "singlechoice", "usertext", "disabled" ],
	"3220": [ "singlechoice", "usertext", "disabled" ],
	"3230": [ "singlechoice", "usertext", "disabled" ],
	"3240": [ "singlechoice", "usertext", "disabled" ],
	"4030": [ "disabled" ],
	"4070": [ "singlechoice", "usertext", "disabled" ],
	"7011": [ "singlechoice", "usertext", "disabled" ],
	"7012": [ "singlechoice", "usertext", "disabled" ],
	"7040": [ "singlechoice", "usertext", "disabled" ],
	"7130": [ "singlechoice", "usertext", "disabled" ],
	"7140": [ "singlechoice", "usertext", "disabled" ],
	"7150": [ "singlechoice", "usertext", "disabled" ],
	"7170": [ "singlechoice", "usertext", "disabled" ],
	"7190": [ "singlechoice", "usertext", "disabled" ],
	"8__1": [ "singlechoice", "usertext", "disabled" ],
	"8__0": [ "importer", "disabled" ]
};

const ERROR_TO_IMPORTER = {
	"8020": { mainTags: { amenity: "post_office" }, conflation: 150 },
	"8040": { mainTags: { highway: "bus_stop" }, conflation: 50 },
	"8050": { mainTags: { railway: "station" }, conflation: 200 },
	"8060": { mainTags: { railway: "level_crossing" }, conflation: 150 },
	"8080": { mainTags: { "addr:housenumber": "*" }, conflation: 20 },
	"8120": { mainTags: { amenity: "recycling", "recycling_type": "container" }, conflation: 20 },
	"8130": { mainTags: { amenity: "parking" }, conflation: 50 },
	"8150": { mainTags: { amenity: "bicycle_parking" }, conflation: 20 },
	"8180": { mainTags: { amenity: "toilets" }, conflation: 50 },
	"8190": { mainTags: { amenity: "police" }, conflation: 100 },
	"8210": { mainTags: { amenity: "pharmacy", dispensing: "yes" }, conflation: 50 },
	"8230": { mainTags: { amenity: "library" }, conflation: 50 },
	"8240": { mainTags: { amenity: "restaurant" }, conflation: 30 },
	"8250": { mainTags: { craft: "winery" }, conflation: 100 },
	"8280": { mainTags: { power: "substation" }, conflation: 50 },
	"8290": { mainTags: { power: "tower" }, conflation: 20 }
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
			this.props.onChange({ item: value, allowedEditors: this._getEditorsForError({ id: value }) || this.state.allowedEditors, importer: ERROR_TO_IMPORTER[value] });
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
