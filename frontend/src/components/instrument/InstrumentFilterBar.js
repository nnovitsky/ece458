import React from 'react';
import FilterField from "../generic/FilterField";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const InstrumentFilterBar = () => {
    return (
        <div>
            <Container>
                <Col>
                    <Row>
                        <h3>Filters</h3>
                        <FilterField />
                    </Row>
                </Col>
            </Container>
        </div>
    )
}

export default InstrumentFilterBar;