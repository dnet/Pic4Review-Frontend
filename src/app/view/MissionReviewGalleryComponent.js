import React, { Component } from 'react';
import { Information } from 'mdi-material-ui';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';

/**
 * Mission review gallery component displays a serie of pictures for a given feature.
 */
class MissionReviewGalleryComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		if(this.props.pictures) {
			return <GridList cols={2.5}>
			{this.props.pictures.map((p, i) => {
				<GridListTile key={p.pictureUrl}>
					<img
						src={p.pictureUrl}
						onClick={() => PubSub.publish("UI.MISSION.PIC.CLICKED", { id: i})}
						style={{cursor:"pointer"}}
					/>
					<GridListTileBar titlePosition="top" style={{background: "none"}} actionIcon={
						<IconButton href={p.detailsUrl} target="_blank">
							<Information style={{color:"white"}} />
						</IconButton>
					} />
				</GridListTile>
			})}
			</GridList>;
		}
		else {
			return <div></div>;
		}
	}
}

export default MissionReviewGalleryComponent;
