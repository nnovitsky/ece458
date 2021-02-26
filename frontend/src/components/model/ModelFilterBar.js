import React from 'react';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Select from 'react-select';
import Col from 'react-bootstrap/Col';

import Button from 'react-bootstrap/Button';

const modelName = "model";
const vendorName = "vendor";
const descriptionName = "description";

let filters = {
    model_number: '',
    vendor: '',
    description: '',
}

let modelCategories = [];

// 'onSearch" a prop handler that is called when search is clicked, it will be passed a filters object^
// 'onRemoveFilters' a prop that will be called when user wants to remove filters
// 'onFilterChange' a handler that will be passed ^filters
// 'currentFilter' must match filters ^ 
// modelCategories  an array of pk/category pairs
const ModelFilterBar = (props) => {
    filters = props.currentFilter;
    modelCategories = formatCategories(props.modelCategories)
    return (

        <Container className="filter-column">
            <Col>

                <h3>Filters</h3>
                <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={(e) => onTextInput(e, props.onFilterChange)} />
                <Form.Control name={modelName} type="text" placeholder="Enter Model Number" onChange={(e) => onTextInput(e, props.onFilterChange)} />


                <Form.Control name={descriptionName} type="text" placeholder="Enter Description" onChange={(e) => onTextInput(e, props.onFilterChange)} />


                <Select
                    value={formatCategories(props.currentFilter.model_categories)}
                    options={modelCategories}
                    isSearchable={true}
                    onChange={(e) => {onCategoryInput(e, props.onFilterChange)}}
                    placeholder='Model Categories...'
                    isMulti
                />
                <Button onClick={(e) => onSearch(props.onSearch)}>Apply</Button>
                <Button onClick={props.onRemoveFilters}>Clear</Button>
            </Col>


        </Container>

    )
}

const formatCategories = (modelsArr) => {
    return modelsArr.map(el => ({ label: el.name, value: el.pk }));
}

const onTextInput = (e, filterChange) => {
    switch (e.target.name) {
        case modelName:
            filters.model_number = e.target.value;
            filterChange(filters);
            return;
        case vendorName:
            filters.vendor = e.target.value;
            filterChange(filters);
            return;
        case descriptionName:
            filters.description = e.target.value
            filterChange(filters);
            return;
        default:
            return;
    }
}

const onCategoryInput = (e, filterChange) => {
    let formatted = e.map(el => ({ name: el.label, pk: el.value }));
    filters.categories = formatted;
    filterChange(filters);
}

const onSearch = (parentSearch) => {
    parentSearch(filters);
}


export default ModelFilterBar;