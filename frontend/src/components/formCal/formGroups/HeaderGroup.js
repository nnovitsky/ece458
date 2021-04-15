import React from 'react';
import Form from 'react-bootstrap/Form';


const headerGroup = (props) => {
    return (
        <Form.Group>
            <h5>{props.text}</h5>
        </Form.Group>
    )

}
headerGroup.defaultProps = {
    text: "",
}

export default headerGroup;