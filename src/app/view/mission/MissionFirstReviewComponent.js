import React, { Component } from 'react';
import Dialog, { DialogContent } from 'material-ui/Dialog';
import { Link } from 'react-router-dom';
import Typography from 'material-ui/Typography';

/**
 * Mission first review component shows a dialog giving hints about how to review features.
 */
class MissionFirstReviewComponent extends Component {
	render() {
		return <Dialog
			open={this.props.open}
			onClose={this.props.onClose}
		>
			<DialogContent>
				<Typography type="headline">{I18n.t("Welcome !")}</Typography>
				<Typography type="body1">
					{I18n.t("Have we already met ? Anyway, welcome to the review page.")}<br />{I18n.t("Here are some tips for a good start in Pic4Review:")}
				</Typography>
				<ul>
					<li>{I18n.t("You have to check each feature, and add or edit OpenStreetMap according to mission description")} <Link to={'/mission/'+this.props.mid}>{I18n.t("(here)")}</Link></li>
					<li>{I18n.t("When you have added or edited the feature in OpenStreetMap successfully, you can click on \"Done\"")}</li>
					<li>{I18n.t("If you can't see the feature on pictures, don't try to add it on OSM, click on \"Can't see\" instead")}</li>
					<li>{I18n.t("If you are not sure of what to do, click on \"Next\", someone else will review the feature")}</li>
					<li>{I18n.t("Every time you edit a feature, you earn one point !")} <a href="https://upload.wikimedia.org/wikipedia/en/6/61/Pok%C3%A9mon_Theme_Song_-_Sample.ogg" target="_blank">Gotta Catch 'Em all</a></li>
				</ul>
				<Typography type="body1">
					{I18n.t("You're now ready to start ! Good luck 😉")}
				</Typography>
			</DialogContent>
		</Dialog>;
	}
}

export default MissionFirstReviewComponent;
