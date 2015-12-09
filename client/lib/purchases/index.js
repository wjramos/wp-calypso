/**
 * External dependencies
 */
import find from 'lodash/collection/find';
import includes from 'lodash/collection/includes';
import moment from 'moment';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import { isDomainMapping, isDomainRegistration, isTheme, isPlan } from 'lib/products-values';

/**
 * Returns an array of sites objects, each of which contains an array of purchases.
 *
 * @param {array} purchases An array of purchase objects.
 * @param {array} sites An array of site objects
 * @return {array} An array of sites with purchases attached.
 */
function getPurchasesBySite( purchases, sites ) {
	return purchases.reduce( ( result, currentValue ) => {
		const site = find( result, { id: currentValue.siteId } );
		if ( site ) {
			site.purchases = site.purchases.concat( currentValue );
		} else {
			const siteObject = find( sites, { ID: currentValue.siteId } );

			result = result.concat( {
				domain: currentValue.domain,
				id: currentValue.siteId,
				name: currentValue.siteName,
				/* if the purchase is attached to a deleted site,
				 * there will be no site with this ID in `sites`, so
				 * we fall back on the domain. */
				slug: siteObject ? siteObject.slug : currentValue.domain,
				title: currentValue.siteName ? currentValue.siteName : currentValue.domain,
				purchases: [ currentValue ]
			} );
		}

		return result;
	}, [] );
}

function getName( purchase ) {
	if ( isDomainRegistration( purchase ) ) {
		return purchase.meta;
	}

	return purchase.productName;
}

function getSubscriptionEndDate( purchase ) {
	return purchase.expiryMoment.format( 'LL' );
}

function hasPaymentMethod( purchase ) {
	return isPaidWithPaypal( purchase ) || isPaidWithCreditCard( purchase );
}

function hasPrivateRegistration( purchase ) {
	return purchase.hasPrivateRegistration;
}

/**
 * Checks if a purchase can be cancelled.
 * Returns true for purchases that aren't expired
 * Also returns true for purchases whether or not they are after the refund period.
 * Purchases included with a plan can't be cancelled.
 *
 * @param {Object} purchase
 * @return {boolean}
 */
function isCancelable( purchase ) {
	if ( isIncludedWithPlan( purchase ) ) {
		return false;
	}

	if ( isExpired( purchase ) ) {
		return false;
	}

	if ( isRefundable( purchase ) ) {
		return true;
	}

	return purchase.canDisableAutoRenew;
}

function isExpired( purchase ) {
	return 'expired' === purchase.expiryStatus;
}

function isExpiring( purchase ) {
	return includes( [
		'cardExpired',
		'cardExpiring',
		'manualRenew',
		'expiring'
	], purchase.expiryStatus );
}

function isIncludedWithPlan( purchase ) {
	return 'included' === purchase.expiryStatus;
}

function isOneTimePurchase( purchase ) {
	return 'oneTimePurchase' === purchase.expiryStatus;
}

function isPaidWithPaypal( purchase ) {
	return 'paypal' === purchase.payment.type;
}

function isRedeemable( purchase ) {
	return purchase.isRedeemable;
}

/**
 * Checks if a purchase can be canceled and refunded.
 * Purchases usually can be refunded up to 30 days after purchase.
 * Domains and domain mappings can be refunded up to 48 hours.
 * Purchases included with plan can't be refunded.
 *
 * @param {Object} purchase
 * @return {boolean}
 */
function isRefundable( purchase ) {
	return purchase.isRefundable;
}

/**
 * Checks if an expired purchase can be removed from a user account.
 * Only domains and domain mappings can be removed.
 * Purchases included with plan can't be removed.
 *
 * @param {Object} purchase
 * @return {boolean}
 */
function isRemovable( purchase ) {
	if ( isIncludedWithPlan( purchase ) ) {
		return false;
	}

	return (
		( isDomainRegistration( purchase ) || isDomainMapping( purchase ) ) &&
		isExpired( purchase )
	);
}

function isRenewable( purchase ) {
	return purchase.isRenewable;
}

function isRenewing( purchase ) {
	return includes( [ 'active', 'autoRenewing' ], purchase.expiryStatus );
}

function isPaidWithCreditCard( purchase ) {
	return 'credit_card' === purchase.payment.type && hasCreditCardData( purchase );
}

function hasCreditCardData( purchase ) {
	return Boolean( purchase.payment.creditCard.expiryMoment );
}

function creditCardExpiresBeforeSubscription( purchase ) {
	return isPaidWithCreditCard( purchase ) && hasCreditCardData( purchase ) && purchase.payment.creditCard.expiryMoment.diff( purchase.expiryMoment, 'months' ) < 0;
}

function monthsUntilCardExpires( purchase ) {
	return purchase.payment.creditCard.expiryMoment.diff( moment(), 'months' );
}

function paymentLogoType( purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		return purchase.payment.creditCard.type;
	}

	if ( isPaidWithPaypal( purchase ) ) {
		return 'paypal';
	}

	return null;
}

function purchaseType( purchase ) {
	if ( isTheme( purchase ) ) {
		return i18n.translate( 'Premium Theme' );
	}

	if ( isPlan( purchase ) ) {
		return i18n.translate( 'Site Plan' );
	}

	if ( isDomainRegistration( purchase ) ) {
		return purchase.productName;
	}

	if ( purchase.meta ) {
		return purchase.meta;
	}

	return null;
}

function showCreditCardExpiringWarning( purchase ) {
	return ! isIncludedWithPlan( purchase ) &&
		isPaidWithCreditCard( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase ) &&
		monthsUntilCardExpires( purchase ) < 3;
}

function showEditPaymentDetails( purchase ) {
	return ! isExpired( purchase ) && ! isOneTimePurchase( purchase ) && ! isIncludedWithPlan( purchase ) && isPaidWithCreditCard( purchase );
}

export {
	creditCardExpiresBeforeSubscription,
	getName,
	getPurchasesBySite,
	getSubscriptionEndDate,
	hasPaymentMethod,
	hasPrivateRegistration,
	isCancelable,
	isPaidWithCreditCard,
	isPaidWithPaypal,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRedeemable,
	isRefundable,
	isRemovable,
	isRenewable,
	isRenewing,
	paymentLogoType,
	purchaseType,
	showCreditCardExpiringWarning,
	showEditPaymentDetails
}
