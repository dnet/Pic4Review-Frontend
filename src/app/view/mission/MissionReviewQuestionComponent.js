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
			selectedAnswer: null
		};
	}
	
	render() {
		const question = {
			question: "À quoi ressemble l'équipement incendie ?",
			type: "images",
			answers: [
				{ label: "Borne", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Downtown_Charlottesville_fire_hydrant_1.jpg/150px-Downtown_Charlottesville_fire_hydrant_1.jpg" },
				{ label: "Plaque", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Berlin_hydrant_20050211_p1000517.jpg/200px-Berlin_hydrant_20050211_p1000517.jpg" },
				{ label: "Tuyau", image: "https://wiki.openstreetmap.org/w/images/thumb/3/33/Hydrants_20130326_112938.JPG/150px-Hydrants_20130326_112938.JPG" },
				{ label: "Mural", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Guentherscheid_Tunnel_Rescue4.jpg/225px-Guentherscheid_Tunnel_Rescue4.jpg" }
			]
		};
		
		if(question && question.type) {
			let content = null;
			
			if(question.type === "images") {
				content = <GridList cols={Math.min(IMG_COLS[this.props.width], question.answers.length)} style={{ flexWrap: "nowrap", marginTop: 10 }}>
					{question.answers.map(answer => {
						const onClick = () => {this.setState({ selectedAnswer: answer.label })};
						
						return <GridListTile key={answer.label} onClick={onClick}>
							<img src={answer.image} alt={answer.label} />
							<GridListTileBar
								title={answer.label}
								actionPosition="left"
								actionIcon={
									<IconButton style={{ color: "white" }} onClick={onClick}>
										{this.state.selectedAnswer === answer.label ? <RadioboxMarked /> : <RadioboxBlank />}
									</IconButton>
								}
							/>
						</GridListTile>;
					})}
				</GridList>;
			}
			else if(question.type === "choice") {
				content = <RadioGroup
						row
						aria-label="answer"
						name="answer"
						value={this.state.selectedAnswer}
						onChange={ev => this.setState({ selectedAnswer: ev.target.value })}
						style={{ justifyContent: "center" }}
					>
						{question.answers.map(answer => {
							return <FormControlLabel key={answer.label} value={answer.label} control={<Radio />} label={answer.label} />;
						})}
					</RadioGroup>;
			}
			
			return <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 20 }}>
				<Typography variant="headline">{question.question}</Typography>
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
