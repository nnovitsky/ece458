import React, { useState, useEffect } from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import CalibratedWithInput from './CalibratedWithInput';
import "react-datepicker/dist/react-datepicker.css";
//props
// calibrationEvent: calibration event from the cal event search
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will contain the fields below
//'errors': an array of errors to display
//'isSubmitEnabled': a boolean if the submit button is enabled
//'calibratorCategories': an array of the calibrator category names

let newCalibration = {
    comment: '',
}

const CalibrationPopup = (props) => {
    return (
        <GenericPopup
            show={props.isShown}
            body={makeBody()}
            headerText="Add Calibration"
            closeButtonText="Cancel"
            submitButtonText="Submit Calibration"
            onClose={() => preClose(props.onClose)}
            onSubmit={() => preSubmit(props.onSubmit)}
            submitButtonVariant="primary"
            errors={props.errors}
            isPrimaryEnabled={props.isSubmitEnabled}
        />
    )
}

const makeBody = (calDate, setCalDate) => {
    return (
        <div>
            <Form className="popup">
                <Form.Group>
                    <Form.Label className="required-field">Calibration Date</Form.Label>
                    <div style={{ display: 'block' }}>
                        <DatePicker
                            selected={new Date()}
                            disabled={true}
                        />
                    </div>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Comment</Form.Label>
                    <Form.Control as="textarea" rows={3} onChange={onCommentChange} />
                    <Form.Text muted>
                        Max 2000 characters
                    </Form.Text>
                </Form.Group>
            </Form>
        </div>
    )
}

const preClose = (parentHandler) => {
    newCalibration = {
        date: dateToString(new Date()),
        comment: '',
        file: ''
    }
    parentHandler();
}

const preSubmit = (parentHandler) => {
    parentHandler(newCalibration);
}

const onCommentChange = (e) => {
    newCalibration.comment = e.target.value;
}

const onDateChange = (date, setCalDate) => {
    newCalibration.date = dateToString(date)
    setCalDate(date);
}

const onFileChange = (e) => {
    newCalibration.file = e.target.files[0];

}

const onCalibratorInstrumentsChange = (instrumentsArr) => {
    newCalibration.calibratorInstruments = instrumentsArr;
}

export default CalibrationPopup;