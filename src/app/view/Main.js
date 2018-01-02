require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { indigo, red } from 'material-ui/colors';
import About from './About';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Dataset from './Dataset';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Grid from 'material-ui/Grid';
import Hidden from 'material-ui/Hidden';
import IconButton from 'material-ui/IconButton';
import Review from './Review';
import Snackbar from 'material-ui/Snackbar';
import Summary from './Summary';
import Tabs, { Tab } from 'material-ui/Tabs';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

const theme = createMuiTheme({
	palette: {
		primary: indigo,
		secondary: red
	}
});

const TABS = [ "about", "dataset", "summary", "review" ];

/**
 * Main view is the top-level component handling user interface.
 * @name MainComponent
 */
class Main extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			tabValue: 0,
			lat: 48.1,
			lng: -1.7,
			zoom: 13,
			snackOpen: false,
			snackMessage: "",
			dataset: null,
			featureId: null,
			clearDialogOpen: false,
			drawerOpen: false,
			radiusPics: 20,
			waitingDialogOpen: false,
			skippedFeatures: 0
		};
		
		PubSub.subscribe("UI.MESSAGE.SHOW", (msg, data) => {
			this.setState({
				snackOpen: true,
				snackMessage: data.message
			});
		});
		
		PubSub.subscribe("UI.TAB.SHOW", (msg, data) => {
			let id = null;
			
			if(!isNaN(parseInt(data))) {
				id = parseInt(data);
				data = TABS[id];
			}
			else {
				id = TABS.indexOf(data);
			}
			
			//Check if data is ready for dataset-related tabs
			if(data === "summary" || data === "review") {
				if(this.state.dataset !== null) {
					if(data === "review") {
						if(this.state.featureId !== null) {
							this.setState({ tabValue: id });
						}
						else {
							this.nextFeature();
						}
					}
					else {
						this.setState({ tabValue: id });
					}
				}
				else {
					PubSub.publish("UI.TAB.SHOW", "dataset");
					
					/**
					 * Event sent when UI should display a message to user
					 * @event UI.MESSAGE.SHOW
					 * @type {Object} Event data
					 * @property {string} type The kind of message (error, alert, info)
					 * @property {string} message The message text
					 * @memberof PubSub
					 */
					PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("You need first to load a dataset") });
				}
			}
			else {
				this.setState({ tabValue: id });
			}
		});
		
		PubSub.subscribe("DATASET.READY", (msg, data) => {
			this.setState({ dataset: data });
			
			if(data.isDynamic()) {
				PubSub.publish("UI.TAB.SHOW", "review");
			}
			else {
				PubSub.publish("UI.TAB.SHOW", "summary");
			}
		});
		
		PubSub.subscribe("DATASET.UPDATED", (msg, data) => {
			this.setState({ dataset: data });
		});
		
		PubSub.subscribe("DATASET.FEATURE.NOPICS", (msg, data) => {
			this.setState({ skippedFeatures: this.state.skippedFeatures + 1 });
		});
		
		PubSub.subscribe("UI.FEATURE.CHANGED", (msg, data) => {
			/**
			 * Event sent when a feature in a dataset has changed
			 * @event DATASET.FEATURE.CHANGED
			 * @type {Dataset} The dataset
			 * @memberof PubSub
			 */
			PubSub.publish("DATASET.FEATURE.CHANGED", this.state.dataset);
			this.nextFeature();
		});
		
		PubSub.subscribe("UI.FEATURE.SHOW", (msg, data) => {
			PubSub.publish("UI.TAB.SHOW", "review");
			this.setState({ featureId: parseInt(data) });
		});
		
		PubSub.subscribe("UI.ASK.CLEAR", (msg, data) => {
			this.setState({ clearDialogOpen: true });
		});
	}
	
	/**
	 * Close the snackbar.
	 * @memberof MainComponent
	 * @instance
	 */
	closeSnackbar() {
		this.setState({ snackOpen: false });
	}
	
	/**
	 * Go review next feature.
	 * @memberof MainComponent
	 * @instance
	 */
	nextFeature() {
		this.setState({ waitingDialogOpen: true, featureId: null, skippedFeatures: 0 });
		this.state.dataset
		.getNextFeature(this.state.radiusPics)
		.then(f => {
			if(f !== null) {
				this.setState({ featureId: this.state.dataset.currentFeatureId, waitingDialogOpen: false });
				PubSub.publish("UI.TAB.SHOW", "review");
			}
			else {
				this.setState({ waitingDialogOpen: false });
				PubSub.publish("UI.MESSAGE.SHOW", { type: "info", message: I18n.t("Congratulations ! You have reviewed all your features.") });
				
				/**
				 * Event sent when UI should show a given tab
				 * @event UI.TAB.SHOW
				 * @type {string} The tab name (dataset, summary, review)
				 * @memberof PubSub
				 */
				PubSub.publish("UI.TAB.SHOW", "summary");
			}
		})
		.catch(e => {
			console.error(e);
			this.setState({ waitingDialogOpen: false });
			PubSub.publish("UI.TAB.SHOW", "summary");
			PubSub.publish("UI.MESSAGE.SHOW", { type: "error", message: I18n.t("Oops ! Can't download some images, please retry.") });
		});
	}
	
	/**
	 * Close dialog asking for clearing review.
	 * @memberof MainComponent
	 * @instance
	 */
	closeClearDialog() {
		this.setState({ clearDialogOpen: false });
	}
	
	/**
	 * Handler for when clear review has been confirmed.
	 * @memberof MainComponent
	 * @instance
	 */
	clearReviewClicked() {
		this.setState({ clearDialogOpen: false, featureId: null, dataset: null });
		
		/**
		 * Event sent when a dataset should be cleared of its review status
		 * @event DATASET.CLEAR
		 * @memberof PubSub
		 */
		PubSub.publish("DATASET.CLEAR");
	}

	render() {
		let content = null;
		const position = [this.state.lat, this.state.lng];
		const styleTabContent = { margin: "15px 20px" };
		
		switch(TABS[this.state.tabValue]) {
			case "dataset":
				content = <Dataset style={styleTabContent} />;
				break;
			
			case "summary":
				content = <Summary dataset={this.state.dataset} style={styleTabContent} />;
				break;
			
			case "review":
				const features = this.state.dataset.getAllFeatures();
				const feature = (this.state.featureId !== null && this.state.featureId < features.length) ? features[this.state.featureId] : null;
				content = feature ? <Review feature={feature} style={styleTabContent} radius={this.state.radiusPics} /> : null;
				break;
			
			case "about":
				content = <About style={styleTabContent} />;
				break;
		}
		
		let skipMsg = null;
		if(this.state.skippedFeatures) {
			skipMsg = <span><br />{I18n.t({one: "Skipped one feature without pictures", other: "Skipped %{count} features without pictures"}, {count: this.state.skippedFeatures })}</span>;
		}
		
		return (
			<MuiThemeProvider theme={theme}>
				<div>
					<AppBar position="static">
						<Toolbar style={{display: "flex", justifyContent: "space-between"}}>
							<div>
								<img src="images/logo.512.png" style={{height: 50, marginRight: 20, verticalAlign: "middle"}}/>
								<div style={{display: "inline-block", verticalAlign: "middle"}}>
									<Typography type="title" style={{marginBottom: 0}} gutterBottom color="inherit">{I18n.t("Pic4Review")}</Typography>
									<Typography type="caption" style={{marginBottom: 0}} gutterBottom color="inherit">{I18n.t("Alpha release")}</Typography>
								</div>
							</div>
							<Hidden only="xs">
								<Typography type="subheading" style={{right: 10}} gutterBottom color="inherit">{I18n.t("Improve OpenStreetMap using pictures !")}</Typography>
							</Hidden>
						</Toolbar>
					</AppBar>
					
					<Tabs
						value={this.state.tabValue}
						onChange={(e, v) => { PubSub.publish("UI.TAB.SHOW", v); }}
						indicatorColor="primary"
						textColor="primary"
						centered
					>
						<Tab label={I18n.t("About")} />
						<Tab label={I18n.t("Dataset")} />
						<Tab label={I18n.t("Summary")} />
						<Tab label={I18n.t("Review")} />
					</Tabs>
					
					{content}
					
					<Snackbar
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center',
						}}
						open={this.state.snackOpen}
						autoHideDuration={3000}
						onClose={this.closeSnackbar.bind(this)}
						message={this.state.snackMessage}
					/>
					
					<Dialog
						disableBackdropClick
						disableEscapeKeyDown
						maxWidth="xs"
						open={this.state.clearDialogOpen}
					>
						<DialogTitle>Clear review ?</DialogTitle>
						<DialogContent>{I18n.t("Clearing the review will reset all your feature status. This means you will loose information which feature was reviewed or not. Are you sure you want to clear review ?")}</DialogContent>
						<DialogActions>
							<Button onClick={this.closeClearDialog.bind(this)} color="primary">{I18n.t("No, I want to keep my work")}</Button>
							<Button onClick={this.clearReviewClicked.bind(this)} color="accent">{I18n.t("Yes, delete everything !")}</Button>
						</DialogActions>
					</Dialog>
					
					<Dialog
						disableBackdropClick
						disableEscapeKeyDown
						open={this.state.waitingDialogOpen}
					>
						<DialogContent>
							<Grid container alignItems="center" justify="space-between">
								<Grid item xs={3}>
									<CircularProgress />
								</Grid>
								<Grid item xs={9}>
									{I18n.t("Searching pictures around the next feature...")}
									{skipMsg}
								</Grid>
							</Grid>
						</DialogContent>
					</Dialog>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
