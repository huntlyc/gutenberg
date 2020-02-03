/**
 * External dependencies
 */
import TestRenderer from 'react-test-renderer';

/**
 * WordPress dependencies
 */
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import RovingTabIndex from '../';
import RovingTabIndexItem from '../item';

const TestButton = forwardRef( ( { ...props }, ref ) => (
	<button { ...props } ref={ ref }></button>
) );

describe( 'RovingTabIndexItem', () => {
	it( 'requires RovingTabIndex to be declared as a parent component somewhere in the component heirarchy', () => {
		expect( () =>
			TestRenderer.create( <RovingTabIndexItem as={ TestButton } /> )
		).toThrow();
		expect( console ).toHaveErrored();
	} );

	it( 'allows another component to be specified as the rendered component using the `as` prop', () => {
		const renderer = TestRenderer.create(
			<RovingTabIndex>
				<RovingTabIndexItem as={ TestButton } />
			</RovingTabIndex>
		);

		expect( renderer.toJSON() ).toMatchSnapshot();
	} );

	it( 'forwards props to the `as` component', () => {
		const renderer = TestRenderer.create(
			<RovingTabIndex>
				<RovingTabIndexItem as={ TestButton } className="my-button">
					Click Me!
				</RovingTabIndexItem>
			</RovingTabIndex>
		);

		expect( renderer.toJSON() ).toMatchSnapshot();
	} );

	it( 'allows children to bue declared using a child render function as an alternative to `as`', () => {
		const renderer = TestRenderer.create(
			<RovingTabIndex>
				<RovingTabIndexItem>
					{ ( props ) => (
						<TestButton className="my-button" { ...props }>
							Click Me!
						</TestButton>
					) }
				</RovingTabIndexItem>
			</RovingTabIndex>
		);

		expect( renderer.toJSON() ).toMatchSnapshot();
	} );
} );
