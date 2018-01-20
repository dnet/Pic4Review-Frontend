import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Pencil, Check, SkipForward, SkipPrevious, EyeOff } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Button from 'material-ui/Button';
import CONSTS from '../../constants';
import First from './MissionFirstReviewComponent';
import Gallery from './MissionReviewGalleryComponent';
import Grid from 'material-ui/Grid';
import Leaflet from 'leaflet';
import Map from './MissionReviewMapComponent';
import Picture from './MissionReviewPictureComponent';
import request from 'browser-request';
import Tags from './MissionReviewTagsComponent';
import withWidth from 'material-ui/utils/withWidth';

const IMG_COLS = { "xs": 1.5, "sm": 2.5, "md": 3.5, "lg": 4.5, "xl": 5.5 };
const BANNER_HEIGHT = { "xs": 150, "sm": 150, "md": 200, "lg": 200, "xl": 200 };
const NOT_FIRST_REVIEW = "no1st";

/**
 * Mission review component allows to review pictures for a given mission.
 * You can review features one by one.
 */
class MissionReviewComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			feature: null,
			currentPictureId: null,
			prevFeature: null,
			count: 0,
			firstReview: false
		};
		
		this.psTokens = {};
	}
	
	/**
	 * Start looking for next feature
	 * @private
	 */
	_next() {
		this.setState({ feature: null, currentPictureId: null, prevFeature: this.state.feature });
		PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Retrieving next feature to review") });
		
		API.GetMissionNextFeature(this.props.mission.id)
		.then(f => {
			if(f !== null) {
				this.setState({ feature: f, currentPictureId: (f.pictures.length > 0 ? 0 : null) });
				
				PubSub.publish("UI.MESSAGE.WAITDONE");
				
				if(f.pictures.length === 0) {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("No pictures available around this feature") });
				}
			}
			else {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("No more features to review !") });
				this.props.history.push('/mission/'+this.props.mission.id+'/summary');
			}
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.WAITDONE");
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't retrieve next feature to review.") });
		});
	}
	
	/**
	 * Go back to previous feature
	 * @private
	 */
	_prev() {
		if(this.state.prevFeature) {
			this.setState({
				prevFeature: null,
				feature: this.state.prevFeature,
				currentPictureId: this.state.prevFeature.pictures.length > 0 ? 0 : null
			});
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("You can't go back anymore") });
		}
	}
	
	/**
	 * Edit the current feature status, and start retrieving next one
	 * @private
	 */
	_review(status) {
		this.state.feature.status = status;
		
		API.UpdateMissionFeature(
			this.props.mission.id,
			this.state.feature,
			this.props.user.name,
			this.props.user.id
		)
		.then(() => {
			this.setState({ count: this.state.count+1 });
			this._next();
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't update feature, please retry") });
		});
	}
	
	/**
	 * Opens and zoom in JOSM on current picture area.
	 * @private
	 */
	_editJOSM() {
		let circle = Leaflet.circle(
			this.state.feature.coordinates,
			{ radius: 50 }
		).addTo(this.refs.map.refs.map.leafletElement);
		
		let bbox = circle.getBounds();
		this.refs.map.refs.map.leafletElement.removeLayer(circle);
		
		request(
			CONSTS.JOSM_URL+"left="+bbox.getWest()+"&right="+bbox.getEast()+"&top="+bbox.getNorth()+"&bottom="+bbox.getSouth(),
			(error, response, body) => {
				if(error) {
					console.error(error);
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't open in JOSM, are you sure remote control is enabled ?") });
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Opened in JOSM") });
				}
			}
		);
	}
	
	/**
	 * Opens ID editor on current picture area.
	 * @private
	 */
	_editId() {
		window.open(
			CONSTS.ID_URL+"19/"+this.state.feature.coordinates.join("/"),
			"_blank"
		).focus();
	}
	
	_closeFirstHelp() {
		sessionStorage.setItem(NOT_FIRST_REVIEW, "1");
		this.setState({ firstReview: false });
	}
	
	render() {
		if(!this.state.feature) {
			const style = Object.assign({}, this.props.style, { textAlign: "center" });
			return <div style={style}></div>;
		}
		else {
			const buttons = [
				{ icon: <SkipPrevious />, label: I18n.t("Previous"), click: this._prev.bind(this) },
				{ icon: <SkipForward />, label: I18n.t("Skip"), click: () => this._next() },
				{ icon: <Pencil />, label: I18n.t("JOSM"), click: () => this._editJOSM() },
				{ icon: <Pencil />, label: I18n.t("iD"), click: () => this._editId() },
				{ color: "primary", icon: <Check />, label: I18n.t("Done"), click: () => this._review("reviewed") },
				{ color: "accent", icon: <EyeOff />, label: I18n.t("Can't see"), click: () => this._review("cantsee") }
			];
			
			const goMessages = {
				1: I18n.t("You made you first edit, great ! 😉"),
				10: I18n.t("10 edits, keep going ! 😃"),
				30: I18n.t("30 edits, not bad 👍"),
				42: I18n.t("42 edits, the answer ! 😜"),
				60: I18n.t("60 edit, you're a star ! ✨"),
				80: I18n.t("80 edits, not far from 100 !"),
				100: I18n.t("You did it, 100 edits ! Thank you 😘"),
				110: I18n.t("Now you're a Pic4Review rock star, I will let you alone (for now 😏). Keep on the good job !")
			};
			
			if(goMessages[this.state.count]) {
				PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: goMessages[this.state.count], duration: 6000 });
			}
			
			return <div style={this.props.style}>
				<Grid container>
					<Grid item xs={12} sm={4} lg={3}>
						<Map ref="map" feature={this.state.feature} pictures={this.state.feature.pictures} style={{ height: BANNER_HEIGHT[this.props.width] }} />
						<Tags feature={this.state.feature} style={{marginTop: 10}} />
					</Grid>
					<Grid item xs={12} sm={8} lg={9}>
						<Grid container style={{marginBottom: 10}}>
							{buttons.map((b,i) => {
								return <Grid item xs={6} sm={4} lg={2} key={i}>
									<Button raised color={b.color || "default"} onClick={b.click} style={{width:"100%", height:"100%" }}>
										{b.icon}
										{b.label}
									</Button>
								</Grid>
							})}
						</Grid>
						
						<Gallery
							pictures={this.state.feature.pictures}
							cols={IMG_COLS[this.props.width]}
							height={Math.floor(BANNER_HEIGHT[this.props.width]*0.75)}
							style={{marginBottom: 10}}
						/>
						
						{this.state.feature.pictures && this.state.currentPictureId !== null ? <Picture picture={this.state.feature.pictures[this.state.currentPictureId]} /> : null}
					</Grid>
				</Grid>
				
				<First open={this.state.firstReview} mid={this.props.mission.id} onClose={() => this._closeFirstHelp()} />
			</div>;
		}
	}
	
	componentWillMount() {
		this._next();
		this.psTokens.picClick = PubSub.subscribe("UI.MISSION.PIC.CLICKED", (msg, data) => {
			this.setState({ currentPictureId: data.id });
		});
		
		if(sessionStorage.getItem(NOT_FIRST_REVIEW) === null) {
			this.setState({ firstReview: true });
		}
	}
	
	componentWillUnmount() {
		if(this.psTokens.picClick) {
			PubSub.unsubscribe(this.psTokens.picClick);
			delete this.psTokens.picClick;
		}
	}
}

export default withWidth()(withRouter(MissionReviewComponent));

/**
 * Event sent when a picture was selected for the current feature
 * @event UI.MISSION.PIC.CLICKED
 * @type {Object} Event data
 * @property {int} id The picture ID
 * @memberof Events
 */
