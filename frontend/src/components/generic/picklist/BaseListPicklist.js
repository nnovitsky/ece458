import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

// BaseListPicklist is for if you just have an array of strings
// to choose from, the other BasePicklist is for when you have
// an array of objects to choose from

// selectedCategories: an array of objects that are selected OR an array
// getOptions: an async function that can be called and will return all the options
// onFilterChange: an event handler that will be passed the array of the selected objects
// placeholderText; text to be displayed in the dropdown
// isMulti: optional, defaults to false if not entered
// isCreatable: boolean that defaults to false if not present, if true new items can be created

// the props below can be omitted if the type is of 'string'
// displayField: a string that is the data field of the name to be displayed in the picklist
// valueField: a string that is the data field of the value to be linked to the name

let isMulti;
function BaseListPicklist(props) {
    const [allOptions, setAllOptions] = useState(null);
    isMulti = props.isMulti;

    // equivalent of componendDidMount
    useEffect(() => {
        async function fetchData() {
            await props.getOptions().then(result => {
                setAllOptions(formatOptions(result));
            })
        }
        if (!allOptions) {
            fetchData();
        }
    }, [allOptions, props]);

    if (props.isCreatable) {
        return (
            <CreatableSelect
                value={formatSelected(props.selectedCategories)}
                options={allOptions}
                isSearchable={true}
                onChange={(filterList) => { props.onFilterChange(returnFormatOptions(filterList)) }}
                placeholder={props.placeholderText}
                isMulti={props.isMulti}
            />
        )
    } else {
        return (
            <Select
                value={formatSelected(props.selectedCategories)}
                options={allOptions}
                isSearchable={true}
                onChange={(filterList) => { props.onFilterChange(returnFormatOptions(filterList)) }}
                placeholder={props.placeholderText}
                isMulti={props.isMulti}
            />
        )
    }

}

const formatSelected = (input) => {

    if (isMulti) {
        let formatted = [];
        input.map(el => (formatted.push({ label: el, value: el })));
        return formatted;
    } else {
        return { label: input, value: input }
    }
}

const formatOptions = (input) => {

    console.log('made it to the right place')
    let stringFormatted = [];
    input.map(el => (stringFormatted.push({ label: el, value: el })));
    return stringFormatted;

}

const returnFormatOptions = (input) => {

    if (isMulti) {
        let result = [];
        input.map(el => result.push(el.value));
        return result;
    } else {
        return input.value;
    }

}

export default BaseListPicklist;

BaseListPicklist.defaultProps = {
    isMulti: false,
    isCreatable: false,

}

