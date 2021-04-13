import React from 'react';
import Form from 'react-bootstrap/Form';


const numericFormGroup = (props) => {

    let both = props.min === '' || props.min === null ? '' : `Value must be above ${props.min}`
    let maxOrMin = props.max === ''|| props.max === null ? both : `Value must be below ${props.max}`
    let text = ((props.min !== '' && props.min !== null) && (props.max !== '' && props.max !== null)) ? `Value must be between ${props.min} - ${props.max}` : maxOrMin; 

    return (
        <Form.Group className="form-inline">
            <Form.Label className="required-field">{props.label}</Form.Label>
            <Form.Control id={props.id} value={props.value} onChange={props.onChange} style={{marginLeft: "10px"}}type="number"></Form.Control>
            <Form.Label className="subtext">{text}</Form.Label>
        </Form.Group>
    )

}
numericFormGroup.defaultProps = {
    min: "",
    max: "",
    value: "",
    label: "",
    id: "",
    onChange: () => { },
}

export default numericFormGroup;