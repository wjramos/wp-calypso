/**
 * External dependencies
 */
import React from 'react/addons'
import classNames from 'classnames'
import i18n from 'lib/mixins/i18n'
import _some from 'lodash/collection/some'

/**
 * Internal dependencies
 */
import analytics from 'analytics'
import Card from 'components/card'
import Gridicon from 'components/gridicon'
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon'
import PluginsActions from 'lib/plugins/actions'
import PluginsLog from 'lib/plugins/log-store'
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle'
import PluginAutoupdateToggle from 'my-sites/plugins/plugin-autoupdate-toggle'
import safeProtocolUrl from 'lib/safe-protocol-url'
import config from 'config'
import Notice from 'notices/notice'
import PluginVersion from 'my-sites/plugins/plugin-version'
import PluginInstallButton from 'my-sites/plugins/plugin-install-button'
import PluginRemoveButton from 'my-sites/plugins/plugin-remove-button'

export default React.createClass( {
	OUT_OF_DATE_YEARS: 2,

	displayName: 'PluginMeta',

	propTypes: {
		siteURL: React.PropTypes.string,
		sites: React.PropTypes.array,
		notices: React.PropTypes.object,
		plugin: React.PropTypes.object.isRequired,
		isPlaceholder: React.PropTypes.bool
	},

	displayBanner() {
		if ( this.props.plugin.banners && ( this.props.plugin.banners.high || this.props.plugin.banners.low ) ) {
			return <div className="plugin-meta__banner">
						<img className="plugin-meta__banner-image" src={ this.props.plugin.banners.high || this.props.plugin.banners.low }/>
					</div>;
		}
	},

	renderActions() {
		const site = this.props.sites && this.props.sites[ 0 ] ? this.props.sites[ 0 ] : false;

		/*
		 * Do not show actions if we are not on a single site view or
		 * if the plugin is not installed on any sites
		 */
		if ( ( ! this.props.siteUrl || ! site ) && this.isInstalledOnSite( this.props.selectedSite ) ) {
			return;
		}

		if ( this.props.isPlaceholder ) {
			return;
		}

		if ( ! this.isInstalledOnSite( this.props.selectedSite ) ) {
			return ( <div className="plugin-meta__actions"> { this.getInstallButton() } </div> );
		}

		return (
			<div className="plugin-meta__actions">
				<PluginActivateToggle plugin={ this.props.plugin } site={ this.props.selectedSite } notices={ this.props.notices } isMock={ this.props.isMock } />
				<PluginAutoupdateToggle plugin={ this.props.plugin } site={ this.props.selectedSite } notices={ this.props.notices } wporg={ this.props.plugin.wporg } isMock={ this.props.isMock } />
				<PluginRemoveButton plugin={ this.props.plugin } site={ this.props.selectedSite } notices={ this.props.notices } isMock={ this.props.isMock } />
				{ this.renderSettingsLink() }
			</div>
		);
	},

	renderSettingsLink() {
		if ( ! this.props.plugin ||
				! this.props.plugin.wp_admin_settings_page_url ||
				! this.props.plugin.active ||
				! this.props.selectedSite ) {
			return;
		}

		const isInProgress = PluginsLog.isInProgressAction( this.props.selectedSite.ID, this.props.plugin.slug, [
			'ACTIVATE_PLUGIN',
			'DEACTIVATE_PLUGIN'
		] );

		if ( isInProgress ) {
			return;
		}

		return (
			<a className="plugin-meta__settings-link"
				href={ this.props.plugin.wp_admin_settings_page_url }
				target="_blank">
				{ this.translate( 'Setup' ) }
				<Gridicon size={ 14 } icon="external" />
			</a>
		);
	},

	renderName() {
		if ( ! this.props.plugin || ! this.props.plugin.name ) {
			return;
		}

		return (
			<div className="plugin-meta__name">{ this.props.plugin.name }</div>
		);
	},

	renderAuthorUrl() {
		if ( ! this.props.plugin || ! ( this.props.plugin.author_url && this.props.plugin.author_name ) ) {
			return;
		}

		return (
			<a className="plugin-meta__author" href={ safeProtocolUrl( this.props.plugin.author_url ) }>
				{ this.props.plugin.author_name }
			</a>
		);
	},

	isInstalledOnSite( site ) {
		return ( this.props.sites &&
			this.props.sites.some( iteratorSite => {
				return site.slug === iteratorSite.slug;
			} )
		);
	},

	getInstallButton() {
		if ( this.hasInstallButton() && config.isEnabled( 'manage/plugins/browser' ) ) {
			return <PluginInstallButton { ...this.props } />;
		}
	},

	isOutOfDate() {
		if ( this.props.plugin.last_updated ) {
			let lastUpdated = this.moment( this.props.plugin.last_updated, 'YYYY-MM-DD' );
			return this.moment().diff( lastUpdated, 'years' ) >= this.OUT_OF_DATE_YEARS;
		}
		return false;
	},

	getVersionWarning() {
		const newVersion = this.getAvailableNewVersion();
		if ( this.isOutOfDate() && ! newVersion ) {
			return <Notice
				className="plugin-meta__version-notice"
				text={ this.translate( 'This plugin hasn\'t been updated in over 2 years. It may no longer be maintained or supported and may have compatibility issues when used with more recent versions of WordPress' ) }
				status="is-warning"
				showDismiss={ false } />;
		} else if ( config.isEnabled( 'manage/plugins/compatibility-warning' ) && ! this.isVersionCompatible() ) {
			return <Notice
				className="plugin-meta__version-notice"
				text={ i18n.translate( 'The new version of this plugin may not be compatible with your version of WordPress' ) }
				status="is-warning"
				showDismiss={ false } />;
		}
	},

	getUpdateWarning() {
		const newVersion = this.getAvailableNewVersion();
		if ( newVersion ) {
			return <Notice
				className="plugin-meta__version-notice"
				text={ i18n.translate( 'A new version is available.' ) }
				status="is-warning"
				button={ i18n.translate( 'Update to %(newPluginVersion)s', { args: { newPluginVersion: newVersion } } ) }
				onClick={ this.handlePluginUpdates }
				showDismiss={ false } />;
		}
	},

	isVersionCompatible() {
		if ( ! this.props.selectedSite ) {
			return true;
		}

		// still not fetched
		if ( ! this.props.plugin.compatibility ) {
			return true;
		}

		if ( ! this.props.plugin.compatibility || this.props.plugin.compatibility.length === 0 ) {
			return false;
		}

		const siteVersion = this.props.selectedSite.options.software_version.split( '-' )[ 0 ];
		return _some( this.props.plugin.compatibility, compatibleVersion => {
			return compatibleVersion.indexOf( siteVersion ) === 0;
		} );
	},

	hasInstallButton() {
		if ( this.props.selectedSite ) {
			return ! this.isInstalledOnSite( this.props.selectedSite ) &&
				this.props.selectedSite.user_can_manage &&
				this.props.selectedSite.jetpack;
		}
	},

	getAvailableNewVersion() {
		if ( ! this.props.selectedSite || ! this.props.sites[ 0 ] ) {
			return;
		}
		if ( ! this.props.sites[ 0 ].canUpdateFiles ) {
			return;
		}
		if ( this.props.sites[ 0 ].plugin && this.props.sites[ 0 ].plugin.update ) {
			if ( 'error' !== this.props.sites[ 0 ].plugin.update ) {
				return this.props.sites[ 0 ].plugin.update.new_version;
			}
		}
	},

	handlePluginUpdates( event ) {
		event.preventDefault();
		PluginsActions.updatePlugin( this.props.sites[ 0 ], this.props.sites[ 0 ].plugin );

		analytics.ga.recordEvent( 'Plugins', 'Clicked Update Selected Site Plugin', 'Plugin Name', this.props.pluginSlug );
		analytics.tracks.recordEvent( 'calypso_plugins_actions_update_plugin', {
			site: this.props.sites[ 0 ].ID,
			plugin: this.props.sites[ 0 ].plugin.slug,
			selectedSite: this.props.sites[ 0 ].ID
		} );
	},

	render() {
		const cardClasses = classNames( 'plugin-meta__information', {
			'has-button': this.hasInstallButton(),
			'has-site': !! this.props.selectedSite,
			'is-placeholder': !! this.props.isPlaceholder
		} );
		const plugin = this.props.selectedSite && this.props.sites[ 0 ] ? this.props.sites[ 0 ].plugin : this.props.plugin;

		return (
			<div>
				<Card className="plugin-meta">
					{ this.displayBanner() }
					<div className={ cardClasses } >
						<div className="plugin-meta__detail">
							<PluginIcon image={ this.props.plugin.icon } isPlaceholder={ this.props.isPlaceholder } />
							{ this.renderName() }
							<div className="plugin-meta__meta">
								{ this.renderAuthorUrl() }
								<PluginVersion plugin={ plugin } site={ this.props.selectedSite } notices={ this.props.notices } />
							</div>
						</div>
						{ this.renderActions() }
					</div>

				</Card>
				{ this.getVersionWarning() }
				{ this.getUpdateWarning() }
			</div>
		);
	}
} );
