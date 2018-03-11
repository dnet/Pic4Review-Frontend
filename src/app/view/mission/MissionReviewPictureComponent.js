import React, { Component } from 'react';
import { ChevronLeft, ChevronRight, MapMarkerRadius, MagnifyPlusOutline } from 'mdi-material-ui';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Magnifier from 'react-magnifier';
import Paper from 'material-ui/Paper';
import Tooltip from 'material-ui/Tooltip';

/**
 * Mission review picture component allows showing large picture to user.
 * You can also access original picture link, metadata page, and so on.
 */
class MissionReviewPictureComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		const date = (new Date(this.props.picture.date)).toLocaleString();
		return <Paper>
			<div>
				<Tooltip title={I18n.t("Picture details (and other pictures around)")}>
					<IconButton href={this.props.picture.detailsUrl} target="_blank">
						<MapMarkerRadius />
					</IconButton>
				</Tooltip>
				<Tooltip title={I18n.t("Zoom in (opens in new tab)")}>
					<IconButton href={this.props.picture.pictureUrl} target="_blank">
						<MagnifyPlusOutline />
					</IconButton>
				</Tooltip>
			</div>
			<Grid
				container
				direction="row"
				alignItems="stretch"
				spacing={0}
				justify="space-between"
			>
				<Grid item xs={2} sm={1} style={{textAlign: "left"}}>
					<IconButton
						style={{height: "100%", width: "100%"}}
						onClick={() => this.props.onPrev()}
					>
						<ChevronLeft />
					</IconButton>
				</Grid>
				<Grid item xs={8} sm={10} style={{textAlign: "center"}}>
					<a
						href={this.props.picture.pictureUrl}
						target="_blank"
					>
						<Magnifier src={this.props.picture.pictureUrl} zoomFactor={2.5} mgWidth={200} mgHeight={200} />
					</a>
				</Grid>
				<Grid item xs={2} sm={1} style={{textAlign: "right"}}>
					<IconButton
						style={{height: "100%", width: "100%"}}
						onClick={() => this.props.onNext()}
					>
						<ChevronRight />
					</IconButton>
				</Grid>
			</Grid>
			<div style={{textAlign: "center", padding: 10}}>
				{date} - {this.props.picture.author} - { this.props.picture.provider }
			</div>
		</Paper>;
	}
}

export default MissionReviewPictureComponent;
