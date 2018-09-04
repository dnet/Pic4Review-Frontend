import React, { Component } from 'react';
import { ContentDuplicate, Eye, EyeOff, Information, Pencil, Star, StarOutline } from 'mdi-material-ui';
import { HorizontalBar } from 'react-chartjs-2';
import IconButton from 'material-ui/IconButton';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from 'material-ui/Table';
import Tooltip from 'material-ui/Tooltip';

class MissionsTableComponent extends Component {
	render() {
		const style = { margin: 0, padding: 0 };
		const styleCentered = Object.assign({}, style, { textAlign: "center" });
		const styleId = Object.assign({}, styleCentered, { paddingRight: 10, paddingLeft: 10 });
		
		return <Paper>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell style={styleId}>#</TableCell>
						<TableCell style={style}>{I18n.t("Name")}</TableCell>
						<TableCell style={styleCentered}>{I18n.t("Completion")}</TableCell>
						<TableCell style={styleCentered}>{I18n.t("Actions")}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
				{this.props.missions.map(m => {
					const completion = (m.options && m.options.stats) ? Math.floor(100 - (m.options.stats.new / m.options.stats.total)*100) : 0;
					const backcolor = m.status === "online" ? (completion < 100 ? "white" : "#FFECB3") : "#E0E0E0";
					
					//Prepare dataset
					const statusesKeys = (m.options && m.options.stats) ? Object.keys(m.options.stats).filter(s => STATUSES[s]) : [];
					statusesKeys.sort((a, b) => STATUSES[a].priority - STATUSES[b].priority);
					
					return <TableRow key={m.id} style={{backgroundColor: backcolor}}>
						<TableCell style={styleId}>{m.id}</TableCell>
						<TableCell style={style}>{m.description.short}<br />{m.area.name}</TableCell>
						<TableCell style={styleCentered}>
							{statusesKeys.map(s => {
								const mylength = Math.round(m.options.stats[s]*100/m.options.stats.total/2)+"%";
								return <span key={s} title={STATUSES[s].name+" : "+m.options.stats[s]} style={{backgroundColor: STATUSES[s].color, height: 15, paddingLeft: mylength, paddingRight: mylength }}> </span>;
							})}
						</TableCell>
						<TableCell style={styleCentered}>
							<Tooltip title={I18n.t("See mission details")}>
								<IconButton
									component={Link}
									to={'/mission/'+m.id}
									target="_blank"
								>
									<Information />
								</IconButton>
							</Tooltip>
							<Tooltip title={I18n.t("Duplicate mission")}>
								<IconButton
									component={Link}
									to={'/mission/new/'+m.id}
									target="_blank"
								>
									<ContentDuplicate />
								</IconButton>
							</Tooltip>
							<Tooltip title={I18n.t("Edit mission")}>
								<IconButton
									component={Link}
									to={'/mission/'+m.id+'/edit'}
									target="_blank"
								>
									<Pencil />
								</IconButton>
							</Tooltip>
							{m.status === "online" &&
								<Tooltip title={I18n.t("Hide mission from public list")}>
									<IconButton onClick={() => this.props.onChangeMissionStatus(m, "canceled")}>
										<Eye />
									</IconButton>
								</Tooltip>
							}
							{m.status !== "online" &&
								<Tooltip title={I18n.t("Show mission in public list")}>
									<IconButton onClick={() => this.props.onChangeMissionStatus(m, "online")}>
										<EyeOff />
									</IconButton>
								</Tooltip>
							}
							{this.props.admin && m.options.template &&
								<Tooltip title={I18n.t("Remove this mission from template list")}>
									<IconButton onClick={() => this.props.onSetTemplate(m, false)}>
										<Star />
									</IconButton>
								</Tooltip>
							}
							{this.props.admin && !m.options.template &&
								<Tooltip title={I18n.t("Set this mission as a template")}>
									<IconButton onClick={() => this.props.onSetTemplate(m, true)}>
										<StarOutline />
									</IconButton>
								</Tooltip>
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
