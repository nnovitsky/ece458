import BasePicklist from './BaseListPicklist';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { PrivilegesDisplayMap } from '../Util';

// selectedCategories: an array of name to pk pairs of the selected categories
// onChange: an event handler that will be passed the array of selected name/pk pairs
function PriviledgePicklist(props) {
    const [allOptions, setAllOptions] = useState(null);
    useEffect(() => {
        async function fetchData() {
            let result = await getTypesPrivilege();
            setAllOptions(result);
        }
        if (!allOptions) {
            fetchData();
        }
    }, [allOptions]);

    return (
        <Select
            value={mapArrayToObject(props.selectedPrivileges)}
            options={allOptions}
            isSearchable={false}
            onChange={(privileges) => { props.onChange(mapObjectToArray(privileges)) }}
            placeholderText="Privilege..."
            isMulti={true}
            styles={customStyles}
            //maxMenuHeight={100}
        />
    )
}

function mapObjectToArray(object) {
    let result = [];
    object.forEach(element => {
        result.push(element.value)
    });
    return result;
}


function mapArrayToObject(input) {
    let result = [];
    input.forEach(element => {
        let display = PrivilegesDisplayMap[element];
        result.push({
            "label": display,
            "value": element,
        })
    });
    return result;
}

async function getTypesPrivilege() {
    return mapArrayToObject(['admin', 'oauth', 'model', 'instrument', 'cali']);
}

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? 0 : 0,
        boxShadow: state.isFocused ? 0 : 0,
        '&:hover': {
            border: state.isFocused ? 0 : 0
        },
        backgroundColor: 'none',
        width: '100%'
    }),
};

export default PriviledgePicklist;