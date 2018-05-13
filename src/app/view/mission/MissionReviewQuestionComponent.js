import React, { Component } from 'react';
import withWidth from 'material-ui/utils/withWidth';
import { Pencil, RadioboxBlank, RadioboxMarked } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import { FormControlLabel } from 'material-ui/Form';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Typography from 'material-ui/Typography';

const IMG_COLS = { "xs": 1.5, "sm": 2.5, "md": 3.5, "lg": 4.5, "xl": 5.5 };

/**
 * Mission review progress component displays a progress bar for the current review session.
 */
class MissionReviewQuestionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			selectedAnswer: -1
		};
	}
	
	_onAnswerChange(key) {
		key = parseInt(key);
		this.setState({ selectedAnswer: key });
		this.props.onAnswerChange(this.props.data.answers[key]);
	}
	
	render() {
		if(this.props.data && this.props.data.type && this.props.data.type !== "disabled") {
			let content = null;
			
			if(this.props.data.type === "images") {
				content = <GridList cols={Math.min(IMG_COLS[this.props.width], this.props.data.answers.length)} style={{ flexWrap: "nowrap", marginTop: 10 }}>
					{this.props.data.answers.map((answer, i) => {
						const onClick = () => this._onAnswerChange(i);
						
						return <GridListTile key={answer.label} onClick={onClick}>
							<img src={answer.image} alt={answer.label} />
							<GridListTileBar
								title={answer.label}
								actionPosition="left"
								actionIcon={
									<IconButton style={{ color: "white" }} onClick={onClick}>
										{this.state.selectedAnswer === i ? <RadioboxMarked /> : <RadioboxBlank />}
									</IconButton>
								}
							/>
						</GridListTile>;
					})}
				</GridList>;
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
			
			return <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: this.props.width === "xs" ? 5 : 20 }}>
				<Typography variant="headline">{this.props.data.question}</Typography>
				{content}
			</div>;
		}
		else {
			return <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 20 }}>
				<Typography variant="headline">{I18n.t("This need an advanced edit !")}</Typography>
				<Typography variant="subheading">{I18n.t("Edit the feature according to mission description below")}</Typography>
				
				<Button variant="raised" onClick={this.props.onOpenEditor} style={{ margin: 20, minWidth: 150 }}>
					<Pencil /> {I18n.t("Edit")}
				</Button>
			</div>;
		}
	}
}

export default withWidth()(MissionReviewQuestionComponent);
