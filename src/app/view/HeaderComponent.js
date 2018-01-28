import React, { Component } from 'react';
import { ChartPie, LibraryPlus, ViewGrid } from 'mdi-material-ui';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Hidden from 'material-ui/Hidden';
import IconButton from 'material-ui/IconButton';
import Toolbar from 'material-ui/Toolbar';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';
import UserButton from './UserButtonComponent';

/**
 * Header component is handling the page header.
 * It contains logo, title, and some menus for user interaction.
 */
class HeaderComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			title: null,
			subtitle: null
		};
		
		this.psTokens = {};
	}
	
	render() {
		return <AppBar position="static">
			<Toolbar style={{display: "flex", justifyContent: "space-between", color: "white"}}>
				<div>
					<Link to='/'>
						<img
							src="images/logo.512.png"
							style={{height: 50, marginRight: 20, verticalAlign: "middle", cursor: "pointer"}}
						/>
					</Link>
					<div style={{display: "inline-block", verticalAlign: "middle"}}>
						<Typography type="title" style={{marginBottom: 0}} gutterBottom color="inherit">{I18n.t("Pic4Review")}</Typography>
						<Typography type="caption" style={{marginBottom: 0}} gutterBottom color="inherit">{I18n.t("Beta release")}</Typography>
					</div>
				</div>
				
				{this.state.title && <Hidden only="xs"><div style={{display: "inline-block", textAlign: "center"}}>
					<Typography type="title" style={{marginBottom: 0}} color="inherit">{this.state.title}</Typography>
					<Typography type="caption" style={{marginBottom: 0}} color="inherit">{this.state.subtitle}</Typography>
				</div></Hidden>}
				
				<div>
					<Tooltip title={I18n.t("Missions")} placement="bottom">
						<IconButton
							component={Link}
							to='/missions'
							color="inherit"
						>
							<ViewGrid />
						</IconButton>
					</Tooltip>
					
					<Hidden only="xs">
						<Tooltip title={I18n.t("New mission")} placement="bottom">
							<IconButton
								component={Link}
								to='/mission/new'
								color="inherit"
							>
								<LibraryPlus />
							</IconButton>
						</Tooltip>
					</Hidden>
					
					<Hidden only="xs">
						<Tooltip title={I18n.t("Statistics")} placement="bottom">
							<IconButton
								component={Link}
								to='/statistics'
								color="inherit"
							>
								<ChartPie />
							</IconButton>
						</Tooltip>
					</Hidden>
					
					<UserButton />
				</div>
			</Toolbar>
		</AppBar>;
	}
	
	componentDidMount() {
		this.psTokens.title = PubSub.subscribe("UI.TITLE.SET", (msg, data) => {
			this.setState({ title: data.title, subtitle: data.subtitle });
		});
		
		this.psTokens.reset = PubSub.subscribe("UI.TITLE.RESET", (msg, data) => {
			this.setState({ title: null, subtitle: null });
		});
	}
	
	componentWillUnmount() {
		if(this.psTokens.title) {
			PubSub.unsubscribe(this.psTokens.title);
		}
		
		if(this.psTokens.reset) {
			PubSub.unsubscribe(this.psTokens.reset);
		}
	}
}

export default HeaderComponent;

/**
 * Event to display a particular title
 * @event UI.TITLE.SET
 * @type {Object} Event data
 * @property {string} title The page title
 * @property {string} subtitle The page subtitle
 * @memberof Events
 */

/**
 * Event to remove previous title
 * @event UI.TITLE.RESET
 * @memberof Events
 */
