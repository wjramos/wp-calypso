/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' );

var PostExcerpt = React.createClass( {

	render: function() {
		var text = this.props.text,
			textClass = [ 'post-excerpt__text' ];

		if ( ! text ) {
			return null;
		}

		if ( text.length > 80 ) {
			textClass.push( 'is-long' );
		}

		textClass = textClass.join( ' ' );

		return (
			<div className={ classnames( this.props.className, 'post-excerpt' ) }>
				<p className={ textClass }>{ text }</p>
			</div>
		);
	}
} );

module.exports = PostExcerpt;
