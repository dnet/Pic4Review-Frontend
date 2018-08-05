import React, { Component } from 'react';
import { ContentDuplicate, Eye, EyeOff, Information, Pencil } from 'mdi-material-ui';
import IconButton from 'material-ui/IconButton';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from 'material-ui/Table';

class MissionsTableComponent extends Component {
	render() {
		const style = { margin: 0, padding: 0 };
		const styleCentered = Object.assign({}, style, { textAlign: "center" });
		
		return <Paper>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell style={styleCentered}>#</TableCell>
						<TableCell style={style}>{I18n.t("Name")}</TableCell>
						<TableCell style={style}>{I18n.t("Area")}</TableCell>
						<TableCell style={styleCentered}>{I18n.t("Completion")}</TableCell>
						<TableCell style={styleCentered}>{I18n.t("Actions")}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
				{this.props.missions.map(m => {
					const completion = Math.floor(100 - (m.options.stats.new / m.options.stats.total)*100);
					const backcolor = m.status === "online" ? (completion < 100 ? "#C8F7C5" : "#F5D76E") : "#DADFE1";
					
					return <TableRow key={m.id} style={{backgroundColor: backcolor}}>
						<TableCell style={styleCentered}>{m.id}</TableCell>
						<TableCell style={style}>{m.description.short}</TableCell>
						<TableCell style={style}>{m.area.name}</TableCell>
						<TableCell style={styleCentered}>
							{completion+"%"}
						</TableCell>
						<TableCell style={styleCentered}>
							<IconButton
								component={Link}
								to={'/mission/'+m.id}
								target="_blank"
							>
								<Information />
							</IconButton>
							<IconButton
								component={Link}
								to={'/mission/new/'+m.id}
								target="_blank"
							>
								<ContentDuplicate />
							</IconButton>
							<IconButton
								component={Link}
								to={'/mission/'+m.id+'/edit'}
								target="_blank"
							>
								<Pencil />
							</IconButton>
							{m.status === "online" &&
								<IconButton onClick={() => this._setMissionStatus(m, "canceled")}>
									<EyeOff />
								</IconButton>
							}
							{m.status !== "online" &&
								<IconButton onClick={() => this._setMissionStatus(m, "online")}>
									<Eye />
								</IconButton>
							}
						</TableCell>
					</TableRow>;
				})}
				</TableBody>
			</Table>
		</Paper>;
	}
}

export default MissionsTableComponent;
