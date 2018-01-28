import React, { Component } from 'react';
import { Account, AccountCircle, ChartPie, Login, Logout } from 'mdi-material-ui';
import IconButton from 'material-ui/IconButton';
import { Link } from 'react-router-dom';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import Tooltip from 'material-ui/Tooltip';

/**
 * User button component handles switching between multiple states of user connection.
 */
class UserButtonComponent extends Component {
	constructor() {
		super();
		this.state = {
			connected: false,
			user: null,
			menuOpen: false,
			menuAnchor: null
		};
		
		this.psTokens = {};
	}
	
	/**
	 * Closes the menu.
	 * @private
	 */
	_closeMenu() {
		this.setState({ menuOpen: false, menuAnchor: null });
	}
	
	/**
	 * Handler for logout click.
	 * @private
	 */
	_logoutClick() {
		PubSub.publish("UI.LOGOUT.WANTS");
		this._closeMenu();
		this.setState({ connected: false, user: null });
	}
	
	render() {
		if(this.state.connected) {
			return <div style={{display: "inline"}}>
				<Tooltip title={I18n.t("Account")} placement="bottom">
					<IconButton
						color="inherit"
						onClick={e => this.setState({ menuOpen: true, menuAnchor: e.currentTarget })}
					>
						<AccountCircle />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={this.state.menuAnchor}
					open={this.state.menuOpen}
					onClose={this._closeMenu.bind(this)}
				>
					<MenuItem disabled>{this.state.user}</MenuItem>
					<MenuItem
						onClick={this._closeMenu.bind(this)}
						component={Link}
						to='/my/statistics'
					>
						<ListItemIcon>
							<ChartPie />
						</ListItemIcon>
						<ListItemText inset primary={I18n.t("Your statistics")} />
					</MenuItem>
					<MenuItem onClick={this._logoutClick.bind(this)}>
						<ListItemIcon>
							<Logout />
						</ListItemIcon>
						<ListItemText inset primary={I18n.t("Logout")} />
					</MenuItem>
				</Menu>
			</div>;
		}
		else {
			return <Tooltip title={I18n.t("Login")} placement="bottom">
				<IconButton
					color="inherit"
					onClick={() => PubSub.publish("UI.LOGIN.WANTS")}
				>
					<Login />
				</IconButton>
			</Tooltip>;
		}
	}
	
	componentWillMount() {
		this.psTokens.login = PubSub.subscribe("UI.LOGIN.DONE", (msg, data) => {
			this.setState({ user: data.username, connected: true });
		});
	}
	
	componentWillUnmount() {
		if(this.psTokens.login) {
			PubSub.unsubscribe(this.psTokens.login);
		}
	}
}

export default UserButtonComponent;

/**
 * Event when the user wants to login.
 * @event UI.LOGIN.WANTS
 * @memberof Events
 */

/**
 * Event when user is logged in.
 * @event UI.LOGIN.DONE
 * @type {Object} Event data
 * @property {string} username The user name
 * @memberof Events
 */

/**
 * Event when the user wants to logout.
 * @event UI.LOGOUT.WANTS
 * @memberof Events
 */
