import React from 'react';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Button from 'react-bootstrap/esm/Button';

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
        <div>

            <Container>
                <Row>
                    <Col>
                        <h3>Filters</h3>
                        <Form.Group>
                            <Form.Control name={modelName} type="text" placeholder="Enter Model" onChange={onTextInput} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={onTextInput} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control name={descriptionName} type="text" placeholder="Enter Description" onChange={onTextInput} />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Button className="filter-button" onClick={(e) => onSearch(props.onSearch)}>Apply Filters</Button>
                        <Button className="filter-button" onClick={props.onRemoveFilters}>Remove Filters</Button>
                    </Col>
                </Row>


            </Container>
        </div>
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