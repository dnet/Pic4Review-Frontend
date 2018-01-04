import React, { Component } from 'react';
import { HelpCircle, MapMarkerRadius } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

/**
 * Welcome component shows a synthetic description of what this tool is about.
 */
class WelcomeComponent extends Component {
	render() {
		const styleContainer = Object.assign({}, this.props.style, {textAlign: "center"});
		const stylePics = { height: 128, width: 128 };
		
		return <div style={styleContainer}>
			<Grid container>
				<Grid item xs={12} sm={4}>
					<img src="images/logo.512.png" style={stylePics} />
					<Typography type="title">
						{I18n.t("Purpose")}
					</Typography>
					<Typography type="body1">
						{I18n.t("Pic4Review is a picture reviewer for mapping. It allows you to improve the free world map OpenStreetMap using free street pictures available online.")}
					</Typography>
				</Grid>
				<Grid item xs={12} sm={4}>
					<HelpCircle color="primary" style={stylePics} />
					<Typography type="title">
						{I18n.t("How to")}
					</Typography>
					<Typography type="body1">
						{I18n.t("First, choose a dataset (a file of yours or an online source), then start reviewing features one by one, looking for the information you want to contribute on.")}
					</Typography>
					<Button raised color="primary" style={{marginTop: 10}} onClick={() => PubSub.publish("UI.PAGE.SHOW", { page: "missions" })}>
						{I18n.t("Start now")}
					</Button>
				</Grid>
				<Grid item xs={12} sm={4}>
					<MapMarkerRadius color="primary" style={stylePics} />
					<Typography type="title">
						{I18n.t("Themes")}
					</Typography>
					<Typography type="body1">
						{I18n.t("You can participate on any subject you like, for example adding wheelchair-accessibility on toilets, amount of levels of a building, color of fire hydrants...")}
					</Typography>
				</Grid>
			</Grid>
		</div>;
	}
}

export default WelcomeComponent;
