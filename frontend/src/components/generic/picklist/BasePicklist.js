import React, { useState, useEffect } from 'react';
import Select from 'react-select';

// selectedCategories: an array of name to pk pairs of the selected categories
// onFilterChange: an event handler that will be passed the array of selected name/pk pairs
// getCategories: an async function that can be called and will return all the categories in name/pk form
// placeholderText; text to be displayed in the dropdown
// displayField: a string that is the data field of the name to be displayed in the picklist
// valueField: a string that is the data field of the value to be linked to the name
// isMulti: optional, defaults to false if not entered

let displayField;
let valueField;
function BasePicklist(props) {
    const [allCategories, setAllCategories] = useState(null);
    displayField = props.displayField
    valueField = props.valueField;

    console.log(props.selectedCategories)
    // equivalent of componendDidMount
    useEffect(() => {
        async function fetchData() {
            await props.getCategories().then(result => {
                setAllCategories(formatCategories(result));
            })
        }
        if (!allCategories) {
            fetchData();
        }
    }, [allCategories, props]);

    return (
        <Select
            value={formatCategories(props.selectedCategories)}
            options={allCategories}
            isSearchable={true}
            onChange={(filterList) => { props.onFilterChange(returnFormatCategory(filterList)) }}
            placeholder={props.placeholderText}
            isMulti={props.isMulti}
        />
    )
}

const formatCategories = (arr) => {
    if (arr) {
        return arr.map(el => ({ label: el[displayField], value: el[valueField] }));
    } else {
        return [];
    }
}

const returnFormatCategory = (arr) => {
    console.log(arr)
    if (arr) {
        return arr.map(el => ({ [displayField]: el.label, [valueField]: el.value }));
    } else {
        return [];
    }
}

export default BasePicklist;

BasePicklist.defaultProps = {
    isMulti: false,
}

