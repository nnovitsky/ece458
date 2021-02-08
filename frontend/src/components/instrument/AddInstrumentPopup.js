import React from 'react';
import Form from "react-bootstrap/Form";
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";
import './instrument.css';
import GenericPopup from "../generic/GenericPopup";
import FilterField from "../generic/FilterField";


const ex = [{
    label: "1",
    value: "2"
}]
//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new instrument information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'getModelSearchResults' a handler to be called with part of a model searched

let newInstrument = {
    model: '',
    vendor: '',
    serial: '',
    comment: '',
}

let errorMessages = [];


const AddInstrumentPopup = (props) => {
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
            submitButtonVariant="primary"
        />
    )
}

const makeBody = (getModelSearchResults) => {
    return (
        <Form className="popup">
            <Form.Group>
                <Form.Label>Vendor</Form.Label>
                <Select
                    options={ex}
                />
                <Form.Label>Model</Form.Label>
                <Select
                    options={ex}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Serial Number</Form.Label>
                <Form.Control type="text" placeholder="Enter Serial" onChange={onSerialChange} />
                <Form.Text muted>
                    The serial number must be unique to the model.
  </Form.Text>
            </Form.Group>
            <Form.Group>
                <Form.Label>Comments</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={onCommentChange} />
            </Form.Group>



        </Form>
    )
}

//called by the filter field
const onModelInput = (e) => {
    newInstrument.model = e.target.value;
}

const onVendorInput = (e) => {
    newInstrument.vendor = e.target.value;
}

const onSerialChange = (e) => {
    newInstrument.serial = e.target.value;
}

const onCommentChange = (e) => {
    newInstrument.comment = e.target.value;
}

const onClose = (e, parentHandler) => {
    parentHandler(e);
}

const onSubmit = (e, parentHandler) => {
    console.log(newInstrument)
    if (isValid) {
        parentHandler(newInstrument);
    }
}

const isValid = () => {
    return true;
}

export default AddInstrumentPopup;