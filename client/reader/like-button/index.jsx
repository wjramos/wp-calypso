var React = require( 'react' );

var LikeButtonContainer = require( 'components/like-button' ),
	stats = require( 'reader/stats' );

var ReaderLikeButton = React.createClass( {

	recordLikeToggle: function( liked ) {
		stats.recordAction( liked ? 'liked_post' : 'unliked_post' );
		stats.recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		stats.recordTrack( liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked' );
	},

	render: function() {
		return (
			<LikeButtonContainer { ...this.props } onLikeToggle={ this.recordLikeToggle } />
		);
	}

} );

module.exports = ReaderLikeButton;
