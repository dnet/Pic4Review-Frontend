import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Map from './MissionReviewMapComponent';

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
		this.props.mission.dataset.getNextFeature()
		.then(f => {
			this.setState({ feature: f, pictures: null });
			
			f.getPictures(this.state.radius)
			.then(p => {
				this.setState({ pictures: p });
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get pictures for this feature.") });
			});
		})
		.catch(e => {
			console.error(e);
			this.setState({ feature: null, pictures: null });
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't retrieve next feature to review.") });
		});
	}
	
	render() {
		if(!this.state.feature) {
			const style = Object.assign({}, this.props.style, { textAlign: "center" });
			return <div style={style}><CircularProgress size={70} /></div>;
		}
		else {
			return <div style={this.props.style}>
				<Grid container>
					<Grid item xs={12} sm={4} lg={3}>
						<Map feature={this.state.feature} pictures={this.state.pictures} />
						<div>Clés/valeurs</div>
					</Grid>
					<Grid item xs={12} sm={8} lg={9}>
						<div>Boutons</div>
						<div>Gallerie</div>
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
