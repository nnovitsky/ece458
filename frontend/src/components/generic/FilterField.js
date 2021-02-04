import React, { useState } from 'react';

import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from "react-bootstrap/DropdownButton";
import FormControl from 'react-bootstrap/FormControl';


//onTextInput: prop passed in, the function will receive the event and will want to do event.target.value to read what text was entered
//name: prop passed in that will be the name of the target that is returned to the onTextInput handler
let dropdownResults;    //prop of all the dropdown results that should be displayed
let fieldName;  //the displayed name for the field


const FilterField = (props) => {
    // onSearch = props.onSearch;
    // fields = props.fields;
    const [textValue, setTextValue] = useState('');

    dropdownResults = props.dropdownResults;
    fieldName = props.fieldName;

    let dropDownItems = getDropdownItems(setTextValue);
    return (
        <InputGroup>
            <FormControl
                placeholder={fieldName}
                onChange={(e) => {
                    setTextValue(e.target.value);
                    props.onTextInput(e)
                }
                }
                name={props.name}
                aria-describedby="basic-addon2"
                value={textValue}
            />

            <DropdownButton
                as={InputGroup.Append}
                variant="outline-secondary"
                title={"Options"}
            >
                {dropDownItems}
            </DropdownButton>
        </InputGroup>
    )
}

const getDropdownItems = (setTextValue) => {
    let results = [];
    dropdownResults.forEach(el => {
        results.push(
            <Dropdown.Item onClick={(e) => {
                setTextValue(el)
            }} value={el}>{el}</Dropdown.Item>
        )
    })
    return results;
}
export default FilterField;