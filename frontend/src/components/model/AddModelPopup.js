import React from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';
import FilterField from '../generic/FilterField';

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new instrument information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'getVendorSearchResults' a handler to be called with part of a vendor searched
//'existingData' this prop is a json object of the style newModel below, null can be passed if no existing model

let newModel = {
    model_number: '',
    vendor: '',
    description: '',
    comment: '',
    calibration_frequency: '',
    pk: null
}

const modelName = "model";
const vendorName = "vendor";
const descriptionName = "description";
const commentName = "comment";
const callibrationName = "callibration";

const addModelPopup = (props) => {
    let body = makeBody(props.getVendorSearchResults);
    return (
        <GenericPopup
            show={props.isShown}
            body={body}
            headerText="Add Model"
            closeButtonText="Cancel"
            submitButtonText="Create Model"
            onClose={props.onClose}
            onSubmit={(e) => onSubmit(e, props.onSubmit)}
            submitButtonVariant="primary"
        />
    )
}

const makeBody = (getVendorSearchResults) => {
    return (
        <Form className="popup">
            <Form.Label>Model Number</Form.Label>
            <Form.Control required type="text" name={modelName} onChange={onTextInput} placeholder="Enter Model Number" />

            <Form.Label>Vendor</Form.Label>
            <FilterField
                onTextInput={onTextInput}
                name={vendorName}
                dropdownResults={getVendorSearchResults(newModel.vendor)}
                fieldName="Enter Vendor"
            />
            <Form.Label>Description</Form.Label>
            <Form.Control required type="text" name={descriptionName} onChange={onTextInput} placeholder="Enter Description" />

            <Form.Label>Comments</Form.Label>
            <Form.Control as="textarea" rows={3} name={commentName} onChange={onTextInput} />

            <Form.Label>Callibration Frequency (days)</Form.Label>
            <Form.Control required type="text" name={callibrationName} onChange={onTextInput} placeholder="Enter Callibration Frequency" />
        </Form>
    )
}

const onTextInput = (e) => {
    let val = e.target.value;
    switch (e.target.name) {
        case modelName:
            newModel.model_number = val
            return;
        case vendorName:
            newModel.vendor = val;
            return;
        case descriptionName:
            newModel.description = val;
            return;
        case commentName:
            newModel.comment = val;
            return
        case callibrationName:
            newModel.calibration_frequency = val;
            return
        default:
            return;
    }
}

const onSubmit = (e, parentHandler) => {
    if (isValid) {
        parentHandler(newModel);
    }
}

const isValid = () => {
    return true;
}

export default addModelPopup;
