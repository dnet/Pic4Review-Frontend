import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import withWidth from 'material-ui/utils/withWidth';
import { Check, Pencil, RadioboxBlank, RadioboxMarked } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import { FormControlLabel } from 'material-ui/Form';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import HorizontalScrollGridList from '../HorizontalScrollGridList';
import IconButton from 'material-ui/IconButton';
import Markdown from 'react-markdown';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { SwatchesPicker } from 'react-color';
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
	
	render() {
		const instructions = <div className="limited-images" style={{overflow: "auto", textAlign: "justify", maxHeight: INSTR_HEIGHT[this.props.width], marginBottom: 10}}>
			<Markdown className={this.props.classes.root} source={this.props.instructions} />
		</div>;
		
		if(this.props.data && this.props.data.type && this.props.data.type !== "disabled") {
			let content = null;
			
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
			
			return <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: this.props.width === "xs" ? 5 : 20 }}>
				<Typography variant="headline">{this.props.data.question}</Typography>
				{this.props.width === "xs" && <Typography variant="subheading">{I18n.t("Use street pictures at the bottom to find the answer !")}</Typography>}
				
				{instructions}
				{content}
			</div>;
		}
		else {
			return <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 20 }}>
				<Typography variant="headline">{I18n.t("This need an advanced edit !")}</Typography>
				
				{instructions}
				
				{(this.props.featureProps.title || this.props.featureProps.details) &&
					<Typography>{I18n.t("Details")} : {this.props.featureProps.details ? this.props.featureProps.details : this.props.featureProps.title}</Typography>
				}
				
				<Button variant="raised" onClick={this.props.onOpenEditor} style={{ margin: 20, minWidth: 150 }}>
					<Pencil /> {I18n.t("Edit")}
				</Button>
			</div>;
		}
	}
}

export default withStyles(styles)(withWidth()(MissionReviewQuestionComponent));
