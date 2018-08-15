import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Hash from 'object-hash';
import { ListItemText, ListItemIcon } from 'material-ui/List';
import { MenuList, MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';

const styles = theme => {
	const selected = {
		backgroundColor: theme.palette.primary.main,
		'& $primary, & $icon, & $secondary': {
			color: theme.palette.common.white,
		}
	};
	
	return {
		menuItem: {
			'&:focus': selected
		},
		menuSelected: { ...selected, '&:hover': selected },
		listItemText: {
			paddingLeft: 0
		},
		primary: {},
		secondary: {},
		icon: {},
		button: { width: "100%" }
	};
};

/**
 * SelectListComponent is a list with single selectable entry.
 */
class SelectListComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			selected: null
		};
	}
	
	onClick(id) {
		this.setState({ selected: id });
		if(this.props.onSelect) {
			this.props.onSelect(this.props.entries[id]);
		}
	}
	
	componentDidMount() {
		if(this.props.entries.length === 1) {
			this.setState({ selected: 0 });
			this.props.onSelect(this.props.entries[0]);
		}
	}
	
	componentDidUpdate() {
		if(this.props.entries.length === 1 && this.state.selected !== 0) {
			this.setState({ selected: 0 });
			this.props.onSelect(this.props.entries[0]);
		}
	}
	
	componentWillReceiveProps(nextProps) {
		if(
			nextProps.entries && this.props.entries
			&& (nextProps.entries.length != this.props.entries.length || Hash(this.props.entries) !== Hash(nextProps.entries))
		) {
			this.setState({ selected: null });
		}
	}
	
	render() {
		return <Paper>
			<MenuList>
				{this.props.entries.map((m,i) => {
					return <MenuItem
						key={i}
						className={this.state.selected === i ? this.props.classes.menuSelected : this.props.classes.menuItem}
						onClick={() => this.onClick(i)}
					>
						<ListItemIcon className={this.props.classes.icon}>
							{m.icon}
						</ListItemIcon>
						
						<ListItemText
							primary={m.title}
							secondary={m.subtitle}
							className={this.props.classes.listItemText}
							classes={{ primary: this.props.classes.primary, secondary: this.props.classes.secondary }}
						/>
					</MenuItem>
				})}
			</MenuList>
		</Paper>;
	}
}

export default withStyles(styles)(SelectListComponent);
