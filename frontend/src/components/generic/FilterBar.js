import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

let onSearch;
let fields;

const FilterBar = (props) => {
    onSearch = props.onSearch;
    fields = props.fields;

    return (
        <Container>
            <Row></Row>
        </Container>
    )
}