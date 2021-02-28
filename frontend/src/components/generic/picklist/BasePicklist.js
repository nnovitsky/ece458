import React, { useState, useLayoutEffect } from 'react';
import Select from 'react-select';

// selectedCategories: an array of objects that are selected OR an array
// getOptions: an async function that can be called and will return all the options
// type: either 'string' or 'object' acceptable inputs. this corresponds to the selected categories and what getOptions returns, these will both be arrays but either of 'string' or 'object'
// onFilterChange: an event handler that will be passed the array of the selected objects
// placeholderText; text to be displayed in the dropdown
// isMulti: optional, defaults to false if not entered

// the props below can be omitted if the type is of 'string'
// displayField: a string that is the data field of the name to be displayed in the picklist
// valueField: a string that is the data field of the value to be linked to the name

let displayField;
let valueField;
let type;
let isMulti;
function BasePicklist(props) {
    console.log(props);
    const [allOptions, setAllOptions] = useState(null);
    displayField = props.displayField
    valueField = props.valueField;
    type = props.type;
    isMulti = props.isMulti;

    // equivalent of componendDidMount
    useLayoutEffect(() => {
        async function fetchData() {
            await props.getOptions().then(result => {
                console.log(result);
                setAllOptions(formatOptions(result));
            })
        }
        if (!allOptions) {
            fetchData();
        }
    }, [allOptions, props]);

    console.log(allOptions)
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

const formatSelected = (input) => {
    switch (type) {
        case 'string':
            if (isMulti) {
                let formatted = [];
                input.map(el => (formatted.push({ label: el, value: el })));
                return formatted;
            } else {
                return { label: input, value: input }
            }
        case 'object':
            if (isMulti) {
                let formatted = [];
                input.map(el => (formatted.push({ label: el[displayField], value: el[valueField] })));
                return formatted;
            } else {
                return { label: input[displayField], value: input[valueField] }
            }
        default:
            return { label: '', value: '' }
    }
}

const formatOptions = (input) => {
    console.log(input);
    console.log(type)
    switch (type) {
        case 'string':
            console.log('made it to the right place')
            let stringFormatted = [];
            input.map(el => (stringFormatted.push({ label: el, value: el })));
            return stringFormatted;
        case 'object':
            let formatted = [];
            input.map(el => (formatted.push({ label: el[displayField], value: el[valueField] })));
            return formatted;
        default:
            return [{ label: '', value: '' }]
    }
}

const returnFormatOptions = (input) => {
    switch (type) {
        case 'string':
            if (isMulti) {
                let result = [];
                input.map(el => result.push(el.value));
                return result;
            } else {
                return input.value;
            }
        case 'object':
            if (isMulti) {
                let result = [];
                input.array.forEach(el => {
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
        default:
            return [];
    }
}

export default BasePicklist;

BasePicklist.defaultProps = {
    isMulti: false,
    displayField: '',
    valueField: ''
}

