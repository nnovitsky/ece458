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
const serialName = "serial";
const descriptionName = "description";

const InstrumentFilterBar = () => {
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
                            dropdownResults={instrumentServices.getAllSerialNumbers()}
                            onTextInput={onTextInput}
                            fieldName="Serial Number"
                            name={serialName}
                        />
                        <FilterField
                            dropdownResults={modelServices.getAllDescriptions()}
                            onTextInput={onTextInput}
                            fieldName="Description"
                            name={descriptionName}
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
        case serialName:
            console.log(`Serial input: ${e.target.value}`);
            return;
        case descriptionName:
            console.log(`Description input: ${e.target.value}`);
            return;
    }
}

export default InstrumentFilterBar;