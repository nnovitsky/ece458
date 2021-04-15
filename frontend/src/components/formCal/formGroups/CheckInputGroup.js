import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';


const checkInputGroup = (props) => {

    return (
        <Form.Group className="form-inline"> 
            <Form.Check className="required-field" id={props.id} label={props.label} checked={props.value} onChange={props.onChange}></Form.Check>
        </Form.Group>
    )

}
checkInputGroup.defaultProps = {
    value: false,
    label: "",
    id: "",
    onChange: (e) => { e.target.checked = !e.target.checked },
}

export default checkInputGroup;