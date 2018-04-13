import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import withWidth from 'material-ui/utils/withWidth';
import { Pencil, Check, SkipForward, SkipPrevious, EyeOff } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Button from 'material-ui/Button';
import Editors from './MissionReviewEditorsComponent';
import First from './MissionFirstReviewComponent';
import Gallery from './MissionReviewGalleryComponent';
import Grid from 'material-ui/Grid';
import Leaflet from 'leaflet';
import Map from './MissionReviewMapComponent';
import Paper from 'material-ui/Paper';
import Picture from './MissionReviewPictureComponent';
import Progress from './MissionReviewProgressComponent';
import Markdown from 'react-markdown';
import Tags from './MissionReviewTagsComponent';
import Tooltip from 'material-ui/Tooltip';

const IMG_COLS = { "xs": 1.5, "sm": 2.5, "md": 3.5, "lg": 4.5, "xl": 5.5 };
const BANNER_HEIGHT = { "xs": 150, "sm": 150, "md": 200, "lg": 200, "xl": 200 };
const NOT_FIRST_REVIEW = "no1st";

const styles = theme => ({ root: theme.typography.caption });

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
			firstReview: false,
			openEditors: false,
			editorsAnchor: null
		};
		
		this.psTokens = {};
	}
	
	/**
	 * Start looking for next feature
	 * @private
	 */
	_next(wasSkipped) {
		wasSkipped = wasSkipped || false;
		const prevCoords = !wasSkipped && this.state.feature !== null ? this.state.feature.coordinates : null;
		
		this.setState({ feature: null, currentPictureId: null, prevFeature: this.state.feature });
		PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Retrieving next feature to review") });
		
		API.GetMissionNextFeature(this.props.mission.id, prevCoords)
		.then(f => {
			if(f !== null) {
				this.setState({ feature: f, currentPictureId: (f.pictures && f.pictures.length > 0 ? 0 : null) });
				
				PubSub.publish("UI.MESSAGE.WAITDONE");
				
				if(!f.pictures || f.pictures.length === 0) {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("No pictures available around this feature") });
				}
			}
			else {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				if(this.state.count > 0) {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("You just reviewed the last available feature, thank you so much ! You can work on another mission if you want to"), smiley: "😊", duration: 7000 });
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("This mission has already been completed ! But you can check out another mission"), smiley: "😋", duration: 6000 });
				}
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
	 * Switch to next available picture
	 * @private
	 */
	_nextPic() {
		if(
			this.state.feature
			&& this.state.feature.pictures
			&& this.state.currentPictureId !== null
		) {
			if(this.state.currentPictureId === this.state.feature.pictures.length - 1) {
				this.setState({ currentPictureId: 0 });
			}
			else {
				this.setState({ currentPictureId: this.state.currentPictureId+1 });
			}
		}
	}
	
	/**
	 * Switch to previous available picture
	 * @private
	 */
	_prevPic() {
		if(
			this.state.feature
			&& this.state.feature.pictures
			&& this.state.currentPictureId !== null
		) {
			if(this.state.currentPictureId === 0) {
				this.setState({ currentPictureId: this.state.feature.pictures.length - 1 });
			}
			else {
				this.setState({ currentPictureId: this.state.currentPictureId - 1 });
			}
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
				{ icon: <SkipPrevious />, label: I18n.t("Previous"), tip: I18n.t("Go back to the previously reviewed feature"), click: this._prev.bind(this) },
				{ icon: <SkipForward />, label: I18n.t("Skip"), tip: I18n.t("Skip this feature if you are not sure of what to do"), click: () => this._next(true) },
				{ spacing: true },
				{ icon: <Pencil />, label: I18n.t("Edit"), tip: I18n.t("Edit this feature with an OpenStreetMap editor"), click: e => this.setState({ openEditors: true, editorsAnchor: e.currentTarget }) },
				{ color: "primary", icon: <Check />, label: I18n.t("Done"), tip: I18n.t("Mark the feature as done when you have edited OpenStreetMap"), click: () => this._review("reviewed") },
				{ color: "secondary", icon: <EyeOff />, label: I18n.t("Can't see"), tip: I18n.t("When you can't see clearly the feature on pictures"), click: () => this._review("cantsee") }
			];
			
			return <div style={this.props.style}>
				<Progress mid={this.props.mission.id} />
				<Grid container spacing={16}>
					<Grid item xs={12} sm={4} lg={3}>
						<Map ref="map" feature={this.state.feature} pictures={this.state.feature.pictures} style={{ height: BANNER_HEIGHT[this.props.width], marginBottom: 10 }} />
						<div className="limited-images" style={{overflow: "auto", maxHeight: 200, marginBottom: 10}}>
							<Markdown className={this.props.classes.root} source={this.props.mission.description.full} />
						</div>
						<Tags feature={this.state.feature} />
					</Grid>
					<Grid item xs={12} sm={8} lg={9}>
						<Grid container spacing={16} style={{marginBottom: 10}}>
							{buttons.map((b,i) => {
								if(b.spacing) { return <Grid item xs={6} sm={4} lg={2} key={i}></Grid>; }
								else {
									return <Grid item xs={6} sm={4} lg={2} key={i}>
										<Tooltip title={b.tip} style={{width:"100%"}}>
											<Button variant="raised" color={b.color || "default"} onClick={b.click} style={{width:"100%", height:"100%" }}>
												{b.icon}
												{b.label}
											</Button>
										</Tooltip>
									</Grid>;
								}
							})}
						</Grid>
						
						<Gallery
							pictures={this.state.feature.pictures}
							cols={IMG_COLS[this.props.width]}
							height={Math.floor(BANNER_HEIGHT[this.props.width]*0.75)}
							style={{marginBottom: 10}}
						/>
						
						{this.state.feature.pictures && this.state.currentPictureId !== null ?
							<Picture
								picture={this.state.feature.pictures[this.state.currentPictureId]}
								onPrev={() => this._prevPic()}
								onNext={() => this._nextPic()}
							/> : null}
					</Grid>
				</Grid>
				
				<First open={this.state.firstReview} mid={this.props.mission.id} onClose={() => this._closeFirstHelp()} />
				
				<Editors
					open={this.state.openEditors}
					feature={this.state.feature}
					anchor={this.state.editorsAnchor}
					onClose={() => this.setState({openEditors: false})}
				/>
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
	
	componentWillUpdate(nextProps, nextState) {
		const goMessages = {
			1: { msg: I18n.t("You made you first edit, great !"), sml: "😉" },
			10: { msg: I18n.t("10 edits, keep going !"), sml: "😃" },
			30: { msg: I18n.t("30 edits, not bad"), sml: "👍" },
			42: { msg: I18n.t("42 edits, the answer !"), sml: "😜" },
			60: { msg: I18n.t("60 edit, you're a star !"), sml: "✨" },
			80: { msg: I18n.t("80 edits, not far from 100 !"), sml: "😃" },
			100: { msg: I18n.t("You did it, 100 edits ! Thank you"), sml: "😘" },
			110: { msg: I18n.t("Keep going on ! Now you're a Pic4Review rock star, I will let you alone (for now)"), sml: "😏" }
		};
		
		if(this.state.count < nextState.count && goMessages[nextState.count]) {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: goMessages[nextState.count].msg, smiley: goMessages[nextState.count].sml, duration: 6000 });
		}
	}
	
	componentWillUnmount() {
		if(this.psTokens.picClick) {
			PubSub.unsubscribe(this.psTokens.picClick);
			delete this.psTokens.picClick;
		}
	}
}

export default withStyles(styles)(withWidth()(withRouter(MissionReviewComponent)));

/**
 * Event sent when a picture was selected for the current feature
 * @event UI.MISSION.PIC.CLICKED
 * @type {Object} Event data
 * @property {int} id The picture ID
 * @memberof Events
 */
