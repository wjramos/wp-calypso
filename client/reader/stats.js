import { mc, ga, tracks } from 'analytics';

export function recordAction( action ) {
	mc.bumpStat( 'reader_actions', action );
}

export function recordGaEvent( action, label, value ) {
	ga.recordEvent( 'Reader', action, label, value );
}

export function recordPermalinkClick( where ) {
	mc.bumpStat( {
		reader_actions: 'visited_post_permalink',
		reader_permalink_source: where
	} );
}

function getLocation() {
	if ( typeof window === 'undefined' ) {
		return 'unknown';
	}

	let path = window.location.pathname;
	if ( path === '/' ) {
		return 'following';
	}
	if ( path.indexOf( '/tag/' ) === 0 ) {
		return 'topic_page';
	}
	if ( path.indexOf( '/read/blog/' ) === 0 ) {
		return 'blog_page';
	}
	if ( path.indexOf( '/read/post/' ) === 0 ) {
		return 'single_post';
	}
	if ( path.indexOf( '/read/list/' ) === 0 ) {
		return 'list';
	}
	if ( path.indexOf( '/activities/likes' ) === 0 ) {
		return 'postlike';
	}
	if ( path.indexOf( '/recommendations/mine' ) === 0 ) {
		return 'recommended_foryou';
	}
	if ( path.indexOf( '/recommendations' ) === 0 ) {
		return 'recommended_topics';
	}
	if ( path.indexOf( '/following/edit' ) === 0 ) {
		return 'following_edit';
	}
	return 'unknown';
}

export function recordFollow() {
	mc.bumpStat( 'reader_follows', getLocation() );
	tracks.recordEvent( 'calypso_reader_site_followed' );
}

export function recordUnfollow() {
	mc.bumpStat( 'reader_unfollows', getLocation() );
	tracks.recordEvent( 'calypso_reader_site_unfollowed' );
}

export function recordTrack( eventName, eventProperties ) {
	tracks.recordEvent( eventName, eventProperties );
}
