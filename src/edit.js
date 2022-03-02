/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import React from 'react';

import Select, {
	components,
} from 'react-select';
import {
	SortableContainer,
	SortableElement,
	SortableHandle,
} from 'react-sortable-hoc';

function arrayMove(array, from, to) {
	const slicedArray = array.slice();
	slicedArray.splice(
		to < 0 ? array.length + to : to,
		0,
		slicedArray.splice(from, 1)[0]
	);
	return slicedArray;
}

const SortableMultiValue = SortableElement(
	(props) => {
		// this prevents the menu from being opened/closed when the user clicks
		// on a value to begin dragging it. ideally, detecting a click (instead of
		// a drag) would still focus the control and toggle the menu, but that
		// requires some magic with refs that are out of scope for this example
		const onMouseDown = (e) => {
			e.preventDefault();
			e.stopPropagation();
		};
		const innerProps = { ...props.innerProps, onMouseDown };
		return <components.MultiValue {...props} innerProps={innerProps} />;
	}
);

const SortableMultiValueLabel = SortableHandle(
	(props) => <components.MultiValueLabel {...props} />
);

const SortableSelect = SortableContainer(Select);

const MultiSelectSort = (props) => {

	const [selected, setSelected] = React.useState([
		...props.selected
	]);

	const onChange = (newValue) => {
		setSelected(newValue);
		props.onChange(newValue);
	}

	const onSortEnd = ({ oldIndex, newIndex }) => {
		const newValue = arrayMove(selected, oldIndex, newIndex);
		setSelected(newValue);
		props.onChange(newValue)
	};

	return (
		<SortableSelect
			useDragHandle
			// react-sortable-hoc props:
			axis="xy"
			onSortEnd={onSortEnd}
			distance={4}
			// small fix for https://github.com/clauderic/react-sortable-hoc/pull/352:
			getHelperDimensions={({ node }) => node.getBoundingClientRect()}
			// react-select props:
			isMulti
			options={props.options}
			value={selected}
			onChange={onChange}
			components={{
				// @ts-ignore We're failing to provide a required index prop to SortableElement
				MultiValue: SortableMultiValue,
				MultiValueLabel: SortableMultiValueLabel,
			}}
			closeMenuOnSelect={false}
			className='select-input'
		/>
	);
}

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */


export default function Edit({ attributes, setAttributes, pages, isRequesting }) {
	const updatePages = (value) => {
		setAttributes({ selectedPages: value.map(p => p.value) });
	}
	if (isRequesting) {
		return (
			<p {...useBlockProps()}>
				Loading...
			</p>
		)
	}
	if (pages) {
		const options = pages.map(p => { return { value: p.id, label: p.title.rendered } })
		const selectedPages = attributes.selectedPages ? attributes.selectedPages.reduce((acc, cur) => {
			const option = options.find(o => o.value === cur);
			if (option) {
				acc.push(option);
			}
			return acc;
		}, []) : [];
		return (
			<div {...useBlockProps()} >
				<div class="components-placeholder is-large">
					<div class="components-placeholder__label">Page Grid</div>
					<div class="components-placeholder__instructions">Choose the pages to be displayed in the grid.</div>
					<MultiSelectSort
						options={options}
						selected={selectedPages}
						onChange={updatePages}
					/>
				</div>
			</div >
		)
	}
	return (
		<div {...useBlockProps()}>
			<div class="components-placeholder is-large">
				<div class="components-placeholder__label">Page Grid</div>
				<div class="components-placeholder__instructions">No pages found.</div>
			</div>
		</div>
	);
}
