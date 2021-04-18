import React, { createRef } from 'react';
import Form from 'react-bootstrap/Form';


const numericFormGroup = (props) => {

    let inputRef = createRef();
    let both = props.min === '' || props.min === null ? '' : `Value must be above ${props.min}`
    let maxOrMin = props.max === ''|| props.max === null ? both : `Value must be below ${props.max}`
    let text = ((props.min !== '' && props.min !== null) && (props.max !== '' && props.max !== null)) ? `Value must be between ${props.min} - ${props.max}` : maxOrMin; 

    return (
        <Form.Group className="form-inline">
            <Form.Label className="required-field">{props.label}</Form.Label>
            <Form.Control id={props.id} value={props.value} onChange={props.onChange} style={{marginLeft: "10px"}}type="number" ref={inputRef} onWheel={() => onWheel(inputRef)} ></Form.Control>
            <Form.Label className="subtext">{text}</Form.Label>
        </Form.Group>
    )
}

const onWheel = (inputRef) => {
    inputRef.current.blur();
  };

numericFormGroup.defaultProps = {
    min: "",
    max: "",
    value: "",
    label: "",
    id: "",
    onChange: () => { },
}

export default numericFormGroup;