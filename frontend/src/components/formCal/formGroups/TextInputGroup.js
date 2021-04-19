import React from 'react';
import Form from 'react-bootstrap/Form';


const textInputGroup = (props) => {
    let text = props.expected_string === null || props.expected_string === '' || typeof(props.expected_string) ==='undefined' ? null :`Expected string: ${props.expected_string}`; 
    return (
        <Form.Group style={{overflow: 'auto'}}>
            <Form.Label className="required-field">{props.label}</Form.Label>
            <Form.Control id={props.id} value={props.value} onChange={props.onChange}></Form.Control>
            <Form.Label className="subtext">{text}</Form.Label>
        </Form.Group>
    )

}
textInputGroup.defaultProps = {
    value: "",
    label: "",
    id: "",
    onChange: () => { },
    expected_string: "",
}

export default textInputGroup;