/**
 * External dependencies
 */
import { some, groupBy } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	CheckboxControl,
	Button,
	Panel,
	PanelBody,
	PanelRow,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { close, more } from '@wordpress/icons';

function EntityRecordState( { record, checked, onChange } ) {
	return (
		<CheckboxControl
			label={ <strong>{ record.title || __( 'Untitled' ) }</strong> }
			checked={ checked }
			onChange={ onChange }
		/>
	);
}

function EntityTypeList( { list, unselectedEntities, setUnselectedEntities } ) {
	const firstRecord = list[ 0 ];
	const entity = useSelect(
		( select ) =>
			select( 'core' ).getEntity( firstRecord.kind, firstRecord.name ),
		[ firstRecord.kind, firstRecord.name ]
	);

	return (
		<div className="editor-entities-saved-states__entity-type-list">
			<h2>{ entity.label }</h2>
			{ list.map( ( record ) => {
				return (
					<EntityRecordState
						key={ record.key || 'site' }
						record={ record }
						checked={
							! some(
								unselectedEntities,
								( elt ) =>
									elt.kind === record.kind &&
									elt.name === record.name &&
									elt.key === record.key
							)
						}
						onChange={ ( value ) =>
							setUnselectedEntities( record, value )
						}
					/>
				);
			} ) }
		</div>
	);
}

export default function EntitiesSavedStates() {
	const dirtyEntityRecords = useSelect(
		( select ) => select( 'core' ).__experimentalGetDirtyEntityRecords(),
		[]
	);
	const isOpen = useSelect( ( select ) =>
		select( 'core/editor' ).isEntitiesSavedStatesOpen()
	);
	const { saveEditedEntityRecord } = useDispatch( 'core' );
	const { closeEntitiesSavedStatesPanel: closePanel } = useDispatch(
		'core/editor'
	);

	// To group entities by type.
	const partitionedSavables = Object.values(
		groupBy( dirtyEntityRecords, 'name' )
	);

	// Unchecked entities to be ignored by save function.
	const [ unselectedEntities, _setUnselectedEntities ] = useState( [] );

	const setUnselectedEntities = ( { kind, name, key }, checked ) => {
		if ( checked ) {
			_setUnselectedEntities(
				unselectedEntities.filter(
					( elt ) =>
						elt.kind !== kind ||
						elt.name !== name ||
						elt.key !== key
				)
			);
		} else {
			_setUnselectedEntities( [
				...unselectedEntities,
				{ kind, name, key },
			] );
		}
	};

	const saveCheckedEntities = () => {
		const entitiesToSave = dirtyEntityRecords.filter(
			( { kind, name, key } ) => {
				return ! some(
					unselectedEntities,
					( elt ) =>
						elt.kind === kind &&
						elt.name === name &&
						elt.key === key
				);
			}
		);

		entitiesToSave.forEach( ( { kind, name, key } ) => {
			saveEditedEntityRecord( kind, name, key );
		} );

		closePanel( entitiesToSave );
	};

	return isOpen ? (
		<div className="entities-saved-states__panel">
			<div className="entities-saved-states__panel-header">
				<Button
					onClick={ () => closePanel() }
					icon={ close }
					label={ __( 'Close panel' ) }
				/>
			</div>
			{ partitionedSavables.map( ( list ) => {
				return (
					<EntityTypeList
						key={ list[ 0 ].name }
						list={ list }
						unselectedEntities={ unselectedEntities }
						setUnselectedEntities={ setUnselectedEntities }
					/>
				);
			} ) }

			<Button
				isPrimary
				disabled={
					dirtyEntityRecords.length - unselectedEntities.length === 0
				}
				onClick={ saveCheckedEntities }
				className="editor-entities-saved-states__save-button"
			>
				{ __( 'Save' ) }
			</Button>
			<Panel header="My Panel">
				<PanelBody
					title="My Block Settings"
					icon={ more }
					initialOpen={ true }
				>
					<PanelRow>My Panel Inputs and Labels</PanelRow>
				</PanelBody>
			</Panel>
		</div>
	) : null;
}
