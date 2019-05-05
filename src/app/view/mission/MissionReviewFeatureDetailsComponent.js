import React, { Component } from 'react';
import DotsHorizontal from 'mdi-material-ui/DotsHorizontal';
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
	render() {
		if(this.props.feature && this.props.feature.properties) {
			const f = this.props.feature;
			const p = f.properties;
			let name = I18n.t("Feature #%{id}", { id: f.id });
			
			//Try to find better name
			if(p["name:"+I18n.locale]) { name = p["name:"+I18n.locale]; }
			else if(p["name:en"]) { name = p["name:en"]; }
			else if(p.name) { name = p.name; }
			else if(p.ref) { name = p.ref; }
			else if(p["addr:housenumber"] && p["addr:street"]) { name = p["addr:housenumber"] + " " + p["addr:street"]; }
			else if(p.advertising) { name = p.operator ? p.operator + " ("+p.advertising+")" : p.advertising; }
			else {
				let found = false;
				for(let k in p) {
					if(k.startsWith("ref")) {
						name = p[k];
						found = true;
						break;
					}
				}
				
				if(!found && p.id) { name = p.id; }
			}
			
			return <div>
				<Typography variant="subheading" style={{textAlign: "center"}}>
					{name}
					<Tooltip title={I18n.t("Show more details about this object")}>
						<IconButton
							onClick={() => this.props.onShowPopup(true)}
						>
							<DotsHorizontal />
						</IconButton>
					</Tooltip>
				</Typography>
				
				<Dialog
					open={this.props.showPopup}
					onClose={() => this.props.onShowPopup(false)}
				>
					<DialogTitle>{name}</DialogTitle>
					<DialogContent>
						<Tags feature={f} />
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.props.onShowPopup(false)} color="primary">
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
