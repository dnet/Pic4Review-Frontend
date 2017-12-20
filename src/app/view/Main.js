require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { indigo, red } from 'material-ui/colors';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Dataset from './Dataset';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
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

/**
 * Main view is the top-level component handling user interface.
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
			drawerOpen: false
		};
		
		PubSub.subscribe("UI.MESSAGE.SHOW", (msg, data) => {
			this.setState({
				snackOpen: true,
				snackMessage: data.message
			});
		});
		
		PubSub.subscribe("UI.TAB.SHOW", (msg, data) => {
			const corresp = { "dataset": 0, "summary": 1, "review": 2 };
			this.changeTab(null, corresp[data]);
		});
		
		PubSub.subscribe("DATASET.READY", (msg, data) => {
			//Check if dataset already has reviewed data
			let featureId = 0;
			if(data.review.indexOf("done") >= 0 || data.review.indexOf("skip") >= 0) {
				featureId = data.review.indexOf("new");
				
				//If no new features remaining
				if(featureId === -1) {
					featureId = data.review.indexOf("skip");
					
					//If no skipped features also, reset to 0
					if(featureId === -1) {
						featureId = 0;
					}
				}
			}
			
			this.setState({ dataset: data, featureId: featureId });
			this.changeTab(null, 1);
		});
		
		PubSub.subscribe("DATASET.UPDATED", (msg, data) => {
			this.setState({ dataset: data });
		});
		
		PubSub.subscribe("UI.FEATURE.DONE", (msg, data) => {
			PubSub.publish("DATASET.FEATURE.DONE", this.state.featureId);
			this.nextFeature();
		});
		
		PubSub.subscribe("UI.FEATURE.SKIP", (msg, data) => {
			PubSub.publish("DATASET.FEATURE.SKIP", this.state.featureId);
			this.nextFeature();
		});
		
		PubSub.subscribe("UI.FEATURE.SHOW", (msg, data) => {
			this.setState({ tabValue: 2, featureId: parseInt(data) });
		});
		
		PubSub.subscribe("UI.ASK.CLEAR", (msg, data) => {
			this.setState({ clearDialogOpen: true });
		});
	}
	
	/**
	 * Change the currently shown tab.
	 * @private
	 */
	changeTab(event, value) {
		//Check if data is ready for dataset-related tabs
		if(value === 1 || value === 2) {
			if(this.state.dataset !== null && this.state.featureId !== null) {
				this.setState({ tabValue: value });
			}
			else {
				this.setState({ tabValue: 0 });
				PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("You need first to load a dataset") });
			}
		}
		else {
			this.setState({ tabValue: value });
		}
	}
	
	/**
	 * Close the snackbar.
	 */
	closeSnackbar() {
		this.setState({ snackOpen: false });
	}
	
	/**
	 * Go review next feature
	 */
	nextFeature() {
		const newFeatureId = this.state.featureId + 1;
		if(newFeatureId < this._findDatasetFeatureLength()) {
			this.setState({ featureId: this.state.featureId + 1 });
		}
		else {
			PubSub.publish("UI.MESSAGE.SHOW", { type: "info", message: I18n.t("Congratulations ! You have reviewed all your features.") });
			PubSub.publish("UI.TAB.SHOW", "summary");
		}
	}
	
	/**
	 * Close dialog asking for clearing review
	 */
	closeClearDialog() {
		this.setState({ clearDialogOpen: false });
	}
	
	/**
	 * Handler for when clear review has been confirmed
	 */
	clearReviewClicked() {
		this.setState({ clearDialogOpen: false, featureId: 0, dataset: null });
		PubSub.publish("DATASET.CLEAR");
	}
	
	toggleDrawer() {
		this.setState({ drawerOpen: !this.state.drawerOpen });
	}
	
	/**
	 * Amount of features available in dataset
	 */
	_findDatasetFeatureLength() {
		let length = 0;
		
		if(this.state.dataset !== null) {
			switch(this.state.dataset.type) {
				case "geojson":
					length = this.state.dataset.data.features.length;
					break;
			}
		}
		
		return length;
	}
	
	/**
	 * Find current feature in dataset
	 * @private
	 */
	_findFeatureInDataset() {
		let feature = null;
		
		if(this.state.dataset !== null && this.state.featureId !== null) {
			switch(this.state.dataset.type) {
				case "geojson":
					feature = this.state.dataset.data.features[this.state.featureId];
					break;
			}
		}
		
		return feature;
	}

	render() {
		let content = null;
		const position = [this.state.lat, this.state.lng];
		const styleTabContent = { margin: "15px 20px" };
		
		switch(this.state.tabValue) {
			case 0:
				content = <Dataset style={styleTabContent} />;
				break;
			
			case 1:
				content = <Summary dataset={this.state.dataset} style={styleTabContent} />;
				break;
			
			case 2:
				const feature = this._findFeatureInDataset();
				content = feature ? <Review feature={feature} style={styleTabContent} /> : null;
				break;
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
								<Typography type="subheading" style={{right: 10}} gutterBottom color="inherit">{I18n.t("Review geo-datasets easily using pictures")}</Typography>
							</Hidden>
						</Toolbar>
					</AppBar>
					
					<Tabs
						value={this.state.tabValue}
						onChange={this.changeTab.bind(this)}
						indicatorColor="primary"
						textColor="primary"
						centered
					>
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
						ignoreBackdropClick
						ignoreEscapeKeyUp
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
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
