import React, { Component } from 'react';
import { ChartPie, ViewGrid } from 'mdi-material-ui';
import AppBar from 'material-ui/AppBar';
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
	}
	
	render() {
		return <AppBar position="static">
			<Toolbar style={{display: "flex", justifyContent: "space-between"}}>
				<div>
					<img
						src="images/logo.512.png"
						style={{height: 50, marginRight: 20, verticalAlign: "middle", cursor: "pointer"}}
						onClick={() => PubSub.publish("UI.PAGE.SHOW", { page: "welcome" })}
					/>
					<div style={{display: "inline-block", verticalAlign: "middle"}}>
						<Typography type="title" style={{marginBottom: 0}} gutterBottom color="inherit">{I18n.t("Pic4Review")}</Typography>
						<Typography type="caption" style={{marginBottom: 0}} gutterBottom color="inherit">{I18n.t("Beta release")}</Typography>
					</div>
				</div>
				<div>
					<Tooltip
						title={I18n.t("Missions")}
						placement="bottom"
						onClick={() => PubSub.publish("UI.PAGE.SHOW", { page: "missions" })}
					>
						<IconButton color="contrast"><ViewGrid /></IconButton>
					</Tooltip>
					<Tooltip title={I18n.t("Statistics")} placement="bottom">
						<IconButton color="contrast"><ChartPie /></IconButton>
					</Tooltip>
					<UserButton />
				</div>
			</Toolbar>
		</AppBar>;
	}
}

export default HeaderComponent;
