/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var HeaderCake = require( 'components/header-cake' );

module.exports = React.createClass( {

	displayName: 'Headers',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/headers">Header Cake</a>
				</h2>
				<HeaderCake onClick={ function() {} }>
					Subsection Header aka Header Cake
				</HeaderCake>
				<p>Clicking header cake returns to previous section.</p>
			</div>
		);
	}
} );
