/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import { fetchConnections } from 'state/sharing/publicize/actions';
import { getSiteUserConnections, hasFetchedConnections } from 'state/sharing/publicize/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import EditorSharingAccordion from './accordion';

class EditorSharingContainer extends Component {
	constructor( props ) {
		super( props );

		// Set state
		this.state = this.getState();

		// Bind legacy store update handler
		this.boundUpdateState = this.updateState.bind( this );
		PostEditStore.on( 'change', this.boundUpdateState );
	}

	componentDidMount() {
		this.ensureHasConnections();
	}

	componentDidUpdate() {
		this.ensureHasConnections();
	}

	componentWillUnmount() {
		PostEditStore.off( 'change', this.boundUpdateState );
	}

	ensureHasConnections() {
		if ( this.props.hasFetchedConnections ) {
			return;
		}

		this.fetchConnections();
	}

	updateState() {
		this.setState( this.getState() );
	}

	getState() {
		return {
			post: PostEditStore.get(),
			isNew: PostEditStore.isNew()
		};
	}

	fetchConnections() {
		const { site, dispatch } = this.props;
		if ( ! site ) {
			return;
		}

		dispatch( fetchConnections( site.ID ) );
	}

	render() {
		const { site, connections } = this.props;
		const { post, isNew } = this.state;

		return (
			<EditorSharingAccordion
				site={ site }
				post={ post }
				isNew={ isNew }
				connections={ connections }
				fetchConnections={ this.fetchConnections.bind( this ) }
				className="editor-drawer__accordion" />
		);
	}
}

EditorSharingContainer.propTypes = {
	site: PropTypes.object,
	dispatch: PropTypes.func.isRequired,
	hasFetchedConnections: PropTypes.bool,
	connections: PropTypes.array
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const user = getCurrentUser( state );

	return {
		hasFetchedConnections: site && hasFetchedConnections( state, site.ID ),
		connections: site && user ? getSiteUserConnections( state, site.ID, user.ID ) : null,
		site
	};
} )( EditorSharingContainer );
