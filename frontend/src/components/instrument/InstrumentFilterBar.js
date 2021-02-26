import React from 'react';

import Container from 'react-bootstrap/Container';
import Select from 'react-select';
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

let modelCategories = [];

//'onSearch' prop event handler for when the search button is clicked, will receive a filters object ^seen above
// 'onRemoveFilters' prop event handler for when the filters should be removed
// 'onFilterChange' a handler that will be passed ^filters
// 'currentFilter' must match filters ^ 
// modelCategories  an array of pk/category pairs
const InstrumentFilterBar = (props) => {
    filters = props.currentFilter;
    modelCategories = formatCategories(props.modelCategories);
    return (
        <Container className="filter-column">
            <Col>
                <h3>Filters</h3>

                <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Form.Control name={modelName} type="text" placeholder="Enter Model Number" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Form.Control name={serialName} type="text" placeholder="Enter Serial" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Form.Control name={descriptionName} type="text" placeholder="Description" onChange={(e) => onTextInput(e, props.onFilterChange)} />

                <Select
                    value={formatCategories(props.currentFilter.model_categories)}
                    options={modelCategories}
                    isSearchable={true}
                    onChange={(e) => { onCategoryInput(e, props.onFilterChange) }}
                    placeholder='Model Categories...'
                    isMulti
                />

                <Button className="filter-button" onClick={(e) => onSearch(e, props.onSearch)}>Apply</Button>
                <Button className="filter-button" onClick={() => onClear(props.onRemoveFilters)}>Clear</Button>


            </Col>
        </Container>
    )
}

const formatCategories = (arr) => {
    return arr.map(el => ({ label: el.name, value: el.pk }));
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

const onCategoryInput = (e, filterChange) => {
    let formatted = e.map(el => ({ name: el.label, pk: el.value }));
    filters.categories = formatted;
    filterChange(filters);
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

InstrumentFilterBar.defaultProps = {
    modelCategories: [],
}