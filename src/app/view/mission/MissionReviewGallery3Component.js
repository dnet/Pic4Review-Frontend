import React, { Component } from 'react';
import "react-image-gallery/styles/css/image-gallery.css";
import withWidth from 'material-ui/utils/withWidth';
import ImageGallery from 'react-image-gallery';
import { MapMarkerRadius, MagnifyPlusOutline, PlusCircle, Star, StarOutline, TagHeart } from 'mdi-material-ui';
import IconButton from 'material-ui/IconButton';
import Magnifier from 'react-magnifier';
import Tooltip from 'material-ui/Tooltip';

/**
 * Mission review gallery component displays a serie of pictures for a given feature.
 */
class MissionReviewGallery3Component extends Component {
	constructor() {
		super();
		this.centerPic = 0;
	}
	
	render() {
		if(this.props.pictures && this.props.pictures.length > 0) {
			const style = Object.assign({}, this.props.style, {flexWrap: "nowrap", maxHeight: this.props.height});
			const allowUpdateAssociation = this.props.pictures.filter(p => p.featured).length > 0;
			const images = this.props.pictures.map((p,i) => Object.assign({}, p, { id: i, original: p.pictureUrl, thumbnail: p.thumbUrl }));
			if(this.props.showMore) { images.push({ more: true }); }
			
			return <ImageGallery
				ref="gallery"
				items={images}
				infinite={false}
				lazyLoad={true}
				showPlayButton={false}
				showFullscreenButton={false}
				showThumbnails={this.props.width !== "xs" && this.props.pictures.length > 1}
				thumbnailPosition="top"
				showBullets={this.props.width === "xs" && this.props.pictures.length > 1}
				useBrowserFullscreen={false}
				slideDuration={0}
				renderItem={item => {
					return item.more ?
					<div
						style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}
						onClick={() => this.props.onShowMore()}
					>
						<PlusCircle style={{height: 128, width: 128, color: "#3849aa"}}/>
						<p>{I18n.t("Click to load more pictures")}</p>
					</div>
					: <div className='image-gallery-image'>
						{this.props.width === "xs" ?
							<img
								src={item.thumbUrl || item.pictureUrl}
							/>
							:
							<Magnifier src={item.pictureUrl} zoomFactor={2.5} mgWidth={200} mgHeight={200} />
						}
						
						<div className="image-gallery-fullscreen-button">
							{this.props.width !== "xs" &&
								<Tooltip title={I18n.t("Picture details (and other pictures around)")}>
									<IconButton
										href={item.detailsUrl}
										target="_blank"
										style={{ color: "white" }}
										onClick={() => this.props.onPicDetails(item.id)}
									>
										<MapMarkerRadius />
									</IconButton>
								</Tooltip>
							}
							<Tooltip title={I18n.t("Zoom in (opens in new tab)")}>
								<IconButton
									href={item.pictureUrl}
									target="_blank"
									style={{ color: "white" }}
									onClick={() => this.props.onPicSelected(item.id)}
								>
									<MagnifyPlusOutline />
								</IconButton>
							</Tooltip>
						</div>
						
						<div className="image-gallery-play-button">
							{item.featured &&
								<Tooltip title={I18n.t("This picture is already associated to this feature")} style={{marginRight: 5}}>
									<TagHeart style={{verticalAlign: "middle"}} />
								</Tooltip>
							}
							
							{allowUpdateAssociation && !item.featured && this.props.picMarked !== item.id &&
								<Tooltip title={I18n.t("Mark this picture as best one")} style={{marginRight: 5}}>
									<StarOutline
										onClick={() => this.props.onPicMarked(item.id)}
										style={{verticalAlign: "middle"}}
									/>
								</Tooltip>
							}
							
							{allowUpdateAssociation && !item.featured && this.props.picMarked === item.id &&
								<Tooltip title={I18n.t("Unmark this picture")} style={{marginRight: 5}}>
									<Star
										style={{verticalAlign: "middle"}}
										onClick={() => this.props.onPicUnmarked(item.id)}
									/>
								</Tooltip>
							}
						</div>

						<span className='image-gallery-description'>
							{(new Date(item.date)).toLocaleDateString() + " - " + item.author + " - " + item.provider}
						</span>
					</div>;
				}}
			/>;
		}
		else {
			return <div></div>;
		}
	}
	
	componentDidMount() {
		//Find currently viewed picture
		if(this.props.pictures.length > 1) {
			this.timer = setInterval(() => {
				if(this.refs.gallery) {
					const currentPicId = this.refs.gallery.getCurrentIndex();
					
					//Notify parent of change
					if(currentPicId >= 0 && currentPicId < this.props.pictures.length && currentPicId !== this.centerPic) {
						this.centerPic = currentPicId;
						this.props.onCenterPicChanged(this.centerPic);
					}
				}
			}, 100);
		}
	}
	
	componentDidUpdate() {
		if(this.refs.gallery && this.refs.gallery.getCurrentIndex() !== this.props.currentPictureId) {
			this.refs.gallery.slideToIndex(this.props.currentPictureId);
			this.centerPic = this.props.currentPictureId;
		}
	}
	
	componentWillUnmount() {
		clearInterval(this.timer);
	}
}

export default withWidth()(MissionReviewGallery3Component);
