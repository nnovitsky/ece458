import React from 'react';

import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from "react-bootstrap/DropdownButton";
import FormControl from 'react-bootstrap/FormControl';


let onChange;
let dropdownResults;
let fieldName;

const FilterField = (props) => {
    // onSearch = props.onSearch;
    // fields = props.fields;
    dropdownResults = props.dropdownResults;
    fieldName = props.fieldName;
    return (
        <InputGroup>
            <FormControl
                placeholder={fieldName}
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
            />

            <DropdownButton
                as={InputGroup.Append}
                variant="outline-secondary"
                title="Dropdown"
                id="input-group-dropdown-2"
            >
                {getDropdownItems()}
            </DropdownButton>
        </InputGroup>
    )
}

const getDropdownItems = () => {
    let results = [];
    dropdownResults.forEach(el => {
        results.push(
            <Dropdown.Item>{el}</Dropdown.Item>
        )
    })
    return results;
}
export default FilterField;