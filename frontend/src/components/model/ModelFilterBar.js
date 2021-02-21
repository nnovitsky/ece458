import React from 'react';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
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

// 'onSearch" a prop handler that is called when search is clicked, it will be passed a filters object^
// 'onRemoveFilters' a prop that will be called when user wants to remove filters
const ModelFilterBar = (props) => {
    return (

            <Container className="filter-column">
                <Col>

                    <h3>Filters</h3>
                    <Form.Control name={modelName} type="text" placeholder="Enter Model Number" onChange={onTextInput} />
                    <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={onTextInput} />

                    <Form.Control name={descriptionName} type="text" placeholder="Enter Description" onChange={onTextInput} />

                    <Button onClick={(e) => onSearch(props.onSearch)}>Apply</Button>
                    <Button onClick={props.onRemoveFilters}>Clear</Button>
                </Col>


            </Container>

    )
}

const onTextInput = (e) => {
    switch (e.target.name) {
        case modelName:
            filters.model_number = e.target.value;
            return;
        case vendorName:
            filters.vendor = e.target.value;
            return;
        case descriptionName:
            filters.description = e.target.value
            return;
        default:
            return;
    }
}

const onSearch = (parentSearch) => {
    parentSearch(filters);
}

export default ModelFilterBar;