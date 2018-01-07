import React, { Component } from 'react';
import { Information } from 'mdi-material-ui';
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
					<Information />
				</IconButton>
			</CardActions>
			<CardMedia
				style={{maxHeight: 300, width: "unset", maxWidth: "100%"}}
				component="img"
				image={this.props.picture.pictureUrl}
			/>
			<CardContent>
				{(new Date(this.props.picture.date)).toLocaleString()} - {this.props.picture.author} - { this.props.picture.provider }
			</CardContent>
		</Card>;
	}
}

export default MissionReviewPictureComponent;
