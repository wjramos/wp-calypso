/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_TOKEN_SET,
	SUPPORT_USER_RESTORE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	supportUser,
	supportToken,
} from '../reducer';

describe( '#supportUser()', () => {
	it( 'should set supportUser to the username', () => {
		const state = supportUser( null, {
			type: SUPPORT_USER_TOKEN_SET,
			supportUser: 'notarealuser',
			supportToken: 'notarealtoken'
		} );

		expect( state ).to.equal( 'notarealuser' );
	} );

	it( 'should clear supportUser when restoring', () => {
		const state = supportUser( null, {
			type: SUPPORT_USER_RESTORE
		} );

		expect( state ).to.equal( '' );
	} );

	it( 'should never persist state', () => {
		const state = supportUser( 'notarealtoken', {
			type: SERIALIZE
		} );
		expect( state ).to.equal( '' );
	} );

	it( 'should never load persisted state', () => {
		const state = supportUser( 'notarealtoken', {
			type: DESERIALIZE
		} );
		expect( state ).to.equal( '' );
	} );
} );

describe( '#supportToken()', () => {
	it( 'should set supportToken to the token', () => {
		const state = supportToken( null, {
			type: SUPPORT_USER_TOKEN_SET,
			supportUser: 'notarealuser',
			supportToken: 'notarealtoken'
		} );

		expect( state ).to.equal( 'notarealtoken' );
	} );

	it( 'should clear supportToken when restoring', () => {
		const state = supportToken( null, {
			type: SUPPORT_USER_RESTORE
		} );

		expect( state ).to.equal( '' );
	} );

	it( 'should never persist state', () => {
		const state = supportToken( 'notarealtoken', {
			type: SERIALIZE
		} );
		expect( state ).to.equal( '' );
	} );

	it( 'should never load persisted state', () => {
		const state = supportToken( 'notarealtoken', {
			type: DESERIALIZE
		} );
		expect( state ).to.equal( '' );
	} );
} );
