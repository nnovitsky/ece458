import React from 'react';
import FilterField from "../generic/FilterField";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ModelServices from '../../api/modelServices';
import Button from 'react-bootstrap/esm/Button';

let modelServices = new ModelServices();

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
                            fieldName="Model Number"
                        />
                        <FilterField
                            dropdownResults={modelServices.getAllVendors()}
                            fieldName="Vendor"
                        />
                    </Col>
                    <Col>
                        <FilterField
                            dropdownResults={modelServices.getAllModelNumbers()}
                            fieldName="Serial Number"
                        />
                        <FilterField
                            dropdownResults={modelServices.getAllVendors()}
                            fieldName="Description"
                        />
                    </Col>
                    <Col xs={2}>
                        <Button>Search</Button>
                    </Col>
                </Row>


            </Container>
        </div>
    )
}

export default InstrumentFilterBar;