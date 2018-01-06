import React, { Component } from 'react';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

/**
 * Mission review tags component shows a feature's tags to user.
 */
class MissionReviewTagsComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		const style = Object.assign({}, this.props.style, {border: "1px solid lightgray", borderCollapse: "unset"});
		
		const tags = Object.keys(this.props.feature.properties).map(k => {
			return <TableRow key={k}>
				<TableCell>{k}</TableCell>
				<TableCell>{this.props.feature.properties[k]}</TableCell>
			</TableRow>;
		});
		
		return <Table style={style}>
			<TableHead>
				<TableRow>
					<TableCell>{I18n.t("Key")}</TableCell>
					<TableCell>{I18n.t("Value")}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{tags}
			</TableBody>
		</Table>;
	}
}

export default MissionReviewTagsComponent;
