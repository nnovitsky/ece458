import React from 'react';
import Form from 'react-bootstrap/Form';


const plainTextGroup = (props) => {
    return (
            <Form.Group>
                <Form.Text style={{ whiteSpace: "pre-wrap" }}>{props.text}</Form.Text>
            </Form.Group>
    )

}
plainTextGroup.defaultProps = {
    text: "",
}

export default plainTextGroup;