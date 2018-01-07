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
		if(this.props.pictures && this.props.pictures.length > 0) {
			const style = Object.assign({}, this.props.style, {flexWrap: "nowrap"});
			
			return <GridList cols={this.props.cols} cellHeight={this.props.height} style={style}>
			{this.props.pictures.map((p, i) => {
				return <GridListTile
					key={p.pictureUrl}
					onClick={() => PubSub.publish("UI.MISSION.PIC.CLICKED", { id: i })}
					style={{cursor:"pointer"}}
				>
					<img src={p.pictureUrl} />
					<GridListTileBar titlePosition="bottom" subtitle={(new Date(p.date)).toLocaleString()} style={{height: 20}} />
				</GridListTile>;
			})}
			</GridList>;
		}
		else {
			return <div></div>;
		}
	}
}

export default MissionReviewGalleryComponent;
