import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { ContentDuplicate } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Geosearch from '../../GeosearchComponent';
import Grid from 'material-ui/Grid';
import IconGridSelect from '../../IconGridSelectComponent';
import SelectList from '../../SelectListComponent';
import Typography from 'material-ui/Typography';

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
			place: null
		};
	}
	
	render() {
		const missions = [
			{ title: "Bus stop type", subtitle: "These objects doesn't have a shelter=* tag, if you can see it please add this information using pictures", icon: <ContentDuplicate /> },
			{ title: "Bus stop type", subtitle: "These objects doesn't have a shelter=* tag, if you can see it please add this information using pictures", icon: <ContentDuplicate /> },
			{ title: "Bus stop type", subtitle: "These objects doesn't have a shelter=* tag, if you can see it please add this information using pictures", icon: <ContentDuplicate /> },
			{ title: "Bus stop type", subtitle: "These objects doesn't have a shelter=* tag, if you can see it please add this information using pictures", icon: <ContentDuplicate /> },
			{ title: "Bus stop type", subtitle: "These objects doesn't have a shelter=* tag, if you can see it please add this information using pictures", icon: <ContentDuplicate /> }
		];
		
		console.log(this.state);
		
		return <div>
			<Grid container spacing={16}>
				<Grid item xs={12} lg={6}>
					<Typography variant="subheading">{I18n.t("Choose a mission")}</Typography>
					<IconGridSelect
						cols={12}
						items={THEMES}
						value={this.state.theme}
						onChange={id => this.setState({ theme: id })}
					/>
					
					<SelectList
						entries={missions}
						onSelect={m => this.setState({ mission: m })}
					/>
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
		</div>;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Create mission"), subtitle: I18n.t("Using a template") });
	}
}

export default withStyles(styles)(CopyMissionComponent);
