/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import helloWorldController from './controller';

export default () => {
    page( '/hello-world/:domain?', controller.siteSelection, controller.navigation, helloWorldController.helloWorld );
};
