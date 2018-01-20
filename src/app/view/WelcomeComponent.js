import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Emoticon, MapMarkerRadius, Rocket } from 'mdi-material-ui';
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
			<Grid container style={{marginBottom: 10}}>
				<Grid item xs={12} sm={4}>
					<img src="images/logo.512.png" style={stylePics} />
					<Typography type="title">
						{I18n.t("Purpose")}
					</Typography>
					<Typography type="body1">
						{I18n.t("Pic4Review makes mapping using pictures fun ! Participate on map editing missions, earn points, and make the free world map better for everyone !")}
					</Typography>
				</Grid>
				<Grid item xs={12} sm={4}>
					<MapMarkerRadius color="primary" style={stylePics} />
					<Typography type="title">
						{I18n.t("Themes")}
					</Typography>
					<Typography type="body1">
						{I18n.t("You can find various missions, for example adding wheelchair accessibility, fix recycling containers, or integrate missing public toilets. If it's not enough, you can also create your own missions !")}
					</Typography>
					<Button raised color="primary" style={{marginTop: 10}} component={Link} to='/missions'>
						{I18n.t("Start now")}
					</Button>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Emoticon color="primary" style={stylePics} />
					<Typography type="title">
						{I18n.t("How to")}
					</Typography>
					<Typography type="body1">
						{I18n.t("Choose the mission you like, then start reviewing features using pictures. If you see something, edit OpenStreetMap accordingly. Quite simple !")}
					</Typography>
				</Grid>
			</Grid>
			
			<Rocket color="primary" style={stylePics} />
			<Typography type="title">
				{I18n.t("Still evolving")}
			</Typography>
			<Typography type="body1">
				{I18n.t("Pic4Review is still in beta version, so you can help us make it better.")} <a href="mailto:panieravide@riseup.net">{I18n.t("Contact us !")}</a>
			</Typography>
		</div>;
	}
}

export default WelcomeComponent;
