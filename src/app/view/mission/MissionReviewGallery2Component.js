import React, { Component } from 'react';
import { Information, MapMarkerRadius, MagnifyPlusOutline } from 'mdi-material-ui';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import Hidden from 'material-ui/Hidden';
import IconButton from 'material-ui/IconButton';
import Magnifier from 'react-magnifier';
import Tooltip from 'material-ui/Tooltip';

/**
 * Mission review gallery component displays a serie of pictures for a given feature.
 */
class MissionReviewGallery2Component extends Component {
	render() {
		if(this.props.pictures && this.props.pictures.length > 0) {
			const style = Object.assign({}, this.props.style, {flexWrap: "nowrap", maxHeight: this.props.height});
			
			return <GridList
				cols={Math.min(1.25, this.props.pictures.length)}
				style={style}
			>
				{this.props.pictures.map((p, i) => {
					return <GridListTile
						key={p.pictureUrl}
						onClick={() => PubSub.publish("UI.MISSION.PIC.CLICKED", { id: i })}
						style={{cursor:"pointer", height: "unset"}}
					>
						<a
							href={p.pictureUrl}
							target="_blank"
						>
							<Magnifier src={p.pictureUrl} zoomFactor={2.5} mgWidth={200} mgHeight={200} />
						</a>
					
						<GridListTileBar
							titlePosition="top"
							style={{ height: 40 }}
							subtitle={(new Date(p.date)).toLocaleDateString() + " - " + p.author + " - " + p.provider}
							actionIcon={<div>
								<Tooltip title={I18n.t("Picture details (and other pictures around)")}>
									<IconButton href={p.detailsUrl} target="_blank" style={{ color: "white" }}>
										<MapMarkerRadius />
									</IconButton>
								</Tooltip>
								<Hidden only="xs"><Tooltip title={I18n.t("Zoom in (opens in new tab)")}>
									<IconButton href={p.pictureUrl} target="_blank" style={{ color: "white" }}>
										<MagnifyPlusOutline />
									</IconButton>
								</Tooltip></Hidden>
							</div>}
						/>
					</GridListTile>;
				})}
			</GridList>;
		}
		else {
			return <div></div>;
		}
	}
}

export default MissionReviewGallery2Component;
