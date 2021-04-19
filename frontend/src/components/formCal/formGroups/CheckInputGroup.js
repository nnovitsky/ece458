import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';


const checkInputGroup = (props) => {

    return (
        <Form.Group style={{overflow: 'auto'}} className="form-inline"> 
            <Form.Label id={props.id} onClick={props.onChange} className="required-field">{props.label}</Form.Label>
            <Form.Check id={props.id} checked={props.value} onChange={props.onChange}></Form.Check>
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