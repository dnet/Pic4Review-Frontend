import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';

/**
 * Login dialog component informs user on the login procedure of OpenStreetMap.
 * It allows user to go to connect page on OSM, or create an account.
 */
class LoginDialogComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			open: false
		};
		
		PubSub.subscribe("UI.LOGIN.WANTS", () => {
			this.setState({ open: true });
		});
	}
	
	/**
	 * Handler for login button click.
	 * @private
	 */
	_loginClicked() {
		PubSub.publish("UI.LOGIN.SURE");
		this._closeDialog();
	}
	
	/**
	 * Handler for closing dialog
	 * @private
	 */
	_closeDialog() {
		this.setState({ open: false });
	}
	
	render() {
		return <Dialog
			open={this.state.open}
			onClose={this._closeDialog.bind(this)}
		>
			<DialogTitle>{I18n.t("Connect to OpenStreetMap")}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{I18n.t("Pic4Review uses OpenStreetMap accounts for more simplicity. Please connect to OSM or create an account in order to be able to contribute.")}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={this._closeDialog.bind(this)} color="default">
					{I18n.t("Cancel")}
				</Button>
				<Button onClick={this._loginClicked.bind(this)} color="primary" autoFocus>
					{I18n.t("Login or create account")}
				</Button>
			</DialogActions>
		</Dialog>;
	}
}

export default LoginDialogComponent;

/**
 * Event when the user wants to login for sure.
 * @event UI.LOGIN.SURE
 * @memberof Events
 */
