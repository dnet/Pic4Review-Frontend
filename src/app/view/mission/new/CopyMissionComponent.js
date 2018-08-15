import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { ContentDuplicate } from 'mdi-material-ui';
import API from '../../../ctrl/API';
import Button from 'material-ui/Button';
import Geosearch from '../../GeosearchComponent';
import Grid from 'material-ui/Grid';
import IconGridSelect from '../../IconGridSelectComponent';
import SelectList from '../../SelectListComponent';
import Typography from 'material-ui/Typography';
import Wait from '../../WaitComponent';

const styles = theme => {
	return {
		button: { width: "100%" }
	};
};

/**
 * CopyMissionComponent allows to create a new mission using a template.
 */
class CopyMissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			theme: null,
			mission: null,
			place: null,
			missions: null
		};
	}
	
	render() {
		let missions = null;
		
		if(this.state.missions) {
			missions = this.state.missions.filter(m => this.state.theme === null || this.state.theme === m.theme);
		}
		
		return this.state.missions ? <div>
			<Grid container spacing={16}>
				<Grid item xs={12} lg={6}>
					<Typography variant="subheading">{I18n.t("Choose a mission")}</Typography>
					<IconGridSelect
						cols={12}
						items={THEMES}
						value={this.state.theme}
						onChange={id => this.setState({ theme: id })}
					/>
					
					{missions && missions.length > 0 ?
						<SelectList
							entries={missions}
							onSelect={m => this.setState({ mission: m })}
						/>
						: <Typography variant="body1" style={{textAlign: "center"}}>{I18n.t("There is no template for this theme")}</Typography>
					}
				</Grid>
				
				<Grid item xs={12} lg={6}>
					<Typography variant="subheading">{I18n.t("Choose an area")}</Typography>
					<Geosearch
						onSelect={r => this.setState({ place: r })}
					/>
				</Grid>
			</Grid>
			
			<Grid container spacing={8} alignItems="center" justify="center" style={{marginTop: 10}}>
				<Grid item xs={12} sm={6} md={4} lg={3}>
					<Button variant="raised" color="primary" className={this.props.classes.button}>
						{I18n.t("Create")}
					</Button>
				</Grid>
				<Grid item xs={12} sm={6} md={4} lg={3}>
					<Button variant="raised" className={this.props.classes.button}>
						{I18n.t("Cancel")}
					</Button>
				</Grid>
			</Grid>
		</div> : <Wait />;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Create mission"), subtitle: I18n.t("Using a template") });
		
		API.GetMissionsTemplates()
		.then(templates => {
			const entries = templates.map(t => {
				return {
					title: t.shortdesc,
					subtitle: t.fulldesc,
					icon: THEMES[t.theme] ? THEMES[t.theme].icon : THEMES.other.icon,
					id: t.id,
					theme: t.theme
				};
			});
			
			this.setState({ missions: entries });
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching templates")+" "+e.message });
		});
	}
}

export default withStyles(styles)(CopyMissionComponent);
