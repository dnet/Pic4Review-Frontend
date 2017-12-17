import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Dataset from './Dataset';
import Review from './Review';
import Snackbar from 'material-ui/Snackbar';
import Summary from './Summary';
import Tabs, { Tab } from 'material-ui/Tabs';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

const theme = createMuiTheme({});

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
			featureId: null
		};
		
		PubSub.subscribe("UI.MESSAGE.SHOW", (msg, data) => {
			this.setState({
				snackOpen: true,
				snackMessage: data.message
			});
		});
		
		PubSub.subscribe("UI.TAB.SHOW", (msg, data) => {
			const corresp = { "dataset": 0, "summary": 1, "review": 2 };
			
			//TODO
			if(data === "review" || data === "summary") {
				if(this.state.dataset !== null) {
					if(this.state.featureId === null) {
						this.setState({ featureId: 0 });
					}
					
					this.changeTab(null, corresp[data]);
				}
				else {
					PubSub.publish("UI.TAB.SHOW", "summary");
					PubSub.publish("UI.MESSAGE.SHOW", { type: "alert", message: I18n.t("You need first to load a dataset") });
				}
			}
			else {
				this.changeTab(null, corresp[data]);
			}
		});
		
		PubSub.subscribe("DATASET.READY", (msg, data) => {
			this.setState({ dataset: data });
		});
	}
	
	/**
	 * Change the currently shown tab.
	 * @private
	 */
	changeTab(event, value) {
		this.setState({ tabValue: value });
	}
	
	/**
	 * Close the snackbar.
	 */
	closeSnackbar() {
		this.setState({ snackOpen: false });
	}

	render() {
		let content = null;
		const position = [this.state.lat, this.state.lng];
		
		switch(this.state.tabValue) {
			case 0:
				content = <Dataset />;
				break;
			
			case 1:
				content = <Summary dataset={this.state.dataset} />;
				break;
			
			case 2:
				const feature = (this.state.dataset && this.state.featureId) ? this.state.dataset.features[this.state.featureId] : null;
				content = (this.state.dataset && this.state.featureId) ? <Review feature={feature} /> : null;
				break;
		}
		
		return (
			<MuiThemeProvider theme={theme}>
				<div>
					<AppBar position="static">
						<Toolbar>
							<Typography type="title" gutterBottom color="inherit">{I18n.t("Pic4Review")}</Typography>
							<Typography type="subtitle" style={{marginLeft: 10}} gutterBottom>{I18n.t("Alpha release")}</Typography>
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
						onRequestClose={this.closeSnackbar.bind(this)}
						message={this.state.snackMessage}
					/>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
