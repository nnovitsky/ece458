import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import Button from 'react-bootstrap/esm/Button';

const modelName = "model";
const vendorName = "vendor";
const serialName = "serial";
const descriptionName = "description";

let filters = {
    model: '',
    vendor: '',
    serial: '',
    description: ''
}

//'onSearch' prop event handler for when the search button is clicked, will receive a 
// filters object ^seen above

const InstrumentFilterBar = (props) => {
    return (
        <div>

            <Container>
                <Row>
                    <Col xs={2}>
                        <h3>Filters</h3>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Control name={modelName} type="text" placeholder="Enter Model" onChange={onTextInput} />
                        </Form.Group>

                        <Form.Group>
                            <Form.Control name={vendorName} type="text" placeholder="Enter Vendor" onChange={onTextInput} />
                        </Form.Group>

                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Control name={serialName} type="text" placeholder="Enter Serial" onChange={onTextInput} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control name={descriptionName} type="text" placeholder="Description" onChange={onTextInput} />
                        </Form.Group>
                    </Col>
                    <Col xs={2}>
                        <Button className="search-button" onClick={(e) => onSearch(e, props.onSearch)}>Search</Button>
                    </Col>
                </Row>


            </Container>
        </div>
    )
}

const onTextInput = (e) => {
    console.log(e.target.value)
    switch (e.target.name) {
        case modelName:
            filters.model = e.target.value;
            break;
        case vendorName:
            filters.vendor = e.target.value;
            break;
        case serialName:
            filters.serial = e.target.value;
            break;
        case descriptionName:
            filters.description = e.target.value;
            break;
    }
}

const onSearch = (e, parentHandler) => {
    parentHandler(filters)
}

export default InstrumentFilterBar;