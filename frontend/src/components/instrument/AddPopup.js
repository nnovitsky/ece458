import React from 'react';
import Form from "react-bootstrap/Form";
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";
import './instrument.css';
import GenericPopup from "../generic/GenericPopup";
import FilterField from "../generic/FilterField";

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new instrument information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'getModelSearchResults' a handler to be called with part of a model searched

let newInstrument = {
    model: '',
    serial: '',
    comment: '',
    callibration: '',
}

let errorMessages = [];


const AddPopup = (props) => {
    let body = makeBody(props.getModelSearchResults);
    return (
        <GenericPopup
            show={props.isShown}
            body={body}
            headerText="Add Instrument"
            closeButtonText="Cancel"
            submitButtonText="Create"
            onClose={(e) => onClose(e, props.onClose)}
            onSubmit={(e) => onSubmit(e, props.onSubmit)}
        />
    )
}

const makeBody = (getModelSearchResults) => {
    return (
        <Form className="popup">
            <Form.Label>Model</Form.Label>
            <FilterField
                onTextInput={onModelInput}
                name="model"
                dropdownResults={getModelSearchResults(newInstrument.model)}
                fieldName="Enter Model"
            />
            <Form.Label>Serial Number</Form.Label>
            <Form.Control type="text" placeholder="Enter Serial" />

            <Form.Label>Comments</Form.Label>
            <Form.Control as="textarea" rows={3} />
            <DatePicker />
        </Form>
    )
}

//called by the filter field
const onModelInput = (e) => {
    newInstrument.model = e.target.value;
}

const onClose = (e, parentHandler) => {
    parentHandler(e);
}

const onSubmit = (e, parentHandler) => {
    if (isValid) {
        parentHandler(newInstrument);
    }
}

const isValid = () => {
    return true;
}

export default AddPopup;