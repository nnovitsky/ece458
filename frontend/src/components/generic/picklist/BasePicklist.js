import React, { useState, useLayoutEffect } from 'react';
import Select from 'react-select';

// BasePicklist is for if you just have an array of objects
// to choose from, the other BaseListPicklist is for when you have
// an array of strings to choose from

// selectedCategories: an array of objects that are selected OR an array
// getOptions: an async function that can be called and will return all the options
// type: either 'string' or 'object' acceptable inputs. this corresponds to the selected categories and what getOptions returns, these will both be arrays but either of 'string' or 'object'
// onChange: an event handler that will be passed the array of the selected objects
// placeholderText; text to be displayed in the dropdown
// isMulti: optional, defaults to false if not entered

// the props below can be omitted if the type is of 'string'
// displayField: a string that is the data field of the name to be displayed in the picklist
// valueField: a string that is the data field of the value to be linked to the name

let displayField;
let valueField;
let isMulti;
function BasePicklist(props) {
    const [allOptions, setAllOptions] = useState(null);
    displayField = props.displayField;
    valueField = props.valueField;
    isMulti = props.isMulti;

    // equivalent of componendDidMount
    useLayoutEffect(() => {
        async function fetchData() {
            await props.getOptions().then(result => {
                setAllOptions(formatOptions(result));
            })
        }
        if (!allOptions) {
            fetchData();
        }
    }, [allOptions, props]);

    return (
        <Select
            value={formatSelected(props.selectedCategories)}
            options={allOptions}
            isSearchable={true}
            onChange={(filterList) => { props.onChange(returnFormatOptions(filterList)) }}
            placeholder={props.placeholderText}
            isMulti={props.isMulti}
        />
    )
}

const formatSelected = (input) => {

    if (isMulti) {
        let formatted = [];
        input.map(el => (formatted.push({ label: el[displayField], value: el[valueField] })));
        return formatted;
    } else {
        return { label: input[displayField], value: input[valueField] }
    }

}

const formatOptions = (input) => {

    let formatted = [];
    input.map(el => {
        formatted.push({ label: el[displayField], value: el[valueField] })
    });
    return formatted;

}

const returnFormatOptions = (input) => {

    if (isMulti) {
        let result = [];
        input.map(el => {
            result.push({
                [displayField]: el.label,
                [valueField]: el.value
            })
        });
        return result;
    } else {
        return {
            [displayField]: input.label,
            [valueField]: input.value
        }
    }

}

export default BasePicklist;

BasePicklist.defaultProps = {
    isMulti: false,
    displayField: '',
    valueField: ''
}

