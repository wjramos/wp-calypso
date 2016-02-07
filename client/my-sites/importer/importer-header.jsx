/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import includes from 'lodash/collection/includes';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import { appStates } from 'lib/importer/constants';
import { cancelImport, resetImport, startImport } from 'lib/importer/actions';
import ImporterIcon from './importer-icons';

/**
 * Module variables
 */
const startStates = [ appStates.DISABLED, appStates.INACTIVE ],
	cancelStates = [
		appStates.MAP_AUTHORS,
		appStates.READY_FOR_UPLOAD,
		appStates.UPLOAD_FAILURE,
		appStates.UPLOAD_SUCCESS,
		appStates.UPLOADING
	],
	stopStates = [ appStates.IMPORT_FAILURE, appStates.IMPORTING ],
	doneStates = [ appStates.IMPORT_SUCCESS ];

export default React.createClass( {
	displayName: 'ImporterHeader',

	mixins: [ PureRenderMixin ],

	propTypes: {
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired
		} ),
		description: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired
	},

	controlButtonClicked: function() {
		const { importerStatus: { importerId, importerState, type }, site: { ID: siteId } } = this.props;

		if ( includes( [ ...cancelStates, ...stopStates ], importerState ) ) {
			cancelImport( siteId, importerId );
		} else if ( includes( startStates, importerState ) ) {
			startImport( siteId, type );
		} else if ( includes( doneStates, importerState ) ) {
			resetImport( siteId, importerId );
		}
	},

	getButtonText: function() {
		const { importerState } = this.props.importerStatus;

		if ( includes( startStates, importerState ) ) {
			return this.translate( 'Start Import', { context: 'verb' } );
		}

		if ( includes( cancelStates, importerState ) ) {
			return this.translate( 'Cancel', { context: 'verb' } );
		}

		if ( includes( stopStates, importerState ) ) {
			return this.translate( 'Stop Import', { context: 'verb' } );
		}

		if ( includes( doneStates, importerState ) ) {
			return this.translate( 'Done', { context: 'adjective' } );
		}
	},

	render: function() {
		const { importerStatus: { importerState }, icon, isEnabled, title, description } = this.props;
		const isPrimary = includes( [ ...cancelStates, ...stopStates ], importerState );
		const canCancel = isEnabled && ! includes( [ appStates.UPLOADING ], importerState );

		return (
			<header className="importer-service">
				<ImporterIcon {...{ icon } } />
				<Button
					className="importer__master-control"
					disabled={ ! canCancel }
					isPrimary={ isPrimary }
					onClick={ this.controlButtonClicked }
				>
					{ this.getButtonText() }
				</Button>
				<div className="importer__service-info">
					<h1 className="importer__service-title">{ title }</h1>
					<p>{ description }</p>
				</div>
			</header>
		);
	}
} );
