import React, { Component } from 'react';
import { LinearProgress } from 'material-ui/Progress';
import Dialog, { DialogContent } from 'material-ui/Dialog';
import Typography from 'material-ui/Typography';

/**
 * WaitDialog component shows to user a blocking wait message, in order to let application run long processing.
 * This component listens to {@link Events|UI.MESSAGE.WAIT} events.
 */
class WaitDialogComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			open: false,
			message: ""
		};
		
		PubSub.subscribe("UI.MESSAGE.WAIT", (msg, data) => {
			this.setState({
				open: true,
				message: data.message
			});
		});
		
		PubSub.subscribe("UI.MESSAGE.WAITDONE", (msg, data) => {
			this.setState({ open: false });
		});
	}
	
	render() {
		return <Dialog
			disableBackdropClick
			disableEscapeKeyDown
			open={this.state.open}
		>
			<DialogContent>
				<Typography type="body1" style={{marginBottom: 20}}>{this.state.message}</Typography>
				<LinearProgress />
			</DialogContent>
		</Dialog>;
	}
}

export default WaitDialogComponent;

/**
 * Event for displaying a blocking wait message to user.
 * @event UI.MESSAGE.WAIT
 * @type {Object} Event data
 * @property {string} message The message text.
 * @memberof Events
 */

/**
 * Event for closing a previously opened waiting message.
 * @event UI.MESSAGE.WAITDONE
 * @memberof Events
 */
