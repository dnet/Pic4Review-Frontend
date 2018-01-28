import React, { Component } from 'react';
import { InformationOutline, MagnifyPlusOutline } from 'mdi-material-ui';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';

/**
 * Mission review picture component allows showing large picture to user.
 * You can also access original picture link, metadata page, and so on.
 */
class MissionReviewPictureComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		return <Card style={{textAlign: "center"}}>
			<CardActions>
				<IconButton href={this.props.picture.detailsUrl} target="_blank">
					<InformationOutline />
				</IconButton>
				<IconButton href={this.props.picture.pictureUrl} target="_blank">
					<MagnifyPlusOutline />
				</IconButton>
			</CardActions>
			<CardMedia
				style={{maxHeight: 400, width: "unset", maxWidth: "100%"}}
				component="img"
				image={this.props.picture.pictureUrl}
				onClick={() => window.open(this.props.picture.pictureUrl).focus()}
			/>
			<CardContent>
				{(new Date(this.props.picture.date)).toLocaleString()} - {this.props.picture.author} - { this.props.picture.provider }
			</CardContent>
		</Card>;
	}
}

export default MissionReviewPictureComponent;
