import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

/**
 * Login dialog component informs user on the login procedure of OpenStreetMap.
 * It allows user to go to connect page on OSM, or create an account.
 */
class NewMissionEditorsSingleChoiceAnswerDialogComponent extends Component {
	constructor() {
		super();
		
		this.state = {
		};
	}
	
	/**
	 * Checks if data was correctly set-up, then callbacks parent
	 * @private
	 */
	_onCreate() {
		const data = {};
		this.props.onCreate(data);
	}
	
	render() {
		return <Dialog
			open={this.props.open}
			onClose={this.props.onClose}
		>
			<DialogTitle>{I18n.t("New answer")}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{I18n.t("Choose a label, an image (optional) and set tags changes for this answer.")}
				</DialogContentText>
				
				<TextField
					id="label"
					margin="normal"
					autoFocus fullWidth required
					label={I18n.t("Answer name")}
					helperText={I18n.t("Synthetic label for this choice")}
					placeholder={I18n.t("Tree, Pillar, Zebra...")}
				/>
				
				<TextField
					id="url"
					margin="normal"
					fullWidth
					label={I18n.t("Image URL")}
					helperText={I18n.t("Direct link to a JPG or PNG picture")}
					type="url"
					placeholder="https://..."
				/>
				
				<TextField
					id="tags"
					margin="normal"
					fullWidth multiline required
					label={I18n.t("OSM tags")}
					helperText={I18n.t("Tags, as key=value (one per line), to apply on feature if answer is selected")}
					placeholder={"amenity=bench\nbackrest=yes\nmaterial=wood".replace(/\\n/g, '\n')}
					rows="4"
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={this.props.onClose} color="default">
					{I18n.t("Cancel")}
				</Button>
				<Button onClick={() => this._onCreate()} color="primary">
					{I18n.t("Create")}
				</Button>
			</DialogActions>
		</Dialog>;
	}
}

export default NewMissionEditorsSingleChoiceAnswerDialogComponent;
