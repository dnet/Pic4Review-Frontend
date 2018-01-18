import React, { Component } from 'react';
import { ChevronDown } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import MapSelection from '../../MapSelectionComponent';
import Typography from 'material-ui/Typography';

/**
 * New mission datasource component allows to select area for the mission, and the source of the data.
 */
class NewMissionDatasourceComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			source: "osmose"
		};
	}
	
	/**
	 * Change the currently shown data source
	 * @private
	 */
	_changeSource(id) {
		this.setState({ source: id });
	}
	
	/**
	 * Preview one of the data source
	 * @private
	 */
	_preview(id) {
		console.log("preview", id);
	}
	
	render() {
		const sources = [
			{
				id: "osmose",
				name: I18n.t("Osmose"),
				content: <div>Selectors osmose</div>
			},
			{ id: "overpass", name: I18n.t("Overpass"), content: <div>Selectors overpass</div> }
		];
		
		return <Grid container>
			<Grid item xs={12} sm={6} lg={4}>
				<MapSelection style={{height: 300}} onChange={e => console.log(e)} />
			</Grid>
			<Grid item xs={12} sm={6} lg={8}>
				<Typography type="subheading">{I18n.t("Data source")}</Typography>
				<Typography type="caption" style={{marginBottom: 10}}>{I18n.t("Select one source of data below for your mission")}</Typography>
				{sources.map(s => {
					return <ExpansionPanel expanded={this.state.source === s.id} key={s.id} onChange={() => this._changeSource(s.id)}>
						<ExpansionPanelSummary expandIcon={<ChevronDown />}>
							<Typography type="body2">{s.name}</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails style={{display: "block"}}>
							{s.content}
							<div style={{textAlign: "right"}}>
								<Button onClick={() => this._preview(s.id)}>{I18n.t("Preview")}</Button>
							</div>
						</ExpansionPanelDetails>
					</ExpansionPanel>
				})}
			</Grid>
		</Grid>;
	}
}

export default NewMissionDatasourceComponent;
