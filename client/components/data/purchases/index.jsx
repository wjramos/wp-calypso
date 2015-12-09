/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { fetchUserPurchases } from 'lib/upgrades/actions';
import observe from 'lib/mixins/data-observe';
import PurchasesStore from 'lib/purchases/store';
import StoreConnection from 'components/data/store-connection';
import userFactory from 'lib/user';

/**
 * Module variables
 */
const stores = [ PurchasesStore ],
	user = userFactory();

function getStateFromStores( props ) {
	return {
		noticeType: props.noticeType,
		purchases: PurchasesStore.getByUser( user.get().ID ),
		sites: props.sites
	};
}

const PurchasesData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired,
		noticeType: React.PropTypes.string,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentDidMount() {
		fetchUserPurchases();
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				noticeType={ this.props.noticeType }
				sites={ this.props.sites }
				stores={ stores }
				getStateFromStores={ getStateFromStores } />
		);
	}
} );

export default PurchasesData;
