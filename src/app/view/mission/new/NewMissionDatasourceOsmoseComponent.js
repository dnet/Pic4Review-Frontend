import React, { Component } from 'react';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import OsmoseRequest from 'osmose-request';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';
import Wait from '../../WaitComponent';

/**
 * New mission datasource osmose component allows user to input settings for Osmose datasource
 */
class NewMissionDatasourceOsmoseComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			items: null,
			selectedItem: ""
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
			this.props.onChange({ item: value });
			this.setState({ selectedItem: value });
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
				items = items.filter(i => i.name && i.id && i.name.en);
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
