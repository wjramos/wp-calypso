/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:user:utilities' ),
	config = require( 'config' );

/**
 * Internal dependencies
 */
var user = require( 'lib/user' )();

var userUtils = {
	getLogoutUrl: function() {
		var url = '/logout',
			userData = user.get(),
			subdomain = '';

		// If logout_URL isn't set, then go ahead and return the logout URL
		// without a proper nonce as a fallback.
		// Note: we never want to use logout_URL in the desktop app
		if ( ! userData.logout_URL || config.isEnabled( 'always_use_logout_url' ) ) {
			// Use localized version of the homepage in the redirect
			if ( userData.localeSlug && userData.localeSlug !== '' && userData.localeSlug !== 'en' ) {
				subdomain = userData.localeSlug + '.';
			}

			url = config( 'logout_url' ).replace( '|subdomain|', subdomain );
		} else {
			url = userData.logout_URL;
		}

		debug( 'Logout Url: ' + url );

		return url;
	},

	logout: function() {
		var logoutUrl = userUtils.getLogoutUrl();

		// Clear any data stored locally within the user data module or localStorage
		user.clear();
		debug( 'User stored data cleared' );

		// Forward user to WordPress.com to be logged out
		location.href = logoutUrl;
	},

	getLocaleSlug: function() {
		return user.get().localeSlug;
	}
};

module.exports = userUtils;
