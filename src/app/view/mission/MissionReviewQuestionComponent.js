import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import withWidth from 'material-ui/utils/withWidth';
import { Check, Pencil, RadioboxBlank, RadioboxMarked, MapMarkerMultiple, MapMarkerPlus } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import { FormControlLabel } from 'material-ui/Form';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import HorizontalScrollGridList from '../HorizontalScrollGridList';
import IconButton from 'material-ui/IconButton';
import Markdown from 'react-markdown';
import Paper from 'material-ui/Paper';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { SwatchesPicker } from 'react-color';
import Tags from './MissionReviewTagsComponent';
import TextField from 'material-ui/TextField';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

const IMG_COLS = { "xs": 1.5, "sm": 1.5, "md": 2.5, "lg": 3.5, "xl": 3.5 };
const IMG_HEIGHT = { "xs": 100, "sm": 150, "md": 150, "lg": 150, "xl": 150 };
const INSTR_HEIGHT = { "xs": 100, "sm": 150, "md": 200, "lg": 200, "xl": 200 };
const styles = theme => ({ root: theme.typography.caption });

/**
 * Mission review progress component displays a progress bar for the current review session.
 */
class MissionReviewQuestionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			selectedAnswer: -1,
			usertextValue: undefined
		};
	}
	
	_onAnswerChange(key) {
		key = parseInt(key);
		this.setState({ selectedAnswer: key });
		this.props.onAnswerChange(this.props.data.answers[key]);
	}
	
	_onUsertextAnswerChange(value) {
		this.setState({ usertextValue: value });
	}
	
	_onUsertextValidated() {
		this.props.onAnswerChange({
			tags: {
				[this.props.data.tag]: this.state.usertextValue
			}
		});
	}
	
	_onImportValidated() {
		this.props.onAnswerChange({
			validated: true
		});
	}
	
	_handleMerge(feature) {
		if(feature) {
			this.props.onAnswerChange({
				mergeWith: feature
			});
		}
		else if(this.props.similarFeatures && this.props.similarFeatures.features && this.props.similarFeatures.features.length === 1) {
			this.props.onAnswerChange({
				mergeWith: this.props.similarFeatures.features[0]
			});
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Choose the feature you want to merge with by clicking on it using the map"), smiley: "🔍", duration: 5000 });
		}
	}
	
	render() {
		const instructions = <div className="limited-images" style={{overflow: "auto", textAlign: "justify", maxHeight: INSTR_HEIGHT[this.props.width], marginBottom: 10}}>
			<Markdown className={this.props.classes.root} source={this.props.instructions} />
		</div>;
		
		if(this.props.data && this.props.data.type && this.props.data.type !== "disabled") {
			let content = null;
			let question = this.props.data.question;
			
			if(this.props.data.type === "images") {
				const tiles = this.props.data.answers.map((answer, i) => {
					const onClick = () => this._onAnswerChange(i);
					
					return <GridListTile key={answer.label} onClick={onClick}>
						<img src={answer.image} alt={answer.label} />
						<GridListTileBar
							subtitle={answer.label}
							actionPosition="left"
							actionIcon={
								<IconButton style={{ color: "white" }} onClick={onClick}>
									{this.state.selectedAnswer === i ? <RadioboxMarked /> : <RadioboxBlank />}
								</IconButton>
							}
							style={{height: 30}}
						/>
					</GridListTile>;
				});
				
				content = (this.props.width === "xs" || this.props.width === "sm") ?
					<HorizontalScrollGridList
						cols={Math.min(IMG_COLS[this.props.width], this.props.data.answers.length)}
						cellHeight={IMG_HEIGHT[this.props.width]}
						style={{ flexWrap: "nowrap", marginTop: 10 }}
						speed={2}
					>
						{tiles}
					</HorizontalScrollGridList>
					:
					<div
						style={{ maxHeight: IMG_HEIGHT[this.props.width]*2.2, marginTop: 10, overflowX: "hidden", overflowY: "auto" }}
					>
						<GridList
							cols={Math.min((this.props.width === "md" ? 2 : 3), tiles.length)}
							cellHeight={IMG_HEIGHT[this.props.width]}
						>
							{tiles}
						</GridList>
					</div>;
			}
			else if(this.props.data.type === "choice") {
				content = <RadioGroup
						row
						aria-label="answer"
						name="answer"
						value={this.state.selectedAnswer.toString()}
						onChange={ev => this._onAnswerChange(ev.target.value)}
						style={{ justifyContent: "center" }}
					>
						{this.props.data.answers.map((answer, i) => {
							return <FormControlLabel key={i} value={i.toString()} control={<Radio />} label={answer.label} />;
						})}
					</RadioGroup>;
			}
			else if(this.props.data.type === "usertext") {
				let select = null;
				if(this.props.data.type === "usertext" && this.props.data.valueType === "text") {
					select = <TextField
								id="answer"
								label={I18n.t("Your response")}
								value={this.state.usertextValue}
								onChange={ev => this._onUsertextAnswerChange(ev.target.value)}
								type="text"
								fullWidth
							/>;
				}
				else if(this.props.data.type === "usertext" && this.props.data.valueType === "number") {
					select = <TextField
								id="answer"
								label={I18n.t("Your response")}
								value={this.state.usertextValue}
								onChange={ev => this._onUsertextAnswerChange(ev.target.value)}
								type="number"
								fullWidth
							/>;
				}
				else if(this.props.data.type === "usertext" && this.props.data.valueType === "color") {
					select = <SwatchesPicker
								width="100%"
								height="200px"
								color={this.state.usertextValue}
								onChangeComplete={(color, ev) => this._onUsertextAnswerChange(color.hex)}
							/>;
				}
				
				content = <div>
					{select}
					<Tooltip title={I18n.t("Validate your answer")} style={{width:"100%", marginTop: 10}}>
						<Button variant="raised" color="primary" onClick={this._onUsertextValidated.bind(this)} style={{width:"100%", height:"100%" }}>
							<Check /> {I18n.t("OK")}
						</Button>
					</Tooltip>
				</div>;
			}
			else if(this.props.data.type === "importer") {
				question = I18n.t("Can you see the feature on pictures ?");
				
				const tags = Object.assign({}, this.props.feature.properties);
				delete tags.error_id;
				delete tags.title;
				
				content = <div>
					{this.props.width !== "xs" &&
						<Paper style={{maxHeight: 150, overflowY: "auto", marginBottom: 20}}>
							<Tags feature={{properties: tags}} />
						</Paper>
					}
					
					{this.props.similarFeatures &&
						<Typography variant="subheading" style={{marginBottom: 20}}>{I18n.t("There are similar features already existing around in OpenStreetMap (shown in orange on map).")}</Typography>
					}
					
					<Tooltip title={I18n.t("Click here if you can see the concerned feature on pictures")} style={{width:"100%"}}>
						<Button variant="raised" color="primary" onClick={this._onImportValidated.bind(this)} style={{ width:"100%", height:"100%" }}>
							{this.props.similarFeatures ? <MapMarkerPlus /> : <Check />}
							{this.props.similarFeatures ? I18n.t("I see it and it's not in OSM") : I18n.t("I can see the feature")}
						</Button>
					</Tooltip>
					
					{this.props.similarFeatures &&
						<Tooltip title={I18n.t("Click here if you can see the concerned feature on pictures, but also as an already existing feature in OSM shown as in orange on map")} style={{width:"100%", marginTop: 10}}>
							<Button variant="raised" color="secondary" onClick={() => this._handleMerge()} style={{ width:"100%", height:"100%" }}>
								<MapMarkerMultiple /> {I18n.t("I see it but it already exists in OSM")}
							</Button>
						</Tooltip>
					}
				</div>;
			}
			
			return <div style={{ textAlign: "center", paddingTop: this.props.width === "xs" ? 0 : 20, paddingBottom: this.props.width === "xs" ? 5 : 20 }}>
				<Typography variant="headline">{question}</Typography>
				
				{this.props.width !== "xs" && instructions}
				{content}
			</div>;
		}
		else {
			return <div style={{ textAlign: "center", paddingTop: this.props.width === "xs" ? 0 : 20, paddingBottom: this.props.width === "xs" ? 0 : 20 }}>
				<Typography variant="headline">{I18n.t("This need an advanced edit !")}</Typography>
				
				{this.props.width !== "xs" && instructions}
				
				{(this.props.feature.properties.title || this.props.feature.properties.details) &&
					<Typography>{I18n.t("Details")} : {this.props.feature.properties.details ? this.props.feature.properties.details : this.props.feature.properties.title}</Typography>
				}
				
				<Button variant="raised" onClick={this.props.onOpenEditor} style={{ margin: 20, minWidth: 150 }}>
					<Pencil /> {I18n.t("Edit")}
				</Button>
			</div>;
		}
	}
	
	componentDidMount() {
		PubSub.subscribe("UI.MAP.SIMILARCLICKED", (msg, data) => {
			this._handleMerge(data.feature);
		});
	}
	
	componentWillUnmount() {
		PubSub.unsubscribe("UI.MAP.SIMILARCLICKED");
	}
}

export default withStyles(styles)(withWidth()(MissionReviewQuestionComponent));
