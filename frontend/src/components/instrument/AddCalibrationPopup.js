import React, { useState, useEffect } from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import CalibratedWithInput from './CalibratedWithInput';
import "react-datepicker/dist/react-datepicker.css";
//props
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will contain the fields below
//'errors': an array of errors to display
//'isSubmitEnabled': a boolean if the submit button is enabled
//'calibratorCategories': an array of the calibrator category names
//'instrumentPk': the instrument pk of the instrument BEING calibrated
let newCalibration = {
    date: dateToString(new Date()),
    comment: '',
    file: '',
    calibratorInstruments: [],
}

const AddCalibrationPopup = (props) => {
    const [calDate, setCalDate] = useState(new Date());

    useEffect(() => {
        newCalibration = {
            date: dateToString(new Date()),
            comment: '',
            file: '',
            calibratorInstruments: [],
        }
    }, [])

    return (
        <GenericPopup
            show={props.isShown}
            body={makeBody(calDate, setCalDate, props.calibratorCategories, props.instrumentPk)}
            headerText="Add Calibration"
            closeButtonText="Cancel"
            submitButtonText="Submit Calibration"
            onClose={() => preClose(props.onClose)}
            onSubmit={() => preSubmit(props.onSubmit)}
            submitButtonVariant="primary"
            errors={props.errors}
            isPrimaryEnabled={props.isSubmitEnabled}
            hasGreenBackground={false}
        />
    )
}

const makeBody = (calDate, setCalDate, calibratorCategories, instrumentPk) => {
    return (
        <div>
            <Form className="popup">
                <Form.Group>
                    <Form.Label className="required-field">Calibration Date</Form.Label>
                    <div style={{ display: 'block' }}>
                        <DatePicker
                            onChange={(e) => onDateChange(e, setCalDate)}
                            selected={calDate}
                            maxDate={new Date()}
                        />
                    </div>

                    <Form.Text muted>
                        Cannot be in the future
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Comment</Form.Label>
                    <Form.Control as="textarea" rows={3} onChange={onCommentChange} />
                    <Form.Text muted>
                        Max 2000 characters
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Supplement file</Form.Label>
                    <Form.File onChange={onFileChange} accept=".jpg,.jpeg,.png,.gif,.pdf,.xlsx" multiple="" />
                    <Form.Text muted>32MB max. Accepts .PNG, .GIF, .JPG, .JPEG, .PDF, or .XLSX</Form.Text>
                </Form.Group>
                <CalibratedWithInput 
                    onInstrumentChange={onCalibratorInstrumentsChange}
                    calibratorCategories={calibratorCategories}
                    instrumentPk={instrumentPk}
                /> 
            </Form>
        </div>
    )
}

const preClose = (parentHandler) => {
    newCalibration = {
        date: dateToString(new Date()),
        comment: '',
        file: '',
        calibratorInstruments: [],
    }
    parentHandler();
}

const preSubmit = (parentHandler) => {
    console.log(newCalibration);
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

export default AddCalibrationPopup;