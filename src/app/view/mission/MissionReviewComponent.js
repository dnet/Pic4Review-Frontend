import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import withWidth from 'material-ui/utils/withWidth';
import { Pencil, Check, SkipForward, SkipPrevious, EyeOff } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Button from 'material-ui/Button';
import ConfirmEdit from './MissionReviewFeatureDialogComponent';
import Editors from './MissionReviewEditorsComponent';
import First from './MissionFirstReviewComponent';
import Gallery2 from './MissionReviewGallery2Component';
import Grid from 'material-ui/Grid';
import Hidden from 'material-ui/Hidden';
import Leaflet from 'leaflet';
import Map from './MissionReviewMapComponent';
import Markdown from 'react-markdown';
import Paper from 'material-ui/Paper';
import Question from './MissionReviewQuestionComponent';
import Tooltip from 'material-ui/Tooltip';
import Tags from './MissionReviewTagsComponent';

const PICTURE_HEIGHT = { "xs": 400, "sm": 500, "md": 600, "lg": 700, "xl": 800 };
const BANNER_HEIGHT = { "xs": 150, "sm": 150, "md": 200, "lg": 200, "xl": 200 };
const NOT_FIRST_REVIEW = "no1st";
const EDITS_COUNT = "edits_count";

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
			clickedPictureId: null,
			prevFeature: null,
			count: sessionStorage.getItem(EDITS_COUNT) || 0,
			firstReview: false,
			openEditors: false,
			editorsAnchor: null,
			currentAnswer: null,
			openConfirmEdit: false,
			hideConfirmEdit: false
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
		
		this.setState({ feature: null, currentPictureId: null, clickedPictureId: null, prevFeature: this.state.feature, currentAnswer: null });
		PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Retrieving next feature to review") });
		
		API.GetMissionNextFeature(this.props.mission.id, prevCoords)
		.then(f => {
			if(f !== null) {
				this.setState({ feature: f, currentPictureId: (f.pictures && f.pictures.length > 0 ? 0 : null) });
				if(this.refs.container) {
					this.refs.container.scrollIntoView(false);
				}
				
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
				currentPictureId: this.state.prevFeature.pictures.length > 0 ? 0 : null,
				clickedPictureId: null
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
	_review(status, externalEditConfirmed) {
		externalEditConfirmed = externalEditConfirmed || (!this.state.currentAnswer && this.state.hideConfirmEdit);
		
		//Update feature in DB
		const updateDB = (upData) => {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Updating Pic4Review mission") });
			
			upData = upData || {};
			this.state.feature.status = status;
			
			API.UpdateMissionFeature(
				this.props.mission.id,
				this.state.feature,
				this.props.user.name,
				this.props.user.id
			)
			.then(() => {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				this._setChangesetId(upData.changesetId);
				this.setState({ count: this.state.count+1, });
				this._next();
			})
			.catch(e => {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't update feature, please retry") });
			});
		};
		
		//If editor activated
		if(status === "reviewed" && !externalEditConfirmed) {
			if(
				this.state.currentAnswer
				&& this.props.mission.options && this.props.mission.options.data
				&& this.props.mission.options.data.options && this.props.mission.options.data.options.editors
				&& this.props.mission.options.data.options.editors.type !== "disabled"
				&& this.state.feature && this.state.feature.properties && this.state.feature.properties.id
			) {
				//Update feature
				PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Updating feature in OpenStreetMap") });
				
				API.UpdateOSMFeature(
					this.state.feature.properties.id,
					this._getTagsToApply(),
					this.props.mission.description.short + " (" + this.props.mission.area.name + ")",
					this._getChangesetId()
				)
				.then(res => {
					updateDB(res);
				})
				.catch(e => {
					PubSub.publish("UI.MESSAGE.WAITDONE");
					console.error(e);
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't upload feature to OSM, please retry") });
				});
			}
			else {
				this.setState({ openConfirmEdit: true });
			}
		}
		else {
			updateDB();
		}
	}
	
	_closeFirstHelp() {
		sessionStorage.setItem(NOT_FIRST_REVIEW, "1");
		this.setState({ firstReview: false });
	}
	
	/**
	 * Retrieve last changeset ID for this mission from sessionStorage
	 * @private
	 */
	_getChangesetId() {
		return sessionStorage.getItem("cid_"+this.props.match.params.mid);
	}
	
	/**
	 * Update changeset ID for this mission
	 * @private
	 */
	_setChangesetId(changesetId) {
		sessionStorage.setItem("cid_"+this.props.match.params.mid, changesetId);
	}
	
	/**
	 * Get the tags to apply on the feature according to selected answer + current picture
	 * @private
	 */
	_getTagsToApply() {
		let tags = Object.assign({}, this.state.currentAnswer.tags);
		
		/*
		 * Add tags related to picture
		 */
		
		let picId = null;
		
		//Click on picture details
		if(this.state.clickedPictureId !== null && this.state.clickedPictureId < 0) {
			picId = null;
		}
		//Single picture
		else if(this.state.feature.pictures.length === 1) {
			picId = 0;
		}
		//Picture + click is same
		else if(this.state.currentPictureId === this.state.clickedPictureId || (this.state.currentPictureId !== null && this.state.clickedPictureId === null)) {
			picId = this.state.currentPictureId;
		}
		//Picture centered + clicked is not same
		else {
			console.log("Not sure which picture is the best between", this.state.currentPictureId, "and", this.state.clickedPictureId);
		}
		
		//Add tags
		if(picId !== null) {
			const pic = this.state.feature.pictures[picId];
			
			if(pic && pic.osmTags) {
				tags = Object.assign(tags, pic.osmTags);
				tags["survey:date"] = (new Date(pic.date)).toISOString().split("T")[0];
			}
		}
		
		return tags;
	}
	
	_hasEditor() {
		return this.state.feature
			&& this.state.feature.properties && this.state.feature.properties.id
			&& this.props.mission.options && this.props.mission.options.data
			&& this.props.mission.options.data.options && this.props.mission.options.data.options.editors
			&& this.props.mission.options.data.options.editors.type !== "disabled";
	}
	
	render() {
		if(!this.state.feature) {
			const style = Object.assign({}, this.props.style, { textAlign: "center" });
			return <div style={style}></div>;
		}
		else {
			const buttons = {
				prev: { icon: <SkipPrevious />, label: I18n.t("Previous"), tip: I18n.t("Go back to the previously reviewed feature"), click: this._prev.bind(this) },
				next: { icon: <SkipForward />, label: I18n.t("Skip"), tip: I18n.t("Skip this feature if you are not sure of what to do"), click: () => this._next(true) },
				edit: { icon: <Pencil />, label: I18n.t("Edit"), tip: I18n.t("Edit this feature with an OpenStreetMap editor"), click: e => this.setState({ openEditors: true, editorsAnchor: e.currentTarget }) },
				done: { color: "primary", icon: <Check />, label: I18n.t("Validate"), tip: I18n.t("Mark the feature as done when you have edited OpenStreetMap"), click: () => this._review("reviewed") }
			};
			
			const createBtn = (btn, s, text) => {
				const b = buttons[btn];
				text = text === undefined ? true : text;
				return <Grid item xs={s} key={btn}>
					<Tooltip title={b.tip} style={{width:"100%"}}>
						<Button variant="raised" color={b.color || "default"} onClick={b.click} style={{width:"100%", height:"100%" }}>
							{b.icon}
							{text && b.label}
						</Button>
					</Tooltip>
				</Grid>;
			};
			
			const map = <Map
							ref="map"
							feature={this.state.feature}
							pictures={this.state.feature.pictures}
							currentPictureId={this.state.currentPictureId}
							style={{ height: BANNER_HEIGHT[this.props.width], marginBottom: 10 }}
						/>;
			
			const instructions = <div className="limited-images" style={{overflow: "auto", maxHeight: BANNER_HEIGHT[this.props.width], marginBottom: 10}}>
									<Markdown className={this.props.classes.root} source={this.props.mission.description.full} />
								</div>;
			
			return <div style={this.props.style} ref="container">
				<Grid container spacing={8}>
					<Grid item xs={12} sm={6} lg={5} xl={4}>
						<Question
							data={this._hasEditor() && this.props.mission.options.data.options.editors}
							featureProps={this.state.feature.properties}
							onOpenEditor={e => this.setState({ openEditors: true, editorsAnchor: e.currentTarget })}
							onAnswerChange={d => { this.setState({ currentAnswer: d }, () => this._review("reviewed")); }}
						/>
						
						{this._hasEditor() ?
							<Grid container hidden={{ smDown: true }} spacing={8} style={{marginBottom: 10}}>
								{createBtn("prev", 4)}
								{createBtn("edit", 4)}
								{createBtn("next", 4)}
							</Grid>
							:
							<Grid container hidden={{ smDown: true }} spacing={8} style={{marginBottom: 10}}>
								{createBtn("prev", 4)}
								{createBtn("done", 4)}
								{createBtn("next", 4)}
							</Grid>
						}
						
						{this._hasEditor() ?
							<Grid container hidden={{ mdUp: true }} spacing={8} style={{marginBottom: 10}}>
								{createBtn("prev", 6)}
								{createBtn("next", 6)}
							</Grid>
							:
							<Grid container hidden={{ mdUp: true }} spacing={8} style={{marginBottom: 10}}>
								{createBtn("done", 12)}
								{createBtn("prev", 6)}
								{createBtn("next", 6)}
							</Grid>
						}
						
						<Grid container spacing={8}>
							<Grid item hidden={{ only: "xs" }} sm={6}>{map}</Grid>
							<Grid item hidden={{ only: "xs" }} sm={6}>{instructions}</Grid>
						</Grid>
					</Grid>
					
					<Grid item xs={12} sm={6} lg={7} xl={8}>
						{this.state.feature.pictures &&
							<Gallery2
								pictures={this.state.feature.pictures}
								height={PICTURE_HEIGHT[this.props.width]}
								style={{marginBottom: 10}}
								onPicSelected={id => this.setState({ clickedPictureId: id })}
								onCenterPicChanged={id => this.setState({ currentPictureId: id })}
								onPicDetails={id => this.setState({ clickedPictureId: -id })}
								showThumbs={this.props.width === "xs"}
							/>}
					</Grid>
					
					<Grid item xs={12} hidden={{ smUp: true }}>
						{map}
						<Hidden only="xs">{instructions}</Hidden>
					</Grid>
				</Grid>
				
				<First open={this.state.firstReview} mid={this.props.mission.id} onClose={() => this._closeFirstHelp()} />
				
				<Editors
					open={this.state.openEditors}
					feature={this.state.feature}
					anchor={this.state.editorsAnchor}
					onClose={() => this.setState({openEditors: false})}
				/>
				
				<ConfirmEdit
					open={!this.state.hideConfirmEdit && this.state.openConfirmEdit}
					onClose={() => this.setState({ openConfirmEdit: false })}
					onValid={nomore => { this.setState({ hideConfirmEdit: nomore }); this._review("reviewed", true); }}
					hasEditor={this._hasEditor()}
				/>
			</div>;
		}
	}
	
	componentWillMount() {
		this._next();
		
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
		
		sessionStorage.setItem(EDITS_COUNT, nextState.count);
	}
}

export default withStyles(styles)(withWidth()(withRouter(MissionReviewComponent)));
