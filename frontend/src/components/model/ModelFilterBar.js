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
    model: '',
    vendor: '',
    description: '',
}

const ModelFilterBar = () => {
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
                    <Col xs={2}>
                        <Button className="search-button">Search</Button>
                    </Col>
                </Row>


            </Container>
        </div>
    )
}

const onTextInput = (e) => {
    switch (e.target.name) {
        case modelName:
            filters.modelName = e.target.value;
            console.log(`Model input: ${e.target.value}`);
            return;
        case vendorName:
            filters.vendorName = e.target.value;
            console.log(`Vendor input: ${e.target.value}`);
            return;
        case descriptionName:
            filters.descriptionName = e.target.value
            console.log(`Description input: ${e.target.value}`);
            return;
        default:
            return;
    }
}

export default ModelFilterBar;