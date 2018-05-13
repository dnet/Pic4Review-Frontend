import React, { Component } from 'react';
import { ChevronDown, PlusCircle } from 'mdi-material-ui';
import Chip from 'material-ui/Chip';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import SingleChoiceAnswerDialog from './NewMissionEditorsSingleChoiceAnswerDialogComponent';
import TextField from 'material-ui/TextField';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

/**
 * New mission details component allows users to input mission details (area name, short description, full description...)
 */
class NewMissionEditorsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			editor: "singlechoice",
			singleChoiceAnswerDialogOpen: false,
			singleChoiceAnswerDialogEdit: null,
			data: {
				singlechoice: {
					question: "",
					answers: []
				}
			}
		};
	}
	
	/**
	 * Change the used editor
	 * @private
	 */
	_changeEditor(id) {
		this.setState({ editor: id });
	}
	
	/**
	 * Change the single choice question
	 * @private
	 */
	_changeSingleChoiceQuestion(event) {
		const newData = Object.assign({}, this.state.data);
		newData.singlechoice.question = event.target.value;
		this.setState({ data: newData });
	}
	
	/**
	 * Add a new answer for a single choice editor
	 * @private
	 */
	_addSingleChoiceAnswer(d) {
		const newData = Object.assign({}, this.state.data);
		
		if(this.state.singleChoiceAnswerDialogEdit !== null) {
			newData.singlechoice.answers[this.state.singleChoiceAnswerDialogEdit] = d;
		}
		else {
			newData.singlechoice.answers.push(d);
		}
		
		this.setState({ data: newData, singleChoiceAnswerDialogEdit: null, singleChoiceAnswerDialogOpen: false });
	}
	
	/**
	 * Removes an answer of a single choice editor
	 * @private
	 */
	_removeSingleChoiceAnswer(id) {
		const newData = Object.assign({}, this.state.data);
		newData.singlechoice.answers.splice(id, 1);
		this.setState({ data: newData });
	}
	
	render() {
		return <div style={this.props.style}>
			<Typography variant="subheading">{I18n.t("Editor")}</Typography>
			<Typography variant="caption">{I18n.t("In order to make mission solving easier, you may create a question to which users can answer simply. This makes possible to contribute on smartphone, and saves time on the desktop version. However, some missions can't be solved with a single question, then users have to contribute using a traditional OSM editor.")}</Typography>
			<Typography variant="caption" style={{marginBottom: 10}}>{I18n.t("Choose the most appropriate editor according to your mission needs.")}</Typography>
			
			<ExpansionPanel expanded={this.state.editor === "singlechoice"} onChange={() => this._changeEditor("singlechoice")}>
				<ExpansionPanelSummary expandIcon={<ChevronDown />}>
					<Typography variant="body2">{I18n.t("Question with single choice answer")}</Typography>
				</ExpansionPanelSummary>
				
				<ExpansionPanelDetails style={{display: "block"}}>
					<TextField
						id="question"
						label={I18n.t("Question label")}
						helperText={I18n.t("A short, explicit question, leading to easy answer")}
						value={this.state.data.singlechoice ? this.state.data.singlechoice.question : ""}
						onChange={this._changeSingleChoiceQuestion.bind(this)}
						fullWidth
					/>
					
					<Typography variant="body2" style={{marginTop: 10}}>{I18n.t("Answers")}</Typography>
					<Typography variant="caption">{I18n.t("Add as many answers as your mission needs (at least 2).")}</Typography>
					
					<div>
						{this.state.data.singlechoice && this.state.data.singlechoice.answers && this.state.data.singlechoice.answers.map((answer, i) => {
							return <Chip
								key={i}
								label={answer.label}
								onClick={() => this.setState({ singleChoiceAnswerDialogOpen: true, singleChoiceAnswerDialogEdit: i })}
								onDelete={() => this._removeSingleChoiceAnswer(i)}
								style={{marginRight: 5}}
							/>;
						})}
						<Tooltip title={I18n.t("Add a new answer")}>
							<IconButton onClick={() => this.setState({ singleChoiceAnswerDialogOpen: true, singleChoiceAnswerDialogEdit: null })}>
								<PlusCircle />
							</IconButton>
						</Tooltip>
					</div>
					
					<SingleChoiceAnswerDialog
						open={this.state.singleChoiceAnswerDialogOpen}
						data={
							this.state.singleChoiceAnswerDialogEdit !== null
							&& this.state.data.singlechoice.answers
							&& this.state.data.singlechoice.answers[this.state.singleChoiceAnswerDialogEdit]
						}
						onClose={() => this.setState({ singleChoiceAnswerDialogOpen: false })}
						onCreate={d => this._addSingleChoiceAnswer(d)}
					/>
				</ExpansionPanelDetails>
			</ExpansionPanel>
			
			<ExpansionPanel expanded={this.state.editor === "disabled"} onChange={() => this._changeEditor("disabled")} style={{marginBottom: 10}}>
				<ExpansionPanelSummary expandIcon={<ChevronDown />}>
					<Typography variant="body2">{I18n.t("Disabled")}</Typography>
				</ExpansionPanelSummary>
				
				<ExpansionPanelDetails style={{display: "block"}}>
					<Typography variant="body1">{I18n.t("Appropriate when the mission can't be solved easily. Also makes mission unavailable on smartphones.")}</Typography>
				</ExpansionPanelDetails>
			</ExpansionPanel>
		</div>;
	}
	
	componentWillMount() {
		if(this.props.data) {
			this.setState(this.props.data);
		}
	}
	
	componentWillUpdate(nextProps, nextState) {
		//Notify parent of changes if necessary
		if(Hash(this.state) !== Hash(nextState)) {
			this.props.onChange(nextState);
		}
	}
}

export default NewMissionEditorsComponent;
