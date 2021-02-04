import React, { useState } from 'react';
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

let filters = {
    model: '',
    vendor: '',
    serial: '',
    description: ''
}

//'onFilterChange' 
const InstrumentFilterBar = (props) => {
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
                            onTextInput={(e) => { onTextInput(e, props.onFilterChange) }}
                            fieldName="Model Number"
                            name={modelName}
                        />
                        <FilterField
                            dropdownResults={modelServices.getAllVendors()}
                            onTextInput={(e) => { onTextInput(e, props.onFilterChange) }}
                            fieldName="Vendor"
                            name={vendorName}
                        />
                    </Col>
                    <Col>
                        <FilterField
                            dropdownResults={instrumentServices.getAllSerialNumbers()}
                            onTextInput={(e) => { onTextInput(e, props.onFilterChange) }}
                            fieldName="Serial Number"
                            name={serialName}
                        />
                        <FilterField
                            dropdownResults={instrumentServices.getAllDescriptions()}
                            onTextInput={(e) => { onTextInput(e, props.onFilterChange) }}
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

const onTextInput = (e, onFilterChange) => {
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
    console.log(filters)
    onFilterChange(filters);
}

export default InstrumentFilterBar;