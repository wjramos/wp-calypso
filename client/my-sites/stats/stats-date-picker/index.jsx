/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

export default React.createClass( {
	displayName: 'StatsDatePicker',

	propTypes: {
		period: PropTypes.string.isRequired,
		date: PropTypes.object.isRequired,
		summary: PropTypes.bool
	},

	dateForDisplay() {
		const date = this.moment( this.props.date );
		let formattedDate;

		switch ( this.props.period ) {
			case 'week':
				formattedDate = this.translate(
					'%(startDate)s - %(endDate)s',
					{
						context: 'Date range for which stats are being displayed',
						args: {
							// LL is a date localized by momentjs
							startDate: date.startOf( 'week' ).add( 1, 'd' ).format( 'LL' ),
							endDate: date.endOf( 'week' ).add( 1, 'd' ).format( 'LL' )
						}
					}
				);
				break;

			case 'month':
				formattedDate = date.format( 'MMMM YYYY' );
				break;

			case 'year':
				formattedDate = date.format( 'YYYY' );
				break;

			default:
				// LL is a date localized by momentjs
				formattedDate = date.format( 'LL' );
		}

		return formattedDate;
	},

	render() {
		const sectionTitle = this.translate( 'Stats for {{period/}}', {
			components: {
				period: <span className="period">
							<span className="date">{ this.dateForDisplay() }</span>
						</span>
			},
			context: 'Stats: Main stats page heading',
			comment: 'Example: "Stats for December 7", "Stats for December 8 - December 14", "Stats for December", "Stats for 2014"'
		} );

		return(
			<div>
				{ this.props.summary
					? <h4 className="module-header-title" key="header-title">{ sectionTitle }</h4>
					: <h3 className="stats-section-title">{ sectionTitle }</h3>
				}
			</div>
		);
	}
} );
