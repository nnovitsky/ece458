import React from 'react';
import FilterField from "../generic/FilterField";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ModelServices from '../../api/modelServices';
import InstrumentServices from '../../api/instrumentServices';
import Button from 'react-bootstrap/esm/Button';

let modelServices = new ModelServices();
let instrumentServices = new InstrumentServices();

const modelName = "model";
const vendorName = "vendor";
const callibrationName = "callibrationFrequency";
const descriptionName = "description";

const ModelFilterBar = () => {
    return (
        <div>

            <Container>
                <Row>
                    <Col xs={2}>
                        <h3>Filters</h3>
                    </Col>
                    <Col>

                        <FilterField
                            dropdownResults={modelServices.getAllModelNumbers()}
                            onTextInput={onTextInput}
                            fieldName="Model Number"
                            name={modelName}
                        />
                        <FilterField
                            dropdownResults={modelServices.getAllVendors()}
                            onTextInput={onTextInput}
                            fieldName="Vendor"
                            name={vendorName}
                        />

                    </Col>
                    <Col>

                        <FilterField
                            dropdownResults={instrumentServices.getAllDescriptions()}
                            onTextInput={onTextInput}
                            fieldName="Description"
                            name={descriptionName}
                        />
                        <FilterField
                            dropdownResults={[]}
                            onTextInput={onTextInput}
                            fieldName="Callibration Frequency"
                            name={callibrationName}
                        />
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
            console.log(`Model input: ${e.target.value}`);
            return;
        case vendorName:
            console.log(`Vendor input: ${e.target.value}`);
            return;
        case callibrationName:
            console.log(`Callibration input: ${e.target.value}`);
            return;
        case descriptionName:
            console.log(`Description input: ${e.target.value}`);
            return;
    }
}

export default ModelFilterBar;