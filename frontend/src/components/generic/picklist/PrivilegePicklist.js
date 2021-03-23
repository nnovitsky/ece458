import BasePicklist from './BaseListPicklist';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { PrivilegesDisplayMap } from '../Util';
import AdminServices from "../../../api/adminServices.js";


const adminServices = new AdminServices();

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
            onChange={(privileges) => { props.onChange(mapObjectToArray(privileges, props.pk)) }}
            placeholderText="Privilege..."
            isMulti={true}
            styles={customStyles}
        //maxMenuHeight={100}
        />
    )
}

function mapObjectToArray(object, pk) {
    let result = {
        pk: pk,
        groups: [],
    };

    object.forEach(element => {
        result.groups.push(element.value)
    });

    return result;
}


function mapArrayToObject(input) {
    let result = [];
    input.forEach(element => {
        if (element !== "oauth") {
            let display = PrivilegesDisplayMap[element];
            result.push({
                "label": display,
                "value": element,
            })
        }
    });
    return result;
}

const getTypesPrivilege = async () => {
    return adminServices.getPriviledgeList().then(result => {
        if (result.success) {
            return mapArrayToObject(result.data.groups)
        }
        return []
    })
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
    dropdownIndicator: (base, state) => ({
        ...base,
        margin: -3 -1 -1 -1,
    }),
    clearIndicator: (base, state) => ({
        ...base,
        margin: -1 -3 -1 -1,
    }),
    indicatorSeparator: (base, state) => ({
        ...base,
        width: 0,
        marginLeft: -1,
    }),
};

export default PriviledgePicklist;