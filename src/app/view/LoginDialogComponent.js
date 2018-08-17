import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
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
			open: false,
			goBack: false
		};
		
		PubSub.subscribe("UI.LOGIN.WANTS", (msg, data) => {
			data = data || {};
			this.setState({ open: true, goBack: data.goBack || false });
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
		const goBack = this.state.goBack;
		this.setState({ open: false, goBack: false });
		if(goBack && this.props.history) {
			if(window.history.length > 2 || document.referrer.length > 0) {
				this.props.history.goBack();
			}
			else {
				this.props.history.push('/');
			}
		}
	}
	
	render() {
		return <Dialog
			open={this.state.open}
			onClose={() => this._closeDialog()}
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

export default withRouter(LoginDialogComponent);

/**
 * Event when the user wants to login for sure.
 * @event UI.LOGIN.SURE
 * @memberof Events
 */
