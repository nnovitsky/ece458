import React from 'react';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import Button from 'react-bootstrap/esm/Button';

const modelName = "model";
const vendorName = "vendor";
const serialName = "serial";
const descriptionName = "description";

let filters = {
    model_number: '',
    vendor: '',
    serial_number: '',
    description: ''
}

//'onSearch' prop event handler for when the search button is clicked, will receive a filters object ^seen above
// 'onRemoveFilters' prop event handler for when the filters should be removed
// 'onFilterChange' a handler that will be passed ^filters
// 'currentFilter' must match filters ^ 
const InstrumentFilterBar = (props) => {
    filters = props.currentFilter;
    return (
        <Container className="filter-column">
            <Col>
                <h3>Filters</h3>

                <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Form.Control name={modelName} type="text" placeholder="Enter Model Number" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Form.Control name={serialName} type="text" placeholder="Enter Serial" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Form.Control name={descriptionName} type="text" placeholder="Description" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Button className="filter-button" onClick={(e) => onSearch(e, props.onSearch)}>Apply</Button>
                <Button className="filter-button" onClick={() => onClear(props.onRemoveFilters)}>Clear</Button>


            </Col>
        </Container>
    )
}

const onTextInput = (e, filterChange) => {
    switch (e.target.name) {
        case modelName:
            filters.model_number = e.target.value;
            filterChange(filters);
            break;
        case vendorName:
            filters.vendor = e.target.value;
            filterChange(filters);
            break;
        case serialName:
            filters.serial_number = e.target.value;
            filterChange(filters);
            break;
        case descriptionName:
            filters.description = e.target.value;
            filterChange(filters);
            break;
        default:
            break;
    }
}

const onSearch = (e, parentHandler) => {
    parentHandler(filters)
}

const onClear = (parentHandler) => {
    filters = {
        model_number: '',
        vendor: '',
        serial_number: '',
        description: ''
    }
    parentHandler();
}

export default InstrumentFilterBar;