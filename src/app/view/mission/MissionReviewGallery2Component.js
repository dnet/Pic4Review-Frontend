import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Information, MapMarkerRadius, MagnifyPlusOutline, PlusCircle, Star, StarOutline, TagHeart } from 'mdi-material-ui';
import { GridListTile, GridListTileBar } from 'material-ui/GridList';
import Hidden from 'material-ui/Hidden';
import HorizontalScrollGridList from '../HorizontalScrollGridList';
import IconButton from 'material-ui/IconButton';
import Magnifier from 'react-magnifier';
import Tooltip from 'material-ui/Tooltip';

/**
 * Mission review gallery component displays a serie of pictures for a given feature.
 */
class MissionReviewGallery2Component extends Component {
	constructor() {
		super();
		
		this.myRefs = { grid: null, tiles: {} };
		this.centerPic = 0;
	}
	
	render() {
		if(this.props.pictures && this.props.pictures.length > 0) {
			const style = Object.assign({}, this.props.style, {flexWrap: "nowrap", maxHeight: this.props.height});
			const allowUpdateAssociation = this.props.pictures.filter(p => p.featured).length > 0;
			
			return <HorizontalScrollGridList
				cols={1.15}
				style={style}
				speed={2}
				ref={el => this.myRefs.grid = ReactDOM.findDOMNode(el)}
			>
				{this.props.pictures.map((p, i) => {
					const onClick = () => this.props.onPicSelected(i);
					const url = this.props.showThumbs ? p.thumbUrl || p.pictureUrl : p.pictureUrl;
					
					return <GridListTile
						key={i}
						style={{cursor:"pointer", height: "unset"}}
						ref={el => this.myRefs.tiles[i] = ReactDOM.findDOMNode(el)}
					>
						<a
							href={p.pictureUrl}
							onClick={onClick}
							target="_blank"
						>
							<Hidden only="xs"><Magnifier src={url} zoomFactor={2.5} mgWidth={200} mgHeight={200} /></Hidden>
							<Hidden smUp><img src={url} style={{maxHeight: this.props.height, maxWidth: "100%"}} /></Hidden>
						</a>
					
						<GridListTileBar
							titlePosition="top"
							style={{ height: 40 }}
							subtitle={
								<div>
								{p.featured &&
									<Tooltip title={I18n.t("This picture is already associated to this feature")} style={{marginRight: 5}}>
										<TagHeart style={{verticalAlign: "middle"}} />
									</Tooltip>}
								
								{allowUpdateAssociation && !p.featured && this.props.picMarked !== i &&
									<Tooltip title={I18n.t("Mark this picture as best one")} style={{marginRight: 5}}>
										<StarOutline
											onClick={() => this.props.onPicMarked(i)}
											style={{verticalAlign: "middle"}}
										/>
									</Tooltip>
								}
								{allowUpdateAssociation && !p.featured && this.props.picMarked === i &&
									<Tooltip title={I18n.t("Unmark this picture")} style={{marginRight: 5}}>
										<Star
											style={{verticalAlign: "middle"}}
											onClick={() => this.props.onPicUnmarked(i)}
										/>
									</Tooltip>
								}
								
								{(new Date(p.date)).toLocaleDateString() + " - " + p.author + " - " + p.provider}
								</div>}
							actionIcon={<div>
								<Tooltip title={I18n.t("Picture details (and other pictures around)")}>
									<IconButton
										href={p.detailsUrl}
										target="_blank"
										style={{ color: "white" }}
										onClick={() => this.props.onPicDetails(i)}
									>
										<MapMarkerRadius />
									</IconButton>
								</Tooltip>
								<Hidden only="xs"><Tooltip title={I18n.t("Zoom in (opens in new tab)")}>
									<IconButton
										href={p.pictureUrl}
										target="_blank"
										style={{ color: "white" }}
										onClick={onClick}
									>
										<MagnifyPlusOutline />
									</IconButton>
								</Tooltip></Hidden>
							</div>}
						/>
					</GridListTile>;
				})}
				
				{this.props.showMore &&
					<GridListTile
						style={{cursor:"pointer", height: "unset", width: "40%"}}
						onClick={() => this.props.onShowMore()}
					>
						<GridListTileBar
							titlePosition="top"
							style={{ height: 40 }}
							title={I18n.t("Load more pictures")}
						/>
						<div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
							<PlusCircle style={{height: 128, width: 128, color: "#3849aa"}}/>
						</div>
					</GridListTile>
				}
			</HorizontalScrollGridList>;
		}
		else {
			return <div></div>;
		}
	}
	
	componentDidMount() {
		//Find currently viewed picture
		if(this.props.pictures.length > 1) {
			this.timer = setInterval(() => {
				if(this.myRefs.grid) {
					if(Object.keys(this.myRefs.tiles).length > 0) {
						const bboxGrid = this.myRefs.grid.getBoundingClientRect();
						
						//Find tile having its center in display port of grid
						const matches = Object.entries(this.myRefs.tiles).filter(e => {
							const bboxTile = e[1].getBoundingClientRect();
							const center = (bboxTile.left+bboxTile.right)/2;
							return center > bboxGrid.left && center < bboxGrid.right;
						}).map(e => parseInt(e[0]));
						
						//Notify parent of change
						if(matches.length === 1 && matches[0] !== this.centerPic) {
							this.centerPic = matches[0];
							this.props.onCenterPicChanged(this.centerPic);
						}
					}
				}
			}, 500);
		}
	}
	
	componentDidUpdate(prevProps) {
		if(prevProps.currentPictureId !== this.props.currentPictureId && this.centerPic !== this.props.currentPictureId) {
			this.myRefs.grid.scrollLeft = this.myRefs.tiles[this.props.currentPictureId].offsetLeft - this.myRefs.tiles[this.props.currentPictureId].offsetWidth;
		}
	}
	
	componentWillUnmount() {
		clearInterval(this.timer);
	}
}

export default MissionReviewGallery2Component;
