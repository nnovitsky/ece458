import React from 'react';
import Form from 'react-bootstrap/Form';


const textInputGroup = (props) => {
    return (
        <Form.Group>
            <Form.Label className="required-field">{props.label}</Form.Label>
            <Form.Control id={props.id} value={props.value} onChange={props.onChange}></Form.Control>
        </Form.Group>
    )

}
textInputGroup.defaultProps = {
    value: "",
    label: "",
    id: "",
    onChange: () => { },
}

export default textInputGroup;