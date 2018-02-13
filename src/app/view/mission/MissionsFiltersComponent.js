import React, { Component } from 'react';
import { FormControl } from 'material-ui/Form';
import Hash from 'object-hash';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';

/**
 * Missions filters component allows user to restrict the amount of missions to display.
 * Component properties: values = The values to restore in select fields (type, theme)
 */
class MissionsFiltersComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			theme: null,
			type: null,
			status: null
		};
	}
	
	/**
	 * Converts a third-party object into a list of filters
	 * @private
	 */
	_toFilters(o) {
		return { type: o.type || "", theme: o.theme || "", status: o.status || "" };
	}
	
	render() {
		const styleControl = { width: "100%", marginBottom: 20 };
		
		return <div>
			<FormControl style={styleControl}>
				<InputLabel htmlFor="missions-filters-theme">{I18n.t("Theme")}</InputLabel>
				<Select
					native
					value={this.state.theme !== null ? this.state.theme : this.props.values.theme}
					onChange={e => this.setState({ theme: e.target.value })}
					input={<Input id="missions-filters-theme" />}
				>
					<option value="" />
					{Object.entries(THEMES).map(e =>
						<option key={e[0]} value={e[0]}>{e[1].name}</option>
					)}
				</Select>
			</FormControl>
			
			<FormControl style={styleControl}>
				<InputLabel htmlFor="missions-filters-type">{I18n.t("Type")}</InputLabel>
				<Select
					native
					value={this.state.type !== null ? this.state.type : this.props.values.type}
					onChange={e => this.setState({ type: e.target.value })}
					input={<Input id="missions-filters-type" />}
				>
					<option value="" />
					{Object.entries(TYPES).map(e =>
						<option key={e[0]} value={e[0]}>{e[1].name}</option>
					)}
				</Select>
			</FormControl>
			
			{this.props.status && <FormControl style={styleControl}>
				<InputLabel htmlFor="missions-filters-status">{I18n.t("Status")}</InputLabel>
				<Select
					native
					value={this.state.status !== null ? this.state.status : this.props.values.status}
					onChange={e => this.setState({ status: e.target.value })}
					input={<Input id="missions-filters-status" />}
				>
					<option value="" />
					{Object.entries(MISSION_STATUSES).map(e =>
						<option key={e[0]} value={e[0]}>{e[1].name}</option>
					)}
				</Select>
			</FormControl>}
		</div>;
	}
	
	componentDidUpdate(prevProps, prevState) {
		const newFilters = this._toFilters(this.state);
		const prevFilters = this._toFilters(prevState);
		
		if(Hash(newFilters) !== Hash(prevFilters)) {
			this.props.onChange(newFilters);
		}
	}
}

export default MissionsFiltersComponent;
