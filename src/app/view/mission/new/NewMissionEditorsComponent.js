import React, { Component } from 'react';
import { ChevronDown, PlusCircle } from 'mdi-material-ui';
import Chip from 'material-ui/Chip';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import Grid from 'material-ui/Grid';
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
			singleChoiceAnswerDialogOpen: true,
			data: {
				singlechoice: {
					question: "À quoi ressemble l'équipement incendie ?",
					type: "images",
					answers: [
						{ label: "Borne", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Downtown_Charlottesville_fire_hydrant_1.jpg/150px-Downtown_Charlottesville_fire_hydrant_1.jpg" },
						{ label: "Plaque", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Berlin_hydrant_20050211_p1000517.jpg/200px-Berlin_hydrant_20050211_p1000517.jpg" },
						{ label: "Tuyau", image: "https://wiki.openstreetmap.org/w/images/thumb/3/33/Hydrants_20130326_112938.JPG/150px-Hydrants_20130326_112938.JPG" },
						{ label: "Mural", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Guentherscheid_Tunnel_Rescue4.jpg/225px-Guentherscheid_Tunnel_Rescue4.jpg" }
					]
				}
			}
		};
	}
	
	/**
	 * Change the used editor
	 * @private
	 */
	_changeEditor(id) {
		//TODO
		//this.props.onChange(d);
		this.setState({ editor: id });
	}
	
	_removeSingleChoiceAnswer(id) {
		const newData = Object.assign({}, this.state.data);
		newData.singlechoice.answers.splice(id, 1);
		this.setState({ data: newData });
	}
	
	render() {
		//Pour faciliter la résolution de la mission, il est conseillé de créer une question à laquelle les utilisateurs peuvent répondre simplement. Cela rend possible la contribution sur téléphone, et fait gagner du temps sur la version bureau. Mais selon les missions, la résolution ne peut se résumer à une simple question, dans ce cas il faut passer sur un éditeur OSM traditionnel.
		return <div>
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
// 						onChange={this.handleChange('name')}
						fullWidth
					/>
					
					<Typography variant="body2" style={{marginTop: 10}}>{I18n.t("Answers")}</Typography>
					<Typography variant="caption">{I18n.t("Add as many answers as your mission needs (at least 2).")}</Typography>
					
					<div>
						{this.state.data.singlechoice && this.state.data.singlechoice.answers && this.state.data.singlechoice.answers.map((answer, i) => {
							return <Chip
								key={i}
								label={answer.label}
// 								onClick={}
								onDelete={() => this._removeSingleChoiceAnswer(i)}
								style={{marginRight: 5}}
							/>;
						})}
						<Tooltip title={I18n.t("Add a new answer")}>
							<IconButton onClick={() => this.setState({ singleChoiceAnswerDialogOpen: true })}>
								<PlusCircle />
							</IconButton>
						</Tooltip>
					</div>
					
					<SingleChoiceAnswerDialog open={this.state.singleChoiceAnswerDialogOpen} onClose={() => this.setState({ singleChoiceAnswerDialogOpen: false })} />
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
	
	componentDidMount() {
//		this._changeVal("areaname", res.join(", "));
	}
}

export default NewMissionEditorsComponent;
