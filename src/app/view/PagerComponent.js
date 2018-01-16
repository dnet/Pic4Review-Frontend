import React, { Component } from 'react';
import { ChevronLeft, ChevronRight } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import MobileStepper from 'material-ui/MobileStepper';

/**
 * Pager component allows to browse through pages.
 */
class PagerComponent extends Component {
	_prev() {
		this.props.onChange(this.props.page-1);
	}
	
	_next() {
		this.props.onChange(this.props.page+1);
	}
	
	render() {
		return <MobileStepper
			type="text"
			steps={100}
			position="static"
			activeStep={this.props.page}
			nextButton={
				<Button dense onClick={this._next.bind(this)} disabled={this.props.isLast}>
					{I18n.t("Next")}
					<ChevronRight />
				</Button>
			}
			backButton={
				<Button dense onClick={this._prev.bind(this)} disabled={this.props.page === 1}>
					<ChevronLeft />
					{I18n.t("Back")}
				</Button>
			}
        />;
	}
}

export default PagerComponent;
