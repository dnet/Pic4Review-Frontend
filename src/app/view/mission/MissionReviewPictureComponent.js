import React, { Component } from 'react';
import { ChevronLeft, ChevronRight, InformationOutline, MagnifyPlusOutline } from 'mdi-material-ui';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';

/**
 * Mission review picture component allows showing large picture to user.
 * You can also access original picture link, metadata page, and so on.
 */
class MissionReviewPictureComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		return <Paper>
			<div>
				<IconButton href={this.props.picture.detailsUrl} target="_blank">
					<InformationOutline />
				</IconButton>
				<IconButton href={this.props.picture.pictureUrl} target="_blank">
					<MagnifyPlusOutline />
				</IconButton>
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
						<img
							src={this.props.picture.pictureUrl}
							style={{maxWidth: "100%"}}
						/>
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
				{(new Date(this.props.picture.date)).toLocaleString()} - {this.props.picture.author} - { this.props.picture.provider }
			</div>
		</Paper>;
	}
}

export default MissionReviewPictureComponent;
