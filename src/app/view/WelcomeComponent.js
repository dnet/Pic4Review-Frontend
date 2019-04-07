import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AccountGroup, ArrowDownThick, ArrowRightThick, CommentCheck, MapMarkerMultiple, TagMultiple, TagFaces } from 'mdi-material-ui';
import API from '../ctrl/API';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Hidden from 'material-ui/Hidden';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import P4C from 'pic4carto';
import Wait from './WaitComponent';

/**
 * Welcome component shows a synthetic description of what this tool is about.
 */
class WelcomeComponent extends Component {
	constructor() {
		super();
		this.state = {
			stats: null
		};
	}
	
	render() {
		const styleBlock = { padding: 20, marginBottom: 20 };
		const stylePics = { height: 128, width: 128 };
		const styleStats = { height: 64, width: 64 };
		
		const howItWorks = [
			{
				title: I18n.t("Choose your mission"),
				subtitle: I18n.t("Between several themes, or create your own mission !"),
				content: <TagFaces color="primary" style={stylePics} />
			},
			"arrow",
			{
				title: I18n.t("Check street pictures"),
				subtitle: I18n.t("Coming from various providers of open-licensed pictures"),
				content: Object.entries((new P4C.PicturesManager()).getFetcherDetails()).map(e => {
					return <img key={e[0]} src={e[1].logoUrl} style={{ maxHeight: 64, maxWidth: 64, margin: 10, verticalAlign: "middle" }} />;
				})
			},
			"arrow",
			{
				title: I18n.t("Answer and contribute"),
				subtitle: I18n.t("Looking at pictures, help improve features in OpenStreetMap"),
				content: <CommentCheck color="primary" style={stylePics} />
			}
		];
		
		return <Grid container justify="center" style={Object.assign({}, this.props.style, {textAlign: "center"})}>
			<Grid item xs={12} md={10} lg={8} xl={6}>
				<div style={styleBlock}>
					<img src="images/logo.512.png" style={{ height: 128 }} />
					
					<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("Improving OpenStreetMap has never been easier !")}</Typography>
					<Typography variant="subheading">{I18n.t("With Pic4Review, you can easily add details to OpenStreetMap by checking pictures and answering simple questions.")}</Typography>
					
					<Button variant="raised" size="large" color="primary" style={{marginTop: 20}} component={Link} to='/missions'>
						{I18n.t("Start now")}
					</Button>
				</div>
				
				<Paper style={styleBlock}>
					<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("How does it work ?")}</Typography>
					
					<Hidden smUp>
						<Grid container justify="center" alignItems="center">
							{howItWorks.map((hiw,i) => {
								if(hiw === "arrow") {
									return <Grid item xs={12} key={i}><ArrowDownThick color="primary" style={{width: 64, height: 64}} /></Grid>;
								}
								else {
									return <Grid item xs={12} key={i}>
										{hiw.content}
										<Typography variant="title">{hiw.title}</Typography>
										<Typography variant="body1">{hiw.subtitle}</Typography>
									</Grid>;
								}
							})}
						</Grid>
					</Hidden>
						
					<Hidden only="xs">
						<Grid container justify="center" alignItems="center">
							{howItWorks.map((hiw,i) => {
								if(hiw === "arrow") {
									return <Grid item sm={1} key={i}><ArrowRightThick color="primary" style={{width: 64, height: 64}} /></Grid>;
								}
								else {
									return <Grid item sm={3} key={i}>{hiw.content}</Grid>;
								}
							})}
						</Grid>
					</Hidden>
					<Hidden only="xs">
						<Grid container justify="center">
							{howItWorks.map((hiw,i) => {
								if(hiw === "arrow") {
									return <Grid item sm={1} key={i}></Grid>;
								}
								else {
									return <Grid item sm={3} key={i}>
										<Typography variant="title">{hiw.title}</Typography>
										<Typography variant="body1">{hiw.subtitle}</Typography>
									</Grid>;
								}
							})}
						</Grid>
					</Hidden>
				</Paper>
				
				<Grid container justify="center" alignItems="center">
					<Grid item xs={12} lg={6}>
						<div style={styleBlock}>
							<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("Quick introduction")}</Typography>
							<div style={{height: 300, width: 400, color: "white", backgroundColor: "black", lineHeight:"300px", display: "inline-block"}}>
								Video (soon !)
							</div>
						</div>
					</Grid>
					<Grid item xs={12} lg={6}>
						<Paper style={styleBlock}>
							<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("Some statistics")}</Typography>
							
							{!this.state.stats && <Wait />}
							{this.state.stats &&
								<Grid container>
									<Grid item xs={12} sm={4}>
										<TagMultiple color="primary" style={styleStats} />
										<Typography variant="headline">{I18n.t("%{val} missions", { val: this.state.stats.missions })}</Typography>
									</Grid>
									<Grid item xs={12} sm={4}>
										<MapMarkerMultiple color="primary" style={styleStats} />
										<Typography variant="headline">{I18n.t("%{val} edits", { val: this.state.stats.edits })}</Typography>
									</Grid>
									<Grid item xs={12} sm={4}>
										<AccountGroup color="primary" style={styleStats} />
										<Typography variant="headline">{I18n.t("%{val} users", { val: this.state.stats.users })}</Typography>
									</Grid>
								</Grid>
							}
						</Paper>
					</Grid>
				</Grid>
				
				<div style={styleBlock}>
					<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("About")}</Typography>
					<Typography variant="body1">
						{I18n.t("Pic4Review is an easy editor for OpenStreetMap. It was created by Adrien Pavie in 2017, and is maintained by a community of contributors. It is free and open source software, everyone is welcome to help us and make it even better !")}
						<br />
						<a href="https://wiki.openstreetmap.org/wiki/Pic4Review">{I18n.t("Documentation")}</a> | <a href="mailto:panieravide@riseup.net">{I18n.t("Contact us !")}</a> | <a href="https://framagit.org/Pic4Carto/Pic4Review">{I18n.t("Code repository")}</a>
					</Typography>
				</div>
			</Grid>
		</Grid>;
	}
	
	componentDidMount() {
		PubSub.publish("UI.TITLE.RESET");
		
		const updateStats = () => {
			API.GetInstanceStatistics()
			.then(stats => {
				this.setState({ stats: stats });
			});
		};
		
		updateStats();
		this.timer = setInterval(updateStats, 5000);
	}
	
	componentWillUnmount() {
		clearInterval(this.timer);
	}
}

export default WelcomeComponent;
