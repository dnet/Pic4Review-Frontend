import React, { Component } from 'react';
import { Pencil, Check, SkipForward, SkipPrevious, EyeOff } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import CONSTS from '../constants';
import Gallery from './MissionReviewGalleryComponent';
import Grid from 'material-ui/Grid';
import Leaflet from 'leaflet';
import Map from './MissionReviewMapComponent';
import request from 'browser-request';
import Tags from './MissionReviewTagsComponent';

/**
 * Mission review component allows to review pictures for a given mission.
 * You can review features one by one.
 */
class MissionReviewComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			feature: null,
			pictures: null,
			radius: 20
		};
	}
	
	/**
	 * Start looking for next feature
	 * @private
	 */
	_next() {
		this.setState({ feature: null, pictures: null });
		PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Retrieving next feature to review") });
		
		this.props.mission.dataset.getNextFeature()
		.then(f => {
			if(f !== null) {
				this.setState({ feature: f });
				
				PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Looking for feature's pictures") });
				
				f.getPictures(this.state.radius)
				.then(p => {
					this.setState({ pictures: p });
					PubSub.publish("UI.MESSAGE.WAITDONE");
				})
				.catch(e => {
					console.error(e);
					PubSub.publish("UI.MESSAGE.WAITDONE");
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get pictures for this feature.") });
				});
			}
			else {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("You have done reviewing all features !") });
				PubSub.publish("UI.MISSION.TAB", { tab: "summary" });
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
		const prev = this.props.mission.dataset.getPreviousFeature();
		
		if(prev !== null) {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Loading previous feature") });
			this.setState({ feature: null, pictures: null });
			
			prev.getPictures(this.state.radius)
			.then(p => {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				this.setState({ feature: prev, pictures: p });
			})
			.catch(e => {
				console.error(e);
				this.setState({ feature: null, pictures: null });
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get pictures for this feature.") });
			});
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("You can't go back anymore") });
		}
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
	
	render() {
		if(!this.state.feature) {
			const style = Object.assign({}, this.props.style, { textAlign: "center" });
			return <div style={style}></div>;
		}
		else {
			const buttons = [
				{ icon: <SkipPrevious />, label: I18n.t("Previous"), click: this._prev.bind(this) },
				{ icon: <SkipForward />, label: I18n.t("Skip"), click: () => { this.state.feature.status = "skipped"; this._next(); } },
				{ icon: <Pencil />, label: I18n.t("JOSM"), click: this._editJOSM.bind(this) },
				{ icon: <Pencil />, label: I18n.t("iD"), click: this._editId.bind(this) },
				{ color: "primary", icon: <Check />, label: I18n.t("Done"), click: () => {} },
				{ color: "accent", icon: <EyeOff />, label: I18n.t("Can't see"), click: () => {} }
			];
			
			return <div style={this.props.style}>
				<Grid container>
					<Grid item xs={12} sm={4} lg={3}>
						<Map ref="map" feature={this.state.feature} pictures={this.state.pictures} style={{ height: 200 }} />
						<Tags feature={this.state.feature} style={{marginTop: 10}} />
					</Grid>
					<Grid item xs={12} sm={8} lg={9}>
						<Grid container>
							{buttons.map((b,i) => {
								return <Grid item xs={6} sm={4} lg={2} key={i}>
									<Button raised color={b.color || "default"} onClick={b.click} style={{width:"100%", height:"100%" }}>
										{b.icon}
										{b.label}
									</Button>
								</Grid>
							})}
						</Grid>
						
						<Gallery pictures={this.state.pictures} />
						<div>Image</div>
					</Grid>
				</Grid>
			</div>;
		}
	}
	
	componentWillMount() {
		this._next();
	}
}

export default MissionReviewComponent;

/**
 * Event sent when a picture was selected for the current feature
 * @event UI.MISSION.PIC.CLICKED
 * @type {Object} Event data
 * @property {int} id The picture ID
 * @memberof Events
 */
