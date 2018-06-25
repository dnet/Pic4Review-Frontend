import React, { Component } from 'react';
import { DotsHorizontal } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import Tags from './MissionReviewTagsComponent';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

/**
 * Mission review feature details show summary of a feature, and possibly its details
 */
class MissionReviewFeatureDetailsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			dialogOpen: false
		};
	}
	
	render() {
		if(this.props.feature && this.props.feature.properties) {
			const f = this.props.feature;
			const p = f.properties;
			const name = p.name || I18n.t("Feature #%{id}", { id: f.id });
			return <div>
				<Typography variant="subheading" style={{textAlign: "center"}}>
					{name}
					<Tooltip title={I18n.t("Show more details about this object")}>
						<IconButton>
							<DotsHorizontal
								onClick={() => this.setState({ dialogOpen: true })}
							/>
						</IconButton>
					</Tooltip>
				</Typography>
				
				<Dialog
					open={this.state.dialogOpen}
					onClose={() => this.setState({ dialogOpen: false })}
				>
					<DialogTitle>{name}</DialogTitle>
					<DialogContent>
						<Tags feature={f} />
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ dialogOpen: false })} color="primary">
							{I18n.t("Close")}
						</Button>
					</DialogActions>
				</Dialog>
			</div>;
		}
		else {
			return <div></div>;
		}
	}
}

export default MissionReviewFeatureDetailsComponent;
